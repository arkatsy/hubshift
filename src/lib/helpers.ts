import {
  Session,
  createServerSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { Database } from "./dbtypes"
import { GetServerSidePropsContext } from "next"

export async function getSession(
  ctxt: GetServerSidePropsContext
): Promise<Session | null> {
  const supabase = createServerSupabaseClient<Database>(ctxt)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}
