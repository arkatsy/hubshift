import type { ProfileData } from "@/pages/welcome"
import { SupabaseClient } from "@supabase/supabase-js"
import { useMutation } from "@tanstack/react-query"

export const useCreateProfile = (client: SupabaseClient) => {
  return useMutation({
    mutationKey: ["myprofile"],
    mutationFn: ({
      profileData,
      id,
      avatarBlob,
    }: {
      profileData: ProfileData
      id: string
      avatarBlob: Blob
    }) => createProfile(client, profileData, id, avatarBlob),
  })
}

const createProfile = async (
  client: SupabaseClient,
  profileData: ProfileData,
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
