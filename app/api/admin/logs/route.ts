import { type NextRequest } from 'next/server'
import { ok, serverFail } from '@/lib/api/responses'
import { rateLimit, requireAdmin } from '@/lib/api/request'

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, 'read')
  if (limited) return limited

  try {
    const admin = await requireAdmin(request)
    if (admin.error) return admin.error

    const supabase = admin.supabase

    const [announcements, assignments, links, photos, classes] = await Promise.all([
      supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('assignments')
        .select('*, classes(id, grade, subject, display_name, slug)')
        .order('created_at', { ascending: false }),
      supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('photo_updates')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('classes')
        .select('*')
        .order('sort_order', { ascending: true }),
    ])

    if (announcements.error) throw announcements.error
    if (assignments.error) throw assignments.error
    if (links.error) throw links.error
    if (photos.error) throw photos.error
    if (classes.error) throw classes.error

    return ok({
      announcements: announcements.data ?? [],
      assignments: assignments.data ?? [],
      links: links.data ?? [],
      photos: photos.data ?? [],
      classes: classes.data ?? [],
    })
  } catch (error) {
    return serverFail(error, 'GET /api/admin/logs')
  }
}
