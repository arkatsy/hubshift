import { Brand } from "@/components"
import type { Database } from "@/lib/dbtypes"
import { ThemeContext } from "@/lib/theme"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { GetServerSideProps } from "next"
import { useContext } from "react"

export const getServerSideProps: GetServerSideProps = async (ctxt) => {
  const supabase = createServerSupabaseClient<Database>(ctxt)

  return {
    props: {},
  }
}

export function Bar() {
  const { theme, toggleTheme } = useContext(ThemeContext)
  return (
    <div>
      <Brand isLink={true} />
      <button onClick={toggleTheme}>toggle theme</button>
    </div>
  )
}
