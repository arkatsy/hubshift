import { PostCard } from "@/components/postCard"
import { useUserPosts } from "@/hooks/useUserPosts"
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next"
import Image from "next/image"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Spinner } from "@/components/spinner"
import type { PostWithoutAuthorDetails, UserProfile } from "@/lib/types"
import { getAllUsernames, getUserPosts, getUserProfile } from "@/lib/helpers"

type UserProfilePageProps = {
  user: UserProfile
  posts: PostWithoutAuthorDetails[] | null
}

export const getStaticPaths: GetStaticPaths = async () => {
  const usernames = await getAllUsernames()
  if (!usernames) return { paths: [], fallback: "blocking" }

  const paths = usernames.map((user) => `/user/${user.username}`)

  return {
    paths,
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps<UserProfilePageProps> = async (ctxt) => {
  const { username } = ctxt.params as { username: string }
  const userData = await getUserProfile(username)

  if (!userData) {
    return {
      notFound: true,
    }
  }

  const userPosts = await getUserPosts(username)

  return {
    props: {
      user: userData,
      posts: userPosts,
    },
    revalidate: 45,
  }
}

export default function UserProfilePage({
  user,
  posts,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { ref, inView } = useInView()
  const { data, hasNextPage, fetchNextPage } = useUserPosts(user.username, posts)

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
        src={user.avatar_url}
        alt="Avatar"
        width={100}
        height={100}
        className="h-24 w-24 select-none rounded-full"
      />
      <p className="mt-4 text-2xl font-bold">@{user.username}</p>
      <p className="mb-8 mt-2 text-lg">{user.bio}</p>
      <div className="w-full">
        {data &&
          data.pages.map((page, idx) => (
            <div key={idx} className="mb-8 flex flex-col gap-8">
              {page.data?.map((post) => (
                <PostCard
                  postId={post.id}
                  authorAvatar={user.avatar_url}
                  authorUsername={user.username}
                  key={post.id}
                  createdAt={post.created_at}
                  postTitle={post.title}
                  likes={post.likes}
                />
              ))}
            </div>
          ))}
      </div>
      {hasNextPage && (
        <div ref={ref} className="flex w-full justify-center">
          <Spinner />
        </div>
      )}
    </div>
  )
}
