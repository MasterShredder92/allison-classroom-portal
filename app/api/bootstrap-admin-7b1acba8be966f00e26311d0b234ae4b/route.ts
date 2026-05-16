import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

const TEMP_ADMIN_EMAIL = 'admin@allison-classroom.test'
const TEMP_ADMIN_NAME = 'Temporary Admin'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (typeof password !== 'string' || password.length < 14) {
      return NextResponse.json({ error: 'A strong temporary password is required.' }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()
    const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })

    if (listed.error) {
      return NextResponse.json({ error: listed.error.message }, { status: 500 })
    }

    const existing = listed.data.users.find((user) => user.email?.toLowerCase() === TEMP_ADMIN_EMAIL)
    let userId = existing?.id

    if (userId) {
      const updated = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { name: TEMP_ADMIN_NAME, temporary: true },
      })

      if (updated.error) {
        return NextResponse.json({ error: updated.error.message }, { status: 500 })
      }

      userId = updated.data.user.id
    } else {
      const created = await supabase.auth.admin.createUser({
        email: TEMP_ADMIN_EMAIL,
        password,
        email_confirm: true,
        user_metadata: { name: TEMP_ADMIN_NAME, temporary: true },
      })

      if (created.error || !created.data.user) {
        return NextResponse.json({ error: created.error?.message || 'Failed to create user.' }, { status: 500 })
      }

      userId = created.data.user.id
    }

    const profile = await supabase.from('users').upsert(
      {
        id: userId,
        name: TEMP_ADMIN_NAME,
        email: TEMP_ADMIN_EMAIL,
        role: 'admin',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

    if (profile.error) {
      return NextResponse.json({ error: profile.error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, email: TEMP_ADMIN_EMAIL, role: 'admin' })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown bootstrap error.' },
      { status: 500 },
    )
  }
}
