import type { SupaClient, DB, UserProfile } from "@/lib/types"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"

export const useProfile = (id: string, initialData?: UserProfile) => {
  const client = useSupabaseClient<DB>()
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => getProfile(client, id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: Boolean(id),
    initialData,
  })
}

const getProfile = async (client: SupaClient, id: string) => {
  const { data } = await client
    .from("user_profiles")
    .select("id, username, avatar_url, bio")
    .eq("id", id)
    .single()

  return data
}
