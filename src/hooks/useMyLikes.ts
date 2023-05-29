import type { SupaClient, DB } from "@/lib/types"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"

export const useMyLikes = () => {
  const client = useSupabaseClient<DB>()
  const session = useSession()

  return useQuery({
    queryKey: ["myLikes"],
    queryFn: () => getMyLikes(client, session?.user.id!),
    staleTime: 60 * 1000 * 10, // 10 minute
    enabled: Boolean(session),
  })
}

const getMyLikes = async (client: SupaClient, userId: string) => {
  const { data: likes } = await client
    .from("likes")
    .select("post_id", { count: "exact" })
    .eq("user_id", userId)

  if (!likes) return []

  return likes.map((like) => like.post_id!)
}
