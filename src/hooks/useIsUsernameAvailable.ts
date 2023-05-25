import type { SupaClient, DB } from "@/lib/types"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"

export const useIsUsernameAvailable = (username: string) => {
  const client = useSupabaseClient<DB>()
  return useQuery({
    queryKey: ["isUsernameAvailable", username],
    queryFn: () => fetchUsername(client, username),
    staleTime: 60 * 1000, // 1 min
    enabled: Boolean(username),
  })
}

const fetchUsername = async (client: SupaClient, username: string) => {
  const { data } = await client
    .from("user_profiles")
    .select("username")
    .eq("username", username)
    .single()

  return { isAvailable: !data?.username, username }
}
