import { type SupabaseClient } from "@supabase/supabase-js"
import { useQuery } from "@tanstack/react-query"

export const useIsUsernameAvailable = (client: SupabaseClient, username: string) => {
  return useQuery({
    queryKey: ["isUsernameAvailable", username],
    queryFn: () => fetchUsername(client, username),
    staleTime: 60 * 1000, // 1 min
    enabled: Boolean(username),
  })
}

const fetchUsername = async (client: SupabaseClient, username: string) => {
  const { data } = await client
    .from("user_profiles")
    .select("username")
    .eq("username", username)
    .single()

  return { isAvailable: !data?.username, username }
}
