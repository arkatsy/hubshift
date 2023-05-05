import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"

export default function Home() {
  const user = useUser()
  const supabase = useSupabaseClient()

  return (
    <div>
      <button onClick={() => supabase.auth.signOut()}>sign out</button>
    </div>
  )
}
