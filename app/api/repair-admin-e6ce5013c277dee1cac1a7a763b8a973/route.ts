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
      return NextResponse.json({ error: `listUsers: ${listed.error.message}` }, { status: 500 })
    }

    const existing = listed.data.users.find((user) => user.email?.toLowerCase() === TEMP_ADMIN_EMAIL)
    let userId = existing?.id

    if (userId) {
      const updated = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { name: TEMP_ADMIN_NAME, temporary: true },
      })
      if (updated.error || !updated.data.user) {
        return NextResponse.json({ error: `updateUser: ${updated.error?.message || 'missing user'}` }, { status: 500 })
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
        return NextResponse.json({ error: `createUser: ${created.error?.message || 'missing user'}` }, { status: 500 })
      }
      userId = created.data.user.id
    }

    const upserted = await supabase.from('users').upsert(
      {
        id: userId,
        name: TEMP_ADMIN_NAME,
        email: TEMP_ADMIN_EMAIL,
        role: 'admin',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    if (upserted.error) {
      return NextResponse.json({ error: `profileUpsert: ${upserted.error.message}` }, { status: 500 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id,email,role')
      .eq('id', userId)
      .single()

    if (profileError) {
      return NextResponse.json({ error: `profileRead: ${profileError.message}` }, { status: 500 })
    }

    const signedIn = await supabase.auth.signInWithPassword({ email: TEMP_ADMIN_EMAIL, password })
    if (signedIn.error || !signedIn.data.session) {
      return NextResponse.json({ error: `signIn: ${signedIn.error?.message || 'missing session'}` }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      email: TEMP_ADMIN_EMAIL,
      authUserExists: Boolean(userId),
      profileRole: profile.role,
      canSignIn: true,
      hasAccessToken: Boolean(signedIn.data.session.access_token),
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown repair error.' }, { status: 500 })
  }
}
