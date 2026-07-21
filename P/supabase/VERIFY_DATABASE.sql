
-- 1) Public tables the codebase selects/inserts into
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
  and table_name in (
    'profiles',
    'subjects',
    'uploaded_notes',
    'labs',
    'questions',
    'user_progress',
    'achievements',
    'notifications',
    'chat_sessions'
  )
order by table_name;

-- 2) Core column spot-check (profiles)
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;

-- 3) user_progress must support quiz completion fields used by QuizPlayer
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'user_progress'
order by ordinal_position;

-- 4) Storage buckets used by the app
select id, name, public
from storage.buckets
where id in ('course-materials', 'avatars')
order by id;

-- 5) Unique index for upsert-style progress (schema.sql creates this)
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'user_progress'
  and indexname = 'user_progress_user_lab_uidx';

-- 6) notifications (in-app feed)
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'notifications'
order by ordinal_position;
