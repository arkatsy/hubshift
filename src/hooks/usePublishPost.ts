import { type Database } from "@/lib/dbtypes"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { toast } from "react-hot-toast"

type Post = {
  title: string
  content: string
  author: string
  id: string
}

export const usePublishPost = () => {
  const client = useSupabaseClient<Database>()
  const router = useRouter()
  return useMutation({
    mutationKey: ["publishedPost"],
    mutationFn: (post: Post) => publishPost(client, post),
    onSuccess: () => {
      toast.success("Post published!")
      router.push("/")
    },
    onError: () => toast.error("Error publishing post"),
  })
}

const publishPost = async (client: SupabaseClient<Database>, post: Post) => {
  const { id, title, content, author } = post
  const { data } = await client.from("posts").insert({
    id,
    title,
    content,
    author,
  })

  return data
}
