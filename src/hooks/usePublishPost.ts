import type { DB, PostWithoutAuthorDetails, SupaClient } from "@/lib/types"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { toast } from "react-hot-toast"

type Post = Omit<PostWithoutAuthorDetails, "created_at" | "likes">

export const usePublishPost = () => {
  const client = useSupabaseClient<DB>()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["publishedPost"],
    mutationFn: (post: Post) => publishPost(client, post),
    onSuccess: (_, post) => {
      toast.success("Post published!")
      queryClient.invalidateQueries(["allPosts"])
      queryClient.invalidateQueries(["userPosts", post.author])
      router.push("/")
    },
    onError: () => toast.error("An error occurred while publishing the post"),
  })
}

const publishPost = async (client: SupaClient, post: Post) => {
  const { id, title, content, author } = post
  const { data } = await client.from("posts").insert({
    id,
    title,
    content,
    author,
  })

  return data
}
