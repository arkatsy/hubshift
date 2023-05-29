import type { DB, SupaClient, PostWithAuthorDetails } from "@/lib/types"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { POSTS_PER_PAGE, getPostLikes } from "@/lib/helpers"

export const useAllPosts = (initialData?: PostWithAuthorDetails[]) => {
  const client = useSupabaseClient<DB>()
  return useInfiniteQuery({
    queryKey: ["allPosts"],
    queryFn: ({ pageParam = 0 }) => fetchPosts(client, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.previousPage,
    staleTime: 1000 * 60 * 2, // 2 minutes
    initialData: initialData && {
      pages: [
        {
          data: initialData,
          nextPage: 1,
          previousPage: null,
        },
      ],
      pageParams: [],
    },
  })
}

const fetchPosts = async (client: SupaClient, pageParam: number) => {
  const { data: posts } = await client
    .from("posts")
    .select("id, title, content, created_at, author")
    .order("created_at", { ascending: false })
    .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1)

  if (!posts)
    return {
      data: [],
      nextPage: null,
      previousPage: null,
    }

  const authors = new Set<string>()
  const postsWithAuthorData: PostWithAuthorDetails[] = posts.map((post) => ({
    ...post,
    author: {
      id: "",
      username: "",
      avatar_url: "",
      bio: "",
    },
    likes: 0,
  }))

  // Removing duplicate authors by using a Set
  posts.forEach((post) => authors.add(post.author))

  const { data: authorData } = await client
    .from("user_profiles")
    .select("id, username, avatar_url, bio")
    .in("username", Array.from(authors))

  if (!authorData)
    return {
      data: [],
      nextPage: null,
      previousPage: null,
    }

  posts.map((post, id) => {
    // Find the author data for each post
    const author = authorData.find((author) => author.username === post.author)

    if (author) {
      postsWithAuthorData[id]["author"] = author
    }
  })

  // Get likes for each post
  const likes = await Promise.all(
    posts.map((post) => post.id).map((postId) => getPostLikes(postId, client))
  )

  likes.map((like) => {
    let post = postsWithAuthorData.find((post) => post.id === like.post_id)

    if (post) {
      post.likes = like.count
    }
  })

  const nextPage = posts && posts.length >= POSTS_PER_PAGE ? pageParam + 1 : null
  const previousPage = pageParam > 0 ? pageParam - 1 : null

  return {
    data: postsWithAuthorData,
    nextPage,
    previousPage,
  }
}
