import { POSTS_PER_PAGE, getPostLikes } from "@/lib/helpers"
import type { SupaClient, DB, PostWithoutAuthorDetails } from "@/lib/types"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useInfiniteQuery } from "@tanstack/react-query"

export const useUserPosts = (username: string, initialData?: PostWithoutAuthorDetails[] | null) => {
  const client = useSupabaseClient<DB>()
  return useInfiniteQuery({
    queryKey: ["userPosts", username],
    queryFn: ({ pageParam = 0 }) => getUserPosts(client, username, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.previousPage,
    staleTime: 60 * 1000 * 10, // 10 minute
    initialData: initialData
      ? {
          pages: [
            {
              data: initialData,
              nextPage: 1,
              previousPage: null,
            },
          ],
          pageParams: [],
        }
      : undefined,
  })
}

const getUserPosts = async (client: SupaClient, username: string, pageParam: number) => {
  const { data } = await client
    .from("posts")
    .select("id, title, content, created_at")
    .eq("author", username)
    .order("created_at", { ascending: false })
    .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1)

  if (!data) return { data: [], nextPage: null, previousPage: null }

  const postsWithLikes = data.map((post) => ({
    ...post,
    likes: 0,
  }))

  const likes = await Promise.all(
    data.map((post) => post.id).map((postId) => getPostLikes(postId, client))
  )

  likes.map((like) => {
    const post = postsWithLikes.find((post) => post.id === like.post_id)

    if (post) {
      postsWithLikes[postsWithLikes.indexOf(post)].likes = like.count
    }
  })

  return {
    data: postsWithLikes,
    nextPage: postsWithLikes && postsWithLikes.length >= POSTS_PER_PAGE ? pageParam + 1 : null,
    previousPage: pageParam > 0 ? pageParam - 1 : null,
  }
}
