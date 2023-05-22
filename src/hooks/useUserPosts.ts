import { type Database } from "@/lib/dbtypes"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useInfiniteQuery } from "@tanstack/react-query"

const POSTS_PER_PAGE = 10

export const useUserPosts = (username: string) => {
  const client = useSupabaseClient<Database>()
  return useInfiniteQuery({
    queryKey: ["myPosts"],
    queryFn: ({ pageParam = 0 }) => getMyPosts(client, username, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.previousPage,
    staleTime: 60 * 1000 * 10, // 10 minute
  })
}

const getMyPosts = async (client: SupabaseClient, username: string, pageParam: number) => {
  const { data } = await client
    .from("posts")
    .select("id, title, content, created_at")
    .eq("author", username)
    .order("created_at", { ascending: false })
    .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1)

  return {
    data,
    nextPage: data && data.length >= POSTS_PER_PAGE ? pageParam + 1 : undefined,
    previousPage: pageParam > 0 ? pageParam - 1 : undefined,
  }
}
