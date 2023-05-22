import { type Database } from "@/lib/dbtypes"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useInfiniteQuery } from "@tanstack/react-query"

const POSTS_PER_PAGE = 10

export const useAllPosts = () => {
  const client = useSupabaseClient<Database>()
  return useInfiniteQuery({
    queryKey: ["allPosts"],
    queryFn: ({ pageParam = 0 }) => fetchPosts(client, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.previousPage,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

type Post = {
  id: string
  title: string
  content: string
  created_at: string
}

type AuthorProfile = {
  id: string
  username: string
  avatar_url: string
  bio: string
}

type PostWithAuthorData = Post & {
  author: AuthorProfile
}

const fetchPosts = async (client: SupabaseClient<Database>, pageParam: number) => {
  const { data: posts } = await client
    .from("posts")
    .select("id, title, content, created_at, author")
    .order("created_at", { ascending: false })
    .range(pageParam * POSTS_PER_PAGE, (pageParam + 1) * POSTS_PER_PAGE - 1)

  if (!posts)
    return {
      data: [],
      nextPage: null,
      previousPage: null,
    }

  const authors = new Set<string>()
  const postsWithAuthorData: PostWithAuthorData[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    created_at: post.created_at,
    author: {
      id: "",
      username: "",
      avatar_url: "",
      bio: "",
    },
  }))

  // Removing duplicate authors by using a Set
  posts.forEach((post) => authors.add(post.author))

  const { data: authorData } = await client
    .from("user_profiles")
    .select("id, username, avatar_url, bio")
    .in("username", Array.from(authors))

  if (!authorData)
    return {
      data: [],
      nextPage: null,
      previousPage: null,
    }

  posts.map((post, id) => {
    // Find the author data for each post
    const author = authorData.find((author) => author.username === post.author)

    if (author) {
      postsWithAuthorData[id]["author"] = author
    }
  })

  const nextPage = posts && posts.length >= POSTS_PER_PAGE ? pageParam + 1 : null
  const previousPage = pageParam > 0 ? pageParam - 1 : null

  return {
    data: postsWithAuthorData,
    nextPage,
    previousPage,
  }
}
