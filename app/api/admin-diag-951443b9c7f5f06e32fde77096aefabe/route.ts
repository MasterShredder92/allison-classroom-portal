import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

const TEMP_ADMIN_EMAIL = 'admin@allison-classroom.test'
const TEMP_ADMIN_NAME = 'Temporary Admin'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    if (typeof password !== 'string' || password.length < 14) {
      return NextResponse.json({ error: 'Strong temporary password required.' }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()
    const envHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host : 'missing'

    const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listed.error) {
      return NextResponse.json({ error: `listUsers: ${listed.error.message}`, envHost }, { status: 500 })
    }

    const existing = listed.data.users.find((user) => user.email?.toLowerCase() === TEMP_ADMIN_EMAIL)
    let userId = existing?.id
    let authAction = 'existing'

    if (userId) {
      const updated = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { name: TEMP_ADMIN_NAME, temporary: true },
      })
      if (updated.error || !updated.data.user) {
        return NextResponse.json({ error: `updateUser: ${updated.error?.message || 'missing user'}`, envHost }, { status: 500 })
      }
      userId = updated.data.user.id
      authAction = 'updated'
    } else {
      const created = await supabase.auth.admin.createUser({
        email: TEMP_ADMIN_EMAIL,
        password,
        email_confirm: true,
        user_metadata: { name: TEMP_ADMIN_NAME, temporary: true },
      })
      if (created.error || !created.data.user) {
        return NextResponse.json({ error: `createUser: ${created.error?.message || 'missing user'}`, envHost }, { status: 500 })
      }
      userId = created.data.user.id
      authAction = 'created'
    }

    const upsertById = await supabase.from('users').upsert(
      {
        id: userId,
        name: TEMP_ADMIN_NAME,
        email: TEMP_ADMIN_EMAIL,
        role: 'admin',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

    const idLookup = await supabase.from('users').select('id,email,role').eq('id', userId).maybeSingle()
    const emailLookup = await supabase.from('users').select('id,email,role').eq('email', TEMP_ADMIN_EMAIL).maybeSingle()
    const signIn = await supabase.auth.signInWithPassword({ email: TEMP_ADMIN_EMAIL, password })

    return NextResponse.json({
      ok: !upsertById.error && !idLookup.error && !emailLookup.error && !signIn.error,
      envHost,
      authAction,
      userIdSuffix: userId?.slice(-8),
      upsertError: upsertById.error?.message || null,
      idLookupError: idLookup.error?.message || null,
      idLookupRole: idLookup.data?.role || null,
      idLookupEmail: idLookup.data?.email || null,
      emailLookupError: emailLookup.error?.message || null,
      emailLookupRole: emailLookup.data?.role || null,
      emailLookupIdSuffix: emailLookup.data?.id?.slice(-8) || null,
      signInError: signIn.error?.message || null,
      signInUserIdSuffix: signIn.data.user?.id?.slice(-8) || null,
      hasSession: Boolean(signIn.data.session?.access_token),
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown diagnostic error.' }, { status: 500 })
  }
}
