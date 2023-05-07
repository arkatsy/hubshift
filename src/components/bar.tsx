import { Brand } from "@/components"
import { Database } from "@/lib/dbtypes"
import { ThemeContext } from "@/pages/_app"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { GetServerSideProps } from "next"
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
