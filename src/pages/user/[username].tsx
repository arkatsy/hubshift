import { PostCard } from "@/components/postCard"
import { useUserPosts } from "@/hooks/useUserPosts"
import { type Database } from "@/lib/dbtypes"
import { SupabaseClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import Image from "next/image"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Spinner } from "@/components/spinner"

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

  const { data } = await getPublicProfile(supabase, query.username)

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
  const { ref, inView } = useInView()
  const {
    data,
    hasNextPage,
    fetchNextPage,
  } = useUserPosts(userProfile.username)

  // Fetching next page when we reach the bottom of the page
  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage])

  return (
    <div className="mt-12 flex flex-col items-center">
      <Image
        priority={true}
        src={userProfile.avatar_url}
        alt="Avatar"
        width={100}
        height={100}
        className="select-none rounded-full w-24 h-24"
      />
      <p className="mt-4 text-2xl font-bold">@{userProfile.username}</p>
      <p className="mb-8 mt-2 text-lg">{userProfile.bio}</p>
      <div className="w-full">
        {data && data.pages.map((page, idx) => (
          <div key={idx} className="mb-8 flex flex-col gap-8">
            {page.data?.map((post) => (
              <PostCard
                postId={post.id}
                authorAvatar={userProfile.avatar_url}
                authorUsername={userProfile.username}
                key={post.id}
                createdAt={post.created_at}
                postTitle={post.title}
              />
            ))}
          </div>
        ))}
      </div>
      {hasNextPage && <div ref={ref} className="flex justify-center w-full">
        <Spinner /></div>}
    </div>
  )
}
