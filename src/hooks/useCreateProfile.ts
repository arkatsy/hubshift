import type { SupaClient, DB, ProfileDataMutation } from "@/lib/types"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { toast } from "react-hot-toast"

type Profile = {
  profileData: ProfileDataMutation
  id: string
  avatarBlob: Blob
}

export const useCreateProfile = () => {
  const client = useSupabaseClient<DB>()
  const router = useRouter()

  return useMutation({
    mutationKey: ["myprofile"],
    mutationFn: ({ profileData, id, avatarBlob }: Profile) =>
      createProfile(client, profileData, id, avatarBlob),
    onSuccess: async () => {
      toast.success("Profile created!")
      toast.success("Redirecting to home page...")
      router.push("/?fromWelcome=true")
    },
  })
}

const createProfile = async (
  client: SupaClient,
  profileData: Profile["profileData"],
  id: string,
  avatarBlob: Blob
) => {
  if (avatarBlob instanceof Blob) {
    await client.storage.from("avatars").upload(`${id}`, avatarBlob)
    const avatarUrl = client.storage.from("avatars").getPublicUrl(`${id}`).data.publicUrl

    return client
      .from("user_profiles")
      .insert({ id, username: profileData.username, avatar_url: avatarUrl, bio: profileData.bio })
  }

  return client.from("user_profiles").insert({
    id,
    username: profileData.username,
    avatar_url: profileData.avatar_url,
    bio: profileData.bio,
  })
}
