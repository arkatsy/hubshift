import { type Database } from "@/lib/dbtypes"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useQuery } from "@tanstack/react-query"

export const usePost = (id: string) => {
  const client = useSupabaseClient<Database>()
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(client, id),
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

const fetchPost = async (client: SupabaseClient<Database>, id: string) => {
  let { data: post } = await client
    .from("posts")
    .select("author, content, created_at, id, title")
    .eq("id", id)
    .single()

  if (!post) return null

  const postWithAuthorData: PostWithAuthorData = {
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
  }

  if (post) {
    let { data: authorData } = await client
      .from("user_profiles")
      .select("id, username, avatar_url, bio")
      .eq("username", post.author)
      .single()

    if (!authorData) return null

    postWithAuthorData["author"] = authorData
  }

  return postWithAuthorData
}
