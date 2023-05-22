import { type Database } from "@/lib/dbtypes"
import { type SupabaseClient, useUser, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"

export const useIsNewUser = () => {
  const client = useSupabaseClient<Database>()
  const user = useUser()

  return useQuery({
    queryKey: ["isNewUser"],
    queryFn: () => fetchUserIdWithId(client, user!.id),
    enabled: Boolean(user),
    staleTime: Infinity,
    placeholderData: false,
  })
}

export const fetchUserIdWithId = async (client: SupabaseClient<Database>, id: string) => {
  const { data } = await client.from("user_profiles").select("id").eq("id", id).single()
  return !data?.id
}
