CREATE TABLE user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  CONSTRAINT valid_username CHECK (username ~* '^[a-zA-Z0-9_]+$' AND char_length(username) >= 3 AND char_length(username) <= 15)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public user profiles are viewable by everyone." ON user_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "users can insert" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "owners can update" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- Storage
INSERT INTO storage.buckets(id, name)
  VALUES ('avatars', 'avatars');

CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar." ON storage.objects
  FOR INSERT WITH CHECK(bucket_id = 'avatars'); 
