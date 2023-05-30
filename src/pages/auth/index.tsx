import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Auth } from "@supabase/auth-ui-react"
import { useContext, useEffect, useState } from "react"
import { ThemeContext } from "@/lib/theme"
import { HubShiftTheme } from "@/lib/auth-ui-theme"
import { BrandWithOrWithoutLink as Brand } from "@/components/brand"
import { type GetServerSidePropsContext } from "next"
import { getServerAuthStatus } from "@/lib/helpers"
import Head from "next/head"

export async function getServerSideProps(ctxt: GetServerSidePropsContext) {
  const { session } = await getServerAuthStatus(ctxt)

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}

export default function AuthPage() {
  const supabase = useSupabaseClient()
  const { theme } = useContext(ThemeContext)
  const [mounted, setRemount] = useState<typeof theme | undefined>(undefined)

  useEffect(() => {
    setRemount(theme)
  }, [theme])

  return (
    <>
      <Head>
        <title>HubShift - Login</title>
      </Head>
      <div className="mx-auto mt-8 max-w-lg sm:mt-10">
        <div className="hidden flex-col items-center justify-center sm:mb-4 sm:flex">
          <span className="select-none text-3xl font-bold tracking-tight">Welcome To</span>
          <Brand isLink={false} className="-mt-1 select-none text-3xl" />
        </div>
        <Auth
          supabaseClient={supabase}
          providers={["google", "github"]}
          socialLayout="vertical"
          theme={mounted}
          appearance={{ theme: HubShiftTheme }}
          redirectTo="/"
        />
      </div>
    </>
  )
}
