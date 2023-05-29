import { useMediaQuery } from "@/hooks/useMediaQuery"
import Image from "next/image"
import Link from "next/link"
import { HeartIcon } from "@heroicons/react/24/outline"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { useMyLikes } from "@/hooks/useMyLikes"
import { twMerge } from "tailwind-merge"
import { useEffect, useState } from "react"
import { useLikePost } from "@/hooks/useLikePost"
import { useSession } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { Modal } from "./modal"
import { Dialog } from "@headlessui/react"

type PostCardProps = {
  authorUsername: string
  authorAvatar: string
  createdAt: string
  postTitle: string
  postId: string
  likes: number
}

export const PostCard = ({
  authorUsername,
  authorAvatar,
  createdAt,
  postTitle,
  postId,
  likes,
}: PostCardProps) => {
  const fullDate = new Date(createdAt).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  })

  const session = useSession()

  const [postLikesPrediction, setPostLikesPrediction] = useState<number | null>(null)
  const [isLiked, setIsLiked] = useState(false)

  const [hasLikedWithoutSignIn, setHasLikedWithoutSignIn] = useState(false)

  const shortDate = new Date(createdAt).toLocaleString("en-US", {
    dateStyle: "short",
  })

  const isMobile = useMediaQuery("(max-width: 640px)")
  const { data: myLikes, isLoading: isLoadingMyLikes, isPaused } = useMyLikes()

  useEffect(() => {
    setIsLiked(myLikes ? myLikes.includes(postId) : false)
  }, [myLikes, postId])

  const postMutation = useLikePost(postId)

  const queryClient = useQueryClient()

  const handleLikeClick = () => {
    if (!session) {
      setHasLikedWithoutSignIn(true)
    } else {
      if (isLiked) {
        setPostLikesPrediction(null)
        setIsLiked(false)
        postMutation.mutate({
          isDislike: true,
          userId: session?.user?.id!,
        })
      } else {
        setPostLikesPrediction(likes + 1)
        setIsLiked(true)
        postMutation.mutate({
          isDislike: false,
          userId: session?.user?.id!,
        })
      }
    }
  }

  const handleModalClose = () => {
    setHasLikedWithoutSignIn(false)
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-md border border-zinc-200 
            bg-zinc-100 p-3 pb-8 focus-within:outline focus-within:outline-2
             focus-within:outline-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:focus-within:outline-zinc-500"
    >
      <div className="flex w-fit items-center gap-4">
        <Link
          href={`/user/${authorUsername}`}
          className="flex cursor-pointer items-center gap-4 rounded-md text-lg font-semibold hover:underline focus-visible:underline"
          title={`View ${authorUsername}'s profile`}
        >
          <Image
            src={authorAvatar}
            width={40}
            height={40}
            alt={`Avatar for ${authorUsername}`}
            draggable={false}
            className="h-10 w-10 select-none rounded-full"
          />
          <span>{authorUsername}</span>
        </Link>
        <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
        <span className="text-md text-zinc-700 dark:text-zinc-200" title={`Posted on ${fullDate}`}>
          {isMobile ? shortDate : fullDate}
        </span>
      </div>
      <Link
        href={`/post/${encodeURIComponent(postId)}`}
        className="cursor-pointer rounded-md text-2xl font-bold hover:text-indigo-600 dark:hover:text-indigo-500 md:mx-14"
        title={`View ${postTitle}`}
      >
        {postTitle}
      </Link>
      <div className="my-4 border-t border-zinc-200 dark:border-zinc-600" />
      <div className="md:mx-14">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLikeClick}
            title={isLiked ? "Unlike" : "Like"}
            className="rounded-md"
          >
            <HeartIcon
              className={twMerge(
                `h-6 w-6 text-zinc-900 dark:text-zinc-50`,
                isLiked ? "fill-red-500 dark:fill-red-500" : "fill-zinc-50 dark:fill-transparent"
              )}
            />
          </button>
          <span className="select-none text-lg font-semibold">{postLikesPrediction ?? likes}</span>
        </div>
      </div>
      {hasLikedWithoutSignIn && (
        <Modal>
          <Dialog.Panel className="absolute left-1/2 top-1/3 flex w-fit -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-md bg-zinc-50 p-7 dark:bg-zinc-800">
            <h1 className="text-xl font-bold lg:text-2xl">You need to sign in to like a post</h1>
            <div className="flex flex-col gap-6">
              <Link
                href="/auth"
                className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-zinc-50 hover:bg-opacity-90 hover:underline 
                active:bg-opacity-80 dark:bg-indigo-500 dark:text-zinc-50"
              >
                Sign in
              </Link>
              <button
                className="active: rounded-md border bg-zinc-200 
                px-4 py-2 font-semibold text-zinc-900 hover:bg-zinc-200 hover:underline dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700
                dark:active:bg-zinc-600"
                onClick={handleModalClose}
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </Modal>
      )}
    </div>
  )
}
