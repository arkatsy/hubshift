create table "public"."likes" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "user_id" uuid not null,
    "post_id" uuid not null
);


alter table "public"."posts" add column "likedBy" uuid[] not null default '{}'::uuid[];

CREATE UNIQUE INDEX likes_pkey ON public.likes USING btree (id);

alter table "public"."likes" add constraint "likes_pkey" PRIMARY KEY using index "likes_pkey";

alter table "public"."likes" add constraint "likes_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) not valid;

alter table "public"."likes" validate constraint "likes_post_id_fkey";

alter table "public"."likes" add constraint "likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profiles(id) not valid;

alter table "public"."likes" validate constraint "likes_user_id_fkey";


