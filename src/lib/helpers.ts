import { type Session, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { GetServerSidePropsContext } from "next"
import type { User } from "@supabase/supabase-js"
import type { DB, PostWithoutAuthorDetails, SupaClient, UserProfile } from "./types"
import { supabase } from "./supabaseClient"

export async function getServerAuthStatus(ctxt: GetServerSidePropsContext): Promise<{
  session: Session | null
  user: User | null
}> {
  const supabase = createServerSupabaseClient<DB>(ctxt)

  const [sessionResult, userResult] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
  ])

  return {
    session: sessionResult.data.session,
    user: userResult.data.user,
  }
}

export const POSTS_PER_PAGE = 10

export async function getAllUsernames(): Promise<Pick<UserProfile, "username">[]> {
  const { data: users } = await supabase.from("user_profiles").select("username")
  if (!users) return []
  return users
}

export async function getUserProfile(username: string): Promise<UserProfile | null> {
  const { data: userData } = await supabase
    .from("user_profiles")
    .select("id, username, avatar_url, bio")
    .eq("username", username)
    .single()

  if (!userData) return null
  return userData
}

export async function getUserPosts(username: string): Promise<PostWithoutAuthorDetails[]> {
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, content, created_at, author")
    .eq("author", username)
    .order("created_at", { ascending: false })
    .limit(POSTS_PER_PAGE)

  if (!posts) return []

  const postsWithLikes = posts.map((post) => ({
    ...post,
    likes: 0,
  }))

  const likes = await Promise.all(
    posts.map((post) => post.id).map((postId) => getPostLikes(postId))
  )

  likes.map((like) => {
    let post = postsWithLikes.find((post) => post.id === like.post_id)
    if (!post) return

    postsWithLikes[postsWithLikes.indexOf(post)].likes = like.count
  })

  return postsWithLikes
}

export async function getPost(id: string): Promise<PostWithoutAuthorDetails | null> {
  const { data: post } = await supabase
    .from("posts")
    .select("id, title, content, created_at, author")
    .eq("id", id)
    .single()

  if (!post) return null

  const postWithLikes = {
    ...post,
    likes: 0,
  }

  const likes = await getPostLikes(id)

  postWithLikes.likes = likes.count

  return postWithLikes
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const { data: users } = await supabase
    .from("user_profiles")
    .select("id, username, avatar_url, bio")

  if (!users) return []
  return users
}

export async function getRecentPosts(): Promise<PostWithoutAuthorDetails[]> {
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, content, created_at, author")
    .limit(POSTS_PER_PAGE)
    .order("created_at", { ascending: false })

  if (!posts) return []

  // Add the likes to the posts with default 0
  const postsWithLikes = posts.map((post) => ({
    ...post,
    likes: 0,
  }))

  // Would be nice to abstract a getPostsIds(postIds: string[]): Promise<{post_id: string, count: number}[]> function.
  const likes = await Promise.all(
    posts.map((post) => post.id).map((postId) => getPostLikes(postId))
  )

  likes.map((like) => {
    let post = postsWithLikes.find((post) => post.id === like.post_id)
    if (!post) return

    postsWithLikes[postsWithLikes.indexOf(post)].likes = like.count
  })

  return postsWithLikes
}

export async function getPostLikes(
  postId: string,
  client?: SupaClient
): Promise<{
  post_id: string
  count: number
}> {
  const likes = await (client ?? supabase)
    .from("likes")
    .select("id, post_id", { count: "exact" })
    .eq("post_id", postId)

  if (!likes.data?.length)
    return {
      post_id: postId,
      count: 0,
    }

  let likeCount = likes.count ?? 0

  return {
    post_id: postId,
    count: likeCount,
  }
}
