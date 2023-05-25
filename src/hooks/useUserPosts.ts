import { POSTS_PER_PAGE } from "@/lib/helpers"
import type { SupaClient, DB, PostWithoutAuthorDetails } from "@/lib/types"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useInfiniteQuery } from "@tanstack/react-query"

export const useUserPosts = (username: string, initialData?: PostWithoutAuthorDetails[] | null) => {
  const client = useSupabaseClient<DB>()
  return useInfiniteQuery({
    queryKey: ["userPosts", username],
    queryFn: ({ pageParam = 0 }) => getMyPosts(client, username, pageParam),
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

const getMyPosts = async (client: SupaClient, username: string, pageParam: number) => {
  const { data } = await client
    .from("posts")
    .select("id, title, content, created_at")
    .eq("author", username)
    .order("created_at", { ascending: false })
    .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1)

  return {
    data,
    nextPage: data && data.length >= POSTS_PER_PAGE ? pageParam + 1 : null,
    previousPage: pageParam > 0 ? pageParam - 1 : null,
  }
}
