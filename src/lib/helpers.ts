import { type Session, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./dbtypes"
import type { GetServerSidePropsContext } from "next"
import type { User } from "@supabase/supabase-js"

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
