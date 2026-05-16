-- Allison Classroom Portal - Initial Schema
-- Created: 2026-05-16
-- Purpose: Database schema for parent resource portal

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Users (Admin only - Allison)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Page Content (About, Rules, Expectations, Contact)
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body_markdown TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Announcements (News, Newsletters)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  date DATE NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'link_only', 'draft')),
  attachment_url TEXT,
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Classes (5th/6th English, Reading, Social Studies)
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INT NOT NULL CHECK (grade IN (5, 6)),
  subject TEXT NOT NULL CHECK (subject IN ('English', 'Reading', 'Social Studies')),
  display_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Assignments (Core daily-update object)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  resource_type TEXT CHECK (resource_type IN ('drive_link', 'download', 'external_link')),
  resource_url TEXT,
  file_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'link_only', 'restricted', 'draft')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Links (Gradebook, School, Google Classroom, ClassDojo, etc.)
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('gradebook', 'school', 'classroom_tools', 'reading', 'curriculum', 'other')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  audience TEXT DEFAULT 'everyone',
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Schedule (Current schedule image + notes)
CREATE TABLE IF NOT EXISTS schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Photo Updates (Classroom activity/photos)
CREATE TABLE IF NOT EXISTS photo_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  caption TEXT,
  image_url TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('public', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Seed classes (6 classes)
INSERT INTO classes (grade, subject, display_name, slug, sort_order) VALUES
  (5, 'English', '5th Grade English', '5th-english', 1),
  (6, 'English', '6th Grade English', '6th-english', 2),
  (5, 'Reading', '5th Grade Reading', '5th-reading', 3),
  (6, 'Reading', '6th Grade Reading', '6th-reading', 4),
  (5, 'Social Studies', '5th Grade Social Studies', '5th-social-studies', 5),
  (6, 'Social Studies', '6th Grade Social Studies', '6th-social-studies', 6)
ON CONFLICT DO NOTHING;

-- Seed page content stubs
INSERT INTO page_content (slug, title, body_markdown) VALUES
  ('about', 'About Allison', '# Welcome\n\nAdd your classroom information here.'),
  ('rules', 'Classroom Rules & Expectations', '# Classroom Expectations\n\nAdd your classroom rules here.'),
  ('contact', 'Contact Me', '# How to Reach Me\n\nAdd your preferred contact methods here.')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_updates ENABLE ROW LEVEL SECURITY;

-- USERS: Authenticated users can only see their own record
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_admin_all" ON users
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- PAGE_CONTENT: Anyone can read, only admin can write
CREATE POLICY "page_content_select_all" ON page_content
  FOR SELECT USING (TRUE);

CREATE POLICY "page_content_admin_write" ON page_content
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "page_content_admin_update" ON page_content
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "page_content_admin_delete" ON page_content
  FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- ANNOUNCEMENTS: Read public/link_only, admin can CRUD
CREATE POLICY "announcements_select_public" ON announcements
  FOR SELECT USING (visibility = 'public' OR visibility = 'link_only');

CREATE POLICY "announcements_admin_select_all" ON announcements
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "announcements_admin_insert" ON announcements
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "announcements_admin_update" ON announcements
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "announcements_admin_delete" ON announcements
  FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- CLASSES: Anyone can read
CREATE POLICY "classes_select_all" ON classes
  FOR SELECT USING (TRUE);

-- ASSIGNMENTS: Read public, admin can CRUD
CREATE POLICY "assignments_select_public" ON assignments
  FOR SELECT USING (visibility IN ('public', 'link_only'));

CREATE POLICY "assignments_admin_select_all" ON assignments
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "assignments_admin_insert" ON assignments
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "assignments_admin_update" ON assignments
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "assignments_admin_delete" ON assignments
  FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- LINKS: Read active links, admin can CRUD all
CREATE POLICY "links_select_active" ON links
  FOR SELECT USING (active = TRUE);

CREATE POLICY "links_admin_select_all" ON links
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "links_admin_insert" ON links
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "links_admin_update" ON links
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "links_admin_delete" ON links
  FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- SCHEDULE: Read active, admin can CRUD
CREATE POLICY "schedule_select_active" ON schedule
  FOR SELECT USING (active = TRUE);

CREATE POLICY "schedule_admin_select_all" ON schedule
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "schedule_admin_insert" ON schedule
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "schedule_admin_update" ON schedule
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "schedule_admin_delete" ON schedule
  FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- PHOTO_UPDATES: Read public, admin can CRUD
CREATE POLICY "photo_updates_select_public" ON photo_updates
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "photo_updates_admin_select_all" ON photo_updates
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "photo_updates_admin_insert" ON photo_updates
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "photo_updates_admin_update" ON photo_updates
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "photo_updates_admin_delete" ON photo_updates
  FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
