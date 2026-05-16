import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export type ApiErrorCode = 400 | 401 | 403 | 404 | 429 | 500

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function created<T>(data: T) {
  return ok(data, 201)
}

export function fail(message: string, status: ApiErrorCode) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function validationFail(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    },
    { status: 400 },
  )
}

export function serverFail(error: unknown, scope: string) {
  console.error(`[${scope}]`, error)
  return fail('Internal server error', 500)
}
