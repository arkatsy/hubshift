import { type Database } from "@/lib/dbtypes"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useQuery } from "@tanstack/react-query"

export const useProfile = (id: string, initialData?: any) => {
  const client = useSupabaseClient<Database>()
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => getProfile(client, id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: Boolean(id),
    initialData,
  })
}

const getProfile = async (client: SupabaseClient, id: string) => {
  const { data } = await client
    .from("user_profiles")
    .select("id, username, avatar_url, bio")
    .eq("id", id)
    .single()

  return data
}
