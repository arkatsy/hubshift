import { usePost } from "@/hooks/usePost"
import { useRouter } from "next/router"
import Image from "next/image"
import Link from "next/link"
import { Spinner } from "@/components/spinner"
import dynamic from "next/dynamic"

const MarkdownPreview = dynamic(() => import("../../components/markdownPreview").then(
  (mod) => mod.MarkdownPreview
), {
  loading: () => <Spinner />,
})


export default function PostPage() {
  const router = useRouter()

  const { data } = usePost(router.query.id as string)

  return (
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
                className="select-none rounded-full w-10 h-10"
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
      )
      }
    </div >
  )
}
