import { PostCard } from "@/components/postCard"
import { useIsNewUser } from "@/hooks/useIsNewUser"
import { useAllPosts } from "@/hooks/useAllPosts"
import { useUser } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { Spinner } from "@/components/spinner"
import { supabase as client } from "@/lib/supabaseClient"
import type { PostWithAuthorDetails } from "@/lib/types"
import { getRecentPosts } from "@/lib/helpers"
import type { GetStaticProps, InferGetStaticPropsType } from "next"
import { ArrowPathIcon as RefreshIcon } from "@heroicons/react/20/solid"

type FeedPageProps = {
  posts: PostWithAuthorDetails[]
}

export const getStaticProps: GetStaticProps<FeedPageProps> = async () => {
  const authors = new Set<string>()
  const postsWithAuthorData: PostWithAuthorDetails[] = []

  const posts = await getRecentPosts()

  posts.map((post) => {
    authors.add(post.author)
    postsWithAuthorData.push({
      ...post,
      author: {
        id: "",
        username: "",
        avatar_url: "",
        bio: "",
      },
    })
    return post
  })

  const { data: authorData } = await client
    .from("user_profiles")
    .select("id, username, avatar_url, bio")
    .in("username", Array.from(authors))

  if (!authorData)
    return {
      notFound: true,
    }

  posts.map((post, id) => {
    const author = authorData.find((author) => author.username === post.author)

    if (author) postsWithAuthorData[id].author = author
  })

  return {
    props: {
      posts: postsWithAuthorData,
    },
    revalidate: 30,
  }
}

export default function FeedPage({ posts }: InferGetStaticPropsType<typeof getStaticProps>) {
  const user = useUser()
  const { data: isNewUser, isLoading } = useIsNewUser()
  const router = useRouter()

  const { data, fetchNextPage, hasNextPage, isFetching } = useAllPosts(posts)

  const { ref, inView } = useInView()

  // Fetching next page when we reach the bottom of the page
  useEffect(() => {
    if (inView) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage])

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

  const handleRefreshFeed = () => queryClient.invalidateQueries(["allPosts"])

  return (
    <main className="mt-10">
      <div className="mb-12 flex items-center gap-4">
        <h1 className="text-4xl font-bold">Feed</h1>
        <button
          onClick={handleRefreshFeed}
          className="rounded-full bg-zinc-200 px-2 py-2 hover:bg-zinc-300 active:bg-zinc-400"
        >
          <RefreshIcon className="h-5 w-5 text-zinc-800" />
        </button>
      </div>
      {isFetching && (<div className="flex justify-center w-full pt-2 pb-14">
        <Spinner />
      </div>)}
      {data?.pages.map((page, idx) => (
        <div key={idx} className="mb-8 flex flex-col gap-8">
          {page.data?.map((post) => (
            <PostCard
              postId={post.id}
              key={post.id}
              authorAvatar={post.author.avatar_url}
              authorUsername={post.author.username}
              createdAt={post.created_at}
              postTitle={post.title}
            />
          ))}
        </div>
      ))}
      {hasNextPage && (
        <div ref={ref} className="flex w-full justify-center ">
          <Spinner />
        </div>
      )}
    </main>
  )
}
