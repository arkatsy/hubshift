import type { DB, SupaClient } from "@/lib/types"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useMutation } from "@tanstack/react-query"

export const useLikePost = (postId: string) => {
  const client = useSupabaseClient<DB>()

  return useMutation({
    mutationKey: ["likePost", postId],
    mutationFn: ({ isDislike, userId }: { isDislike: boolean; userId: string }) =>
      likePost(client, postId, isDislike, userId),
    onSuccess: () => {},
    onError: () => {},
  })
}

const likePost = async (
  client: SupaClient,
  postId: string,
  isDislike: boolean = false,
  userId: string
) => {
  if (isDislike) {
    await client.from("likes").delete().match({ post_id: postId, user_id: userId }).throwOnError()
  } else {
    await client
      .from("likes")
      .insert([{ post_id: postId, user_id: userId }])
      .throwOnError()
  }
}
