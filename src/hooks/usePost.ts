import type { PostWithAuthorDetails, SupaClient, DB } from "@/lib/types"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"

export const usePost = (id: string, initialData?: PostWithAuthorDetails) => {
  const client = useSupabaseClient<DB>()
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(client, id),
    initialData,
    staleTime: Infinity,
  })
}

const fetchPost = async (client: SupaClient, id: string) => {
  let { data: post } = await client
    .from("posts")
    .select("author, content, created_at, id, title")
    .eq("id", id)
    .single()

  if (!post) return null

  const postWithAuthorData: PostWithAuthorDetails = {
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

  let { data: authorData } = await client
    .from("user_profiles")
    .select("id, username, avatar_url, bio")
    .eq("username", post.author)
    .single()

  if (!authorData) return null

  postWithAuthorData["author"] = authorData

  return postWithAuthorData
}
