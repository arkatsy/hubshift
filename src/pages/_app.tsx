import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { SessionContextProvider, type Session } from "@supabase/auth-helpers-react"
import { Open_Sans, Nunito_Sans, Quicksand } from "next/font/google"
import { useState } from "react"
import { Bar } from "@/components/bar"
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/dbtypes"
import { ThemeProvider } from "@/lib/theme"
import { Toaster } from "react-hot-toast"

// Fonts
const open_sans = Open_Sans({
  display: "swap",
  variable: "--font-open-sans",
  subsets: ["latin"],
})

const nunito_sans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
})

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
})

const fontVariables = [open_sans, nunito_sans, quicksand].map((font) => font.variable).join(" ")

// React query
const queryClient = new QueryClient()
1
// Layouts
const APP_PADDING = {
  bar: "px-4 md:px-8",
  content: "px-4 md:px-8",
}

type LayoutBaseProps = {
  children: React.ReactNode
}

function TopBarLayout({ children }: LayoutBaseProps) {
  return <header className={`${APP_PADDING.bar} w-full max-w-[1380px]`}>{children}</header>
}

function Layout({ children }: LayoutBaseProps) {
  return (
    <div className="font-sans">
      <div
        className="sticky top-0 flex h-16 items-center justify-center border-b border-zinc-200 
      bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
      >
        <TopBarLayout>
          <Bar />
        </TopBarLayout>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-[1380px]">
          <div className={APP_PADDING.content}>{children}</div>
        </div>
      </div>
    </div>
  )
}

// Notifications
const Notifications = () => (
  <Toaster
    position="bottom-right"
    toastOptions={{
      duration: 4000,
    }}
  />
)

// App
export default function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session
}>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient<Database>())
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${nunito_sans.style.fontFamily}, ${open_sans.style.fontFamily};
        }
      `}</style>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <div className={fontVariables}>
              <Layout>
                <Component {...pageProps} />
                <Notifications />
              </Layout>
            </div>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SessionContextProvider>
    </>
  )
}
