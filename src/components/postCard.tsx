import Image from "next/image"
import Link from "next/link"

type PostCardProps = {
  authorUsername: string
  authorAvatar: string
  createdAt: string
  postTitle: string
  postId: string
}

export const PostCard = ({
  authorUsername,
  authorAvatar,
  createdAt,
  postTitle,
  postId,
}: PostCardProps) => {
  const postDate = new Date(createdAt).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  })

  return (
    <div
      className="flex flex-col gap-2 rounded-md border border-zinc-200 
            bg-zinc-100 p-3 pb-8 focus-within:outline focus-within:outline-2
             focus-within:outline-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:focus-within:outline-zinc-500"
    >
      <div className="flex w-fit items-center gap-4">
        <Link
          href={`user/${authorUsername}`}
          className="flex cursor-pointer items-center gap-4 rounded-md text-lg font-semibold hover:underline focus-visible:underline"
        >
          <Image
            src={authorAvatar}
            width={40}
            height={40}
            alt=""
            draggable={false}
            className="select-none rounded-full w-10 h-10"
          />
          <span>{authorUsername}</span>
        </Link>
        <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
        <span className="text-md text-zinc-700 dark:text-zinc-200">{postDate}</span>
      </div>
      <Link
        href={`/post/${encodeURIComponent(postId)}`}
        className="cursor-pointer rounded-md text-2xl font-bold hover:text-indigo-600 dark:hover:text-indigo-500 md:mx-14"
      >
        {postTitle}
      </Link>
    </div>
  )
}
