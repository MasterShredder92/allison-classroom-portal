-- Created: 2026-05-16
-- Purpose: Structured client-editable site settings for safe text and link updates

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  group_name TEXT NOT NULL DEFAULT 'Site Content',
  field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN ('text', 'textarea', 'url')),
  value TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_all" ON site_settings;
CREATE POLICY "site_settings_select_all" ON site_settings
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "site_settings_admin_insert" ON site_settings;
CREATE POLICY "site_settings_admin_insert" ON site_settings
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

DROP POLICY IF EXISTS "site_settings_admin_update" ON site_settings;
CREATE POLICY "site_settings_admin_update" ON site_settings
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

DROP POLICY IF EXISTS "site_settings_admin_delete" ON site_settings;
CREATE POLICY "site_settings_admin_delete" ON site_settings
  FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

INSERT INTO site_settings (key, label, description, group_name, field_type, value, sort_order) VALUES
  ('home_eyebrow', 'Homepage small label', 'Small text above the main homepage headline.', 'Homepage Hero', 'text', 'Parent Resource Hub', 10),
  ('home_headline', 'Homepage headline', 'Large main headline on the homepage.', 'Homepage Hero', 'text', 'Welcome to Allison''s Classroom.', 20),
  ('home_subheadline', 'Homepage description', 'Short paragraph under the homepage headline.', 'Homepage Hero', 'textarea', 'One warm, organized place for announcements, assignments, schedules, links, and classroom moments for Allison''s 5th and 6th grade families.', 30),
  ('home_primary_cta_label', 'Primary button text', 'Main homepage button wording.', 'Homepage Buttons', 'text', 'See Latest News', 40),
  ('home_primary_cta_href', 'Primary button link', 'Where the main homepage button sends families.', 'Homepage Buttons', 'url', '/news', 50),
  ('home_secondary_cta_label', 'Secondary button text', 'Second homepage button wording.', 'Homepage Buttons', 'text', 'Open Parent Links', 60),
  ('home_secondary_cta_href', 'Secondary button link', 'Where the second homepage button sends families.', 'Homepage Buttons', 'url', '/links', 70),
  ('home_board_title', 'Class board title', 'Large title inside the homepage classroom board.', 'Homepage Board', 'text', 'Today in class', 80),
  ('home_board_badge', 'Class board badge', 'Small badge text beside the classroom board title.', 'Homepage Board', 'text', 'live board', 90),
  ('quick_access_heading', 'Quick access heading', 'Heading above the family shortcut boxes.', 'Homepage Sections', 'text', 'Family shortcuts', 100),
  ('classes_heading', 'Class section heading', 'Heading above the class cards.', 'Homepage Sections', 'text', 'Choose a class', 110),
  ('classes_description', 'Class section description', 'Short paragraph beside the class section heading.', 'Homepage Sections', 'textarea', 'Each class page keeps families focused on the assignments and resources that match the student’s schedule.', 120)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  group_name = EXCLUDED.group_name,
  field_type = EXCLUDED.field_type,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
