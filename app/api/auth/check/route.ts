import { NextRequest, NextResponse } from 'next/server'
import { getBearerToken } from '@/lib/api/request'
import { createServiceSupabaseClient, createUserSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const accessToken = getBearerToken(request)

    if (!accessToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const userSupabase = createUserSupabaseClient(accessToken)
    const { data: authData, error: authError } = await userSupabase.auth.getUser(accessToken)

    if (authError || !authData.user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const supabase = createServiceSupabaseClient()
    const { data: adminCheck } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (adminCheck?.role !== 'admin') {
      return NextResponse.json({ authenticated: false }, { status: 403 })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
