import { useEffect, useState } from "react"
import { PencilSquareIcon, EyeIcon, PaperAirplaneIcon } from "@heroicons/react/20/solid"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useMyProfile } from "@/hooks/useMyProfile"
import { usePublishPost } from "@/hooks/usePublishPost"
import { type GetServerSidePropsContext } from "next"
import { getServerAuthStatus } from "@/lib/helpers"
import { type User, useSession } from "@supabase/auth-helpers-react"
import { Spinner } from "@/components/spinner"
import dynamic from "next/dynamic"


const MarkdownPreview = dynamic(() => import("../../components/markdownPreview").then(
  (mod) => mod.MarkdownPreview
), {
  loading: () => <Spinner />,
})

export const getServerSideProps = async (ctxt: GetServerSidePropsContext) => {
  const { session, user } = await getServerAuthStatus(ctxt)

  if (session && user) {
    return {
      props: {
        user,
      },
    }
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  }
}

type CreateNewPostPageProps = {
  user: User
}

export default function CreateNewPostPage({ user }: CreateNewPostPageProps) {
  const session = useSession()
  const [isPreview, setIsPreview] = useState(false)
  const [post, setPost] = useState({
    title: "",
    content: "",
    author: "",
    id: "",
  })
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Pass the session to get the current user
  // The data if not, most of the time will be already in cache so this is fast
  const { data } = useMyProfile(session)
  const createPostMutation = usePublishPost()

  // Set the author name which is the current login user
  useEffect(() => {
    if (data) {
      setPost((post) => ({ ...post, author: data.username! }))
    }
  }, [data])

  // Create a new post id
  useEffect(() => {
    setPost((p) => ({ ...p, id: self.crypto.randomUUID() }))
  }, [])

  // Handlers
  const handlePostContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setPost({ ...post, content: e.target.value })

  const handlePostTitleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPost({ ...post, title: e.target.value })

  const handlePublish = () => {
    createPostMutation.mutate({
      title: post.title,
      content: post.content,
      id: post.id,
      author: post.author,
    })
  }

  const canPublish = post.title.length > 0 && post.content.length > 0

  return (
    <div className="mt-8 flex w-full flex-col">
      <div className="justify space-between flex items-center justify-between pb-4">
        <h1 className="text-2xl font-bold md:text-3xl">Create Your Blog</h1>
        <div className="flex gap-4 ">
          <button
            className="flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 
          hover:bg-zinc-100 dark:border-zinc-500
        dark:bg-zinc-800 dark:hover:bg-zinc-700"
            onClick={() => setIsPreview((c) => !c)}
          >
            <span className="space-between flex items-center gap-4 font-semibold">
              {!isMobile && (isPreview ? "Edit" : "Preview")}
              {isPreview ? (
                <PencilSquareIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </span>
          </button>
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className="flex items-center gap-4 rounded-md bg-indigo-600 px-4 py-2 font-semibold text-zinc-50 hover:bg-indigo-500
            disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:outline disabled:outline-1 disabled:outline-zinc-200
            disabled:dark:bg-zinc-800 disabled:dark:outline-zinc-700"
          >
            {!isMobile && "Publish"}
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-600">
        <div className="my-4 flex items-center gap-6">
          <label htmlFor="title" className="whitespace-no-wrap text-2xl font-bold">
            Title
          </label>
          <input
            id="title"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-500 dark:bg-zinc-800"
            type="text"
            onChange={handlePostTitleChange}
            maxLength={65}
          />
        </div>
        {!isPreview ? (
          <textarea
            className="mt-4 h-96 w-full rounded-md border border-zinc-300 p-2 dark:border-zinc-500 dark:bg-zinc-800"
            value={post.content}
            onChange={handlePostContentChange}
          />
        ) : (
          <div className="mx-4 sm:mx-8 md:ml-28 lg:ml-48">
            <MarkdownPreview markdown={post.content || "## Nothing to preview..."} />
          </div>
        )}
      </div>
    </div>
  )
}
