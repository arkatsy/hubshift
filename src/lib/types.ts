import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./dbtypes"

export type DB = Database

export type UserProfile = {
  id: string
  username: string
  avatar_url: string
  bio: string
}

export type PostWithAuthorDetails = {
  id: string
  title: string
  content: string
  created_at: string
  author: UserProfile
  likes: number
}

export type PostWithoutAuthorDetails = {
  id: string
  title: string
  content: string
  created_at: string
  author: string
  likes: number
}

export type SupaClient = SupabaseClient<Database>

export type ProfileDataMutation = {
  username: string
  avatar_url: string
  bio: string
}

export type StepComponentProps = {
  setData: React.Dispatch<React.SetStateAction<ProfileDataMutation>>
  setBlobAvatar: React.Dispatch<React.SetStateAction<Blob | null>>
  data: ProfileDataMutation
}

export type Step = {
  id: 0 | 1 | 2
  title: string
  status: "current" | "complete" | "incomplete"
  Component: React.ElementType<StepComponentProps>
}
