import { Database } from "@/lib/dbtypes"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"

export const useIsNewUser = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useUser()

  return useQuery({
    queryKey: ["isNewUser"],
    queryFn: async () => {
      const { data } = await supabase.from("user_profiles").select("id").eq("id", user?.id).single()

      return !data
    },
    enabled: Boolean(user),
    staleTime: Infinity,
  })
}
