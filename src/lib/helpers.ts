import { Session, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "./dbtypes"
import { GetServerSidePropsContext } from "next"
import { User } from "@supabase/supabase-js"

export async function getServerAuthStatus(ctxt: GetServerSidePropsContext): Promise<{
  session: Session | null
  user: User | null
}> {
  const supabase = createServerSupabaseClient<Database>(ctxt)

  const [sessionResult, userResult] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
  ])

  return {
    session: sessionResult.data.session,
    user: userResult.data.user,
  }
}
