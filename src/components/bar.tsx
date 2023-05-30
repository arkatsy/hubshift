import { BrandWithOrWithoutLink as Brand } from "@/components/brand"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { useMyProfile } from "@/hooks/useMyProfile"
import { Menu, Transition } from "@headlessui/react"
import { useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { Fragment, useContext, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { SunIcon, MoonIcon, PlusIcon } from "@heroicons/react/24/outline"
import { ThemeContext } from "@/lib/theme"
import { type DB } from "@/lib/types"
import { toast } from "react-hot-toast"

export function Bar() {
  const { isLoading, session } = useSessionContext()
  const router = useRouter()
  const createPostButtonIsIcon = useMediaQuery("(max-width: 640px)")
  const { data, isLoading: isProfileLoading } = useMyProfile(session)

  const isAuthPage = router.pathname === "/auth"
  const isNewPostPage = router.pathname === "/new"

  const shouldShowSignIn = !isAuthPage && !isLoading && !session
  const shouldShowProfile = !isAuthPage && !isLoading && session && !isProfileLoading && data
  const shouldShowNewPost = shouldShowProfile && !isNewPostPage

  // Theme toggle button
  const { theme, toggleTheme } = useContext(ThemeContext)
  const [themeIcon, remountThemeIcon] = useState(false)

  useEffect(() => {
    remountThemeIcon(true)
  }, [])

  return (
    <div className="flex h-full items-center justify-between">
      <Brand isLink={true} title={`Go to the feed page`} />
      <div className="flex items-center gap-8">
        {shouldShowNewPost && (
          <Link
            href="/new"
            className="rounded-md border border-indigo-600 px-2 py-2 text-lg font-semibold
          text-indigo-600 hover:bg-indigo-600 hover:text-zinc-50 hover:underline active:bg-indigo-600 active:text-zinc-50
          active:underline sm:px-5"
            title="Create a new post"
          >
            {createPostButtonIsIcon ? <PlusIcon className="h-5 w-5" /> : "New Post"}
          </Link>
        )}
        {themeIcon && (
          <button
            onClick={toggleTheme}
            className="rounded-md"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        )}
        {shouldShowSignIn && (
          <Link
            className="rounded-md border border-indigo-600 px-4 py-2 text-lg font-semibold
            text-indigo-600 hover:bg-indigo-600 hover:text-white hover:underline active:bg-indigo-600 active:text-white
            active:underline md:px-5"
            href="/auth"
          >
            Sign in
          </Link>
        )}
        {shouldShowProfile && (
          <Profile
            className="relative top-1"
            avatar_url={data.avatar_url!}
            username={data.username!}
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
  const supabase = useSupabaseClient<DB>()
  const router = useRouter()

  const onSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.reload()
    toast.success("You are being logged out")
  }

  return (
    <Menu as="div" className={twMerge("relative", className)}>
      <Menu.Button className="rounded-md" title="Your profile">
        <Image
          src={avatar_url}
          alt="Your profile picture"
          width={42}
          height={42}
          className="h-10 w-10 select-none rounded-full shadow-sm"
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
          className="absolute right-0 flex w-fit flex-col rounded-md
        border border-zinc-200 bg-zinc-50 p-1 text-left shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
        >
          <Menu.Item>
            {({ active }) => (
              <Link
                href={`/user/${username}`}
                className={`&& mb-1 rounded-md border-b border-zinc-200 p-1 dark:border-zinc-700 ${
                  active && "bg-zinc-100 dark:bg-zinc-700"
                }`}
                title="Go to your profile page"
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
                onClick={onSignOut}
                title="Sign out"
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
