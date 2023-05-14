import { SupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"

export const useIsNewUser = (client: SupabaseClient) => {
  const user = useUser()

  return useQuery({
    queryKey: ["isNewUser"],
    queryFn: () => fetchUserIdWithId(client, user!.id),
    enabled: !!user,
    staleTime: Infinity,
    placeholderData: false,
  })
}

export const fetchUserIdWithId = async (client: SupabaseClient, id: string) => {
  const res = await client.from("user_profiles").select("id").eq("id", id).single()
  return !res?.data?.id
}
