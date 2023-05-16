import { Session, SupabaseClient } from "@supabase/supabase-js"
import { useQuery } from "@tanstack/react-query"

export const useMyProfile = (client: SupabaseClient, session: Session | null) => {
  const id = session?.user.id

  return useQuery({
    queryKey: ["myprofile", id],
    queryFn: () => getMyProfile(client, id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

const getMyProfile = async (client: SupabaseClient, id: string) => {
  const { data } = await client
    .from("user_profiles")
    .select("username, avatar_url, bio")
    .eq("id", id)
    .single()

  return data
}
