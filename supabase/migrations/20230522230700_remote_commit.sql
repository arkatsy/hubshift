alter table "public"."user_profiles" alter column "avatar_url" set not null;

alter table "public"."user_profiles" alter column "bio" set default ''::text;

alter table "public"."user_profiles" alter column "bio" set not null;

alter table "public"."user_profiles" alter column "username" set not null;


