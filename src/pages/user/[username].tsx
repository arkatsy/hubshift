import { Database } from "@/lib/dbtypes"
import { SupabaseClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { useRouter } from "next/router"

type RemoveObjectNullValues<Obj> = {
  [Key in keyof Obj]: Obj[Key] extends null ? never : Key
}

type ProfileData = RemoveObjectNullValues<Database["public"]["Tables"]["user_profiles"]["Row"]>

type UserProfilePageProps = {
  userProfile: Omit<ProfileData, "id">
}

const getPublicProfile = async (client: SupabaseClient, username: string) => {
  return await client
    .from("user_profiles")
    .select("username, avatar_url, bio")
    .eq("username", username)
    .single()
}

type UserProfilePageQuery = {
  username: string
}

export const getServerSideProps: GetServerSideProps<UserProfilePageProps> = async (ctxt) => {
  const supabase = createServerSupabaseClient<Database>(ctxt)
  const query = ctxt.query as UserProfilePageQuery

  const { data, error } = await getPublicProfile(supabase, query.username)
  if (error) {
    console.error(error)
  }

  if (!data) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      userProfile: data,
    },
  }
}

export default function UserProfilePage({
  userProfile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()

  return (
    <div className="">
      <pre>
        <code>{JSON.stringify(userProfile, null, 2)}</code>
      </pre>
    </div>
  )
}
