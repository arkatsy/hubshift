export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
      }
      posts: {
        Row: {
          author: string
          content: string
          created_at: string
          id: string
          likedBy: string[]
          title: string
        }
        Insert: {
          author: string
          content: string
          created_at?: string
          id?: string
          likedBy?: string[]
          title: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          id?: string
          likedBy?: string[]
          title?: string
        }
      }
      user_profiles: {
        Row: {
          avatar_url: string
          bio: string
          id: string
          username: string
        }
        Insert: {
          avatar_url: string
          bio?: string
          id: string
          username: string
        }
        Update: {
          avatar_url?: string
          bio?: string
          id?: string
          username?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
