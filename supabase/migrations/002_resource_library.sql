-- Migration: durable classroom resource library
-- Created: 2026-05-16
-- Purpose: Store uploaded/imported classroom resources separately from public posts.

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_kind TEXT NOT NULL DEFAULT 'other' CHECK (resource_kind IN ('image', 'pdf', 'document', 'spreadsheet', 'presentation', 'video', 'website', 'calendar', 'other')),
  source_type TEXT NOT NULL DEFAULT 'upload' CHECK (source_type IN ('upload', 'google_url', 'external_url')),
  original_url TEXT,
  public_url TEXT NOT NULL,
  embed_url TEXT,
  storage_bucket TEXT,
  storage_path TEXT,
  mime_type TEXT,
  file_size_bytes BIGINT,
  posted_target TEXT CHECK (posted_target IN ('announcement', 'assignment', 'link', 'photo', 'schedule', 'page')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'draft', 'archived')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('announcement', 'assignment', 'link', 'photo', 'schedule', 'page')),
  target_id UUID,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS resources_visibility_idx ON resources(visibility);
CREATE INDEX IF NOT EXISTS resources_kind_idx ON resources(resource_kind);
CREATE INDEX IF NOT EXISTS resources_target_idx ON resources(posted_target);
CREATE INDEX IF NOT EXISTS resource_posts_resource_idx ON resource_posts(resource_id);
CREATE INDEX IF NOT EXISTS resource_posts_target_idx ON resource_posts(target_type, target_id);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resources_select_public" ON resources;
CREATE POLICY "resources_select_public" ON resources
  FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "resources_admin_select_all" ON resources;
CREATE POLICY "resources_admin_select_all" ON resources
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

DROP POLICY IF EXISTS "resources_admin_insert" ON resources;
CREATE POLICY "resources_admin_insert" ON resources
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

DROP POLICY IF EXISTS "resources_admin_update" ON resources;
CREATE POLICY "resources_admin_update" ON resources
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

DROP POLICY IF EXISTS "resources_admin_delete" ON resources;
CREATE POLICY "resources_admin_delete" ON resources
  FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

DROP POLICY IF EXISTS "resource_posts_select_active" ON resource_posts;
CREATE POLICY "resource_posts_select_active" ON resource_posts
  FOR SELECT USING (active = TRUE);

DROP POLICY IF EXISTS "resource_posts_admin_all" ON resource_posts;
CREATE POLICY "resource_posts_admin_all" ON resource_posts
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Public bucket for classroom resources. Files are readable by parents/students via public URLs.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'classroom-resources',
  'classroom-resources',
  TRUE,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "classroom_resources_public_read" ON storage.objects;
CREATE POLICY "classroom_resources_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'classroom-resources');

DROP POLICY IF EXISTS "classroom_resources_admin_insert" ON storage.objects;
CREATE POLICY "classroom_resources_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'classroom-resources'
    AND auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "classroom_resources_admin_update" ON storage.objects;
CREATE POLICY "classroom_resources_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'classroom-resources'
    AND auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "classroom_resources_admin_delete" ON storage.objects;
CREATE POLICY "classroom_resources_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'classroom-resources'
    AND auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );
