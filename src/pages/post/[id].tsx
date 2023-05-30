import { usePost } from "@/hooks/usePost"
import { useRouter } from "next/router"
import Image from "next/image"
import Link from "next/link"
import { Spinner } from "@/components/spinner"
import dynamic from "next/dynamic"
import type { InferGetStaticPropsType, GetStaticProps, GetStaticPaths } from "next"
import type { PostWithAuthorDetails } from "@/lib/types"
import { getAllUsers, getPost, getUserPosts, getUserProfile } from "@/lib/helpers"
import Head from "next/head"

export const getStaticPaths: GetStaticPaths = async () => {
  // Fetch all the users
  const users = await getAllUsers()

  // Fetch all the posts from all the users
  const posts = (await Promise.all(users.map((user) => getUserPosts(user.username)))).flat()

  const paths = posts.map((post) => ({
    params: {
      id: `/post/${post.id}`,
    },
  }))

  return {
    paths,
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps<{
  post: PostWithAuthorDetails
}> = async (ctxt) => {
  const { id } = ctxt.params as { id: string }
  const post = await getPost(id)

  if (!post) {
    return {
      notFound: true,
    }
  }

  const postWithAuthorDetails: PostWithAuthorDetails = {
    ...post,
    author: {
      id: "",
      username: "",
      avatar_url: "",
      bio: "",
    },
  }

  const authorData = await getUserProfile(post.author)

  if (!authorData)
    // The author does not exist.
    // This can happen in case the user has been deleted but their posts not.
    // In the case we want to show the posts we could use some author data like:
    // /* in the ui prevent creating a link for this user */,
    // {
    //   id: null
    //   username: "Deleted User"
    //   avatar_url: "some default avatar"
    //   bio: ""
    // }
    return {
      notFound: true,
    }

  postWithAuthorDetails["author"] = authorData

  return {
    props: {
      post: postWithAuthorDetails,
    },
    revalidate: 240,
  }
}

const MarkdownPreview = dynamic(
  () => import("../../components/markdownPreview").then((mod) => mod.MarkdownPreview),
  {
    loading: () => <Spinner />,
  }
)

export default function PostPage({ post }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const { id } = router.query as { id: string }
  const { data } = usePost(id, post)

  return (
    <>
      <Head>
        <title>HubShift - {data?.title}</title>
      </Head>
      <div className="mt-16">
        {data && (
          <>
            <div
              className="mx-4 flex flex-wrap items-center gap-10 border-b border-zinc-200 pb-6
          dark:border-zinc-700 sm:mx-8 md:ml-28 lg:ml-48"
            >
              <Link
                href={`/user/${data.author.username}`}
                className="flex cursor-pointer items-center gap-4 rounded-md text-lg font-semibold
            hover:underline focus-visible:underline"
              >
                <Image
                  src={data.author.avatar_url}
                  width={40}
                  height={40}
                  alt=""
                  draggable={false}
                  className="h-10 w-10 select-none rounded-full"
                />
                <span>{data.author.username}</span>
              </Link>
              <h1 className="text-left text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {data.title}
              </h1>
            </div>
            <div className="mx-4 sm:mx-8 md:ml-28 lg:ml-48">
              {<MarkdownPreview markdown={data.content} />}
            </div>
          </>
        )}
      </div>
    </>
  )
}
