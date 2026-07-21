-- Drop all policies that depend on the profiles table columns
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

DROP POLICY IF EXISTS "notes_select_own_or_admin" ON public.uploaded_notes;
DROP POLICY IF EXISTS "notes_insert_authenticated" ON public.uploaded_notes;
DROP POLICY IF EXISTS "notes_update_own_or_admin" ON public.uploaded_notes;
DROP POLICY IF EXISTS "notes_delete_admin" ON public.uploaded_notes;

DROP POLICY IF EXISTS "progress_select_own_or_admin" ON public.user_progress;
DROP POLICY IF EXISTS "progress_insert_own" ON public.user_progress;
DROP POLICY IF EXISTS "progress_update_own" ON public.user_progress;

-- Drop foreign keys
ALTER TABLE public.uploaded_notes DROP CONSTRAINT IF EXISTS uploaded_notes_uploaded_by_fkey;
ALTER TABLE public.user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_user_id_fkey;
ALTER TABLE public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Drop functions that depend on the column type (like is_admin)
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Alter column types
ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT USING id::text;

ALTER TABLE public.uploaded_notes ALTER COLUMN uploaded_by TYPE TEXT USING uploaded_by::text;
ALTER TABLE public.user_progress ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.achievements ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.chat_sessions ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.notifications ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- Re-add foreign keys
ALTER TABLE public.uploaded_notes ADD CONSTRAINT uploaded_notes_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.achievements ADD CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.chat_sessions ADD CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Re-create is_admin function (auth.uid() is uuid, but we can cast to text or just use text comparison if Clerk JWT is used)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()::text),
    false
  );
$$;

-- Re-create policies (casting auth.uid() to text)
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT USING (id = auth.uid()::text OR public.is_admin());
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE USING (id = auth.uid()::text OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid()::text OR public.is_admin());

CREATE POLICY "notes_select_own_or_admin" ON public.uploaded_notes FOR SELECT USING (uploaded_by = auth.uid()::text OR public.is_admin());
CREATE POLICY "notes_insert_authenticated" ON public.uploaded_notes FOR INSERT WITH CHECK (uploaded_by = auth.uid()::text OR public.is_admin());
CREATE POLICY "notes_update_own_or_admin" ON public.uploaded_notes FOR UPDATE USING (uploaded_by = auth.uid()::text OR public.is_admin());
CREATE POLICY "notes_delete_admin" ON public.uploaded_notes FOR DELETE USING (public.is_admin());

-- Insert Admin User
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('user_3GEmK6P2xPHLHsgYy6UYvCRwHNt', 'adminhndit@gmail.com', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
