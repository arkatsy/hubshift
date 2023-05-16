import { useIsNewUser } from "@/hooks/useIsNewUser"
import { getServerAuthStatus } from "@/lib/helpers"
import { User, useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { GetServerSidePropsContext } from "next"
import { useRouter } from "next/router"

export async function getServerSideProps(ctxt: GetServerSidePropsContext) {
  const { user } = await getServerAuthStatus(ctxt)

  return {
    props: {
      user,
    },
  }
}

type FeedPageProps = {
  user: User | null
}

export default function FeedPage({ user }: FeedPageProps) {
  const supabase = useSupabaseClient()
  const { data: isNewUser, isLoading } = useIsNewUser(supabase)
  const router = useRouter()

  const queryClient = useQueryClient()

  let { fromWelcome } = router.query
  const isFromWelcome = fromWelcome === "true"

  // If we are not from the welcome page and is new user, we
  // redirect to the welcome page
  if (!isFromWelcome && !isLoading && isNewUser) {
    router.push("/welcome")
  }

  // If we just came from the welcome page, we invalidate the proper queries
  // and then we remove the query param
  if (isFromWelcome && !isLoading && user) {
    queryClient.invalidateQueries({
      queryKey: ["isNewUser"],
    })

    queryClient.invalidateQueries({
      queryKey: ["myprofile", user.id],
    })

    router.push("/", undefined, { shallow: true })
  }

  return (
    <main className="mt-8">
      <h1 className="text-2xl font-bold">Feed</h1>
    </main>
  )
}
