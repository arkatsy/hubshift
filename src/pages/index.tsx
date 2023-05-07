import { useIsNewUser } from "@/hooks/useIsNewUser"
import { Database } from "@/lib/dbtypes"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"

export async function getServerSideProps(ctxt: GetServerSidePropsContext) {
  const supabase = createServerSupabaseClient<Database>(ctxt)

  return {
    props: {},
  }
}

export default function Home() {
  const supabase = useSupabaseClient()
  const { data: isNewUser, isLoading, status, error } = useIsNewUser()
  const router = useRouter()

  if (!isLoading && isNewUser) {
    router.push("/welcome")
  }

  return (
    <div>
      <button onClick={() => supabase.auth.signOut()}>sign out</button>
    </div>
  )
}
