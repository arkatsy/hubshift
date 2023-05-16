import { Brand } from "@/components"
import { useMyProfile } from "@/hooks"
import { Menu, Transition } from "@headlessui/react"
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { Fragment } from "react"
import { twMerge } from "tailwind-merge"

export function Bar() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const { isLoading, session } = useSessionContext()

  const isAuthPage = router.pathname === "/auth"

  const shouldShowSignIn = !isAuthPage && !isLoading && !session

  const { data, isLoading: isProfileLoading } = useMyProfile(supabase, session)
  const shouldShowProfile = !isAuthPage && !isLoading && session && !isProfileLoading && data

  return (
    <div className="flex h-full items-center justify-between">
      <Brand isLink={true} />
      <div>
        {shouldShowSignIn && (
          <Link
            className="rounded-md border border-indigo-600 px-4 py-2 text-lg font-semibold text-indigo-600
            hover:bg-indigo-600 hover:text-white hover:underline focus:bg-indigo-600 focus:text-white focus:underline
            md:px-5 md:py-3"
            href="/auth"
          >
            Sign in
          </Link>
        )}
        {shouldShowProfile && (
          <Profile
            className="relative top-1"
            avatar_url={data.avatar_url}
            username={data.username}
            email={session.user.email!}
          />
        )}
      </div>
    </div>
  )
}

type ProfileProps = {
  avatar_url: string
  username: string
  className?: string
  email: string
}

function Profile({ avatar_url, username, className, email }: ProfileProps) {
  const supabase = useSupabaseClient()

  return (
    <Menu as="div" className={twMerge("relative", className)}>
      <Menu.Button className="rounded-md">
        <Image
          src={avatar_url}
          alt={username}
          width={42}
          height={42}
          className="rounded-full shadow-sm"
        />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transitio ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="absolute right-0 mt-2 flex w-52 flex-col rounded-md
        border border-zinc-200 bg-zinc-50 p-1 text-left dark:border-zinc-600 dark:bg-zinc-800"
        >
          <Menu.Item>
            {({ active }) => (
              <Link
                href={`/user/${username}`}
                className={`&& mb-1 rounded-md border-b border-zinc-200 p-1 dark:border-zinc-800 ${
                  active && "bg-zinc-100 dark:bg-zinc-700"
                }`}
              >
                <p className="pl-4 font-bold">@{username}</p>
                <p className="pl-4 font-normal">{email}</p>
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`text-md rouned-md rounded-md py-1 pl-4 text-left ${
                  active && "bg-zinc-100 dark:bg-zinc-700"
                }`}
                onClick={() => supabase.auth.signOut()}
              >
                Sign Out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
