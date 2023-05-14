import { useIsNewUser } from "@/hooks/useIsNewUser"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"

export async function getServerSideProps(ctxt: GetServerSidePropsContext) {
  return {
    props: {},
  }
}

export default function FeedPage() {
  const supabase = useSupabaseClient()
  const { data: isNewUser, isLoading } = useIsNewUser(supabase)
  const router = useRouter()

  // prevent redirect loop after creating a new users profile
  let { fromWelcome } = router.query
  if (!(fromWelcome === "true") && !isLoading && isNewUser) {
    router.push("/welcome")
  }

  return (
    <div>
      <button onClick={() => supabase.auth.signOut()}>sign out</button>
    </div>
  )
}
