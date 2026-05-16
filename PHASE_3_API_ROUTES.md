# Phase 3: API Routes — Builder Brief for Manus

**Project**: allison-classroom-portal  
**Task**: Build 7 Next.js API routes with Zod validation, auth guards, and rate limiting  
**Status**: Zod schemas committed to main

## Validation Schemas (Already Committed)

All Zod schemas are in `lib/validations/`:
- `announcement.ts` → `AnnouncementInput`
- `assignment.ts` → `AssignmentInput`
- `link.ts` → `LinkInput`
- `page.ts` → `PageContentInput`, `ScheduleInput`, `PhotoUpdateInput`

Use these in each route.

## 7 API Routes to Build

### Route 1: `/api/announcements`

**Methods:**
- `GET` — Return all announcements with visibility='public' or 'link_only'
- `POST` — Create announcement (auth + admin required)
- `PUT` — Update announcement by ID (auth + admin required)
- `DELETE` — Delete announcement by ID (auth + admin required)

**Implementation:**
- GET: Simple SELECT from announcements WHERE visibility IN ('public', 'link_only')
- POST/PUT/DELETE: Validate body against `announcementSchema`, check auth (user role = 'admin'), then INSERT/UPDATE/DELETE
- Rate limit: 10 requests/minute for POST/PUT/DELETE
- Error: Return 400 for validation failure, 401 for auth failure, 404 for not found

**Response Format:**
```json
{
  "success": true,
  "data": [{ id, title, body, date, pinned, visibility, ... }]
}
```

---

### Route 2: `/api/assignments`

**Methods:**
- `GET` — Return assignments with visibility='public' filtered by optional query param `class_id`
- `POST` — Create assignment (auth + admin)
- `PUT` — Update assignment by ID (auth + admin)
- `DELETE` — Delete assignment by ID (auth + admin)

**Implementation:**
- GET: `SELECT * FROM assignments WHERE visibility IN ('public', 'link_only') AND (class_id = ? OR class_id IS ANY(ARRAY[...]))`
  - Support optional `?class_id=uuid` query param to filter by single class
  - Support `?classes=uuid1,uuid2` to filter by multiple classes
- POST/PUT/DELETE: Validate against `assignmentSchema`, auth check, then CRUD
- Rate limit: 10 requests/minute for mutations

**Response:**
```json
{
  "success": true,
  "data": [{ id, class_id, title, description, due_date, resource_type, resource_url, visibility, ... }]
}
```

---

### Route 3: `/api/classes`

**Methods:**
- `GET` — Return all 6 classes (public, no auth needed)

**Implementation:**
- Simple SELECT all from classes, ordered by sort_order
- No POST/PUT/DELETE needed in v1

**Response:**
```json
{
  "success": true,
  "data": [
    { id, grade, subject, display_name, slug, sort_order },
    ...
  ]
}
```

---

### Route 4: `/api/links`

**Methods:**
- `GET` — Return all active links (active=true)
- `POST` — Create link (auth + admin)
- `PUT` — Update link by ID (auth + admin)
- `DELETE` — Delete link by ID (auth + admin)

**Implementation:**
- GET: `SELECT * FROM links WHERE active = true ORDER BY category, sort_order`
- POST/PUT/DELETE: Validate against `linkSchema`, auth check, CRUD
- Rate limit: 10 requests/minute for mutations

**Response:**
```json
{
  "success": true,
  "data": [
    { id, category, title, url, description, audience, sort_order, active },
    ...
  ]
}
```

---

### Route 5: `/api/schedule`

**Methods:**
- `GET` — Return the active schedule record
- `PUT` — Update schedule (auth + admin)

**Implementation:**
- GET: `SELECT * FROM schedule WHERE active = true LIMIT 1`
- PUT: Validate against `scheduleSchema`, auth check, then UPDATE schedule SET ... WHERE active = true
- Rate limit: 10 requests/minute for PUT

**Response:**
```json
{
  "success": true,
  "data": { id, title, image_url, notes, active }
}
```

---

### Route 6: `/api/photo-updates`

**Methods:**
- `GET` — Return all photo updates with visibility='public'
- `POST` — Create photo update (auth + admin)
- `PUT` — Update photo update by ID (auth + admin)
- `DELETE` — Delete photo update by ID (auth + admin)

**Implementation:**
- GET: `SELECT * FROM photo_updates WHERE visibility = 'public' ORDER BY date DESC`
- POST/PUT/DELETE: Validate against `photoUpdateSchema`, auth check, CRUD
- Rate limit: 10 requests/minute for mutations

**Response:**
```json
{
  "success": true,
  "data": [
    { id, title, caption, image_url, date, visibility },
    ...
  ]
}
```

---

### Route 7: `/api/page-content/[slug]`

**Methods:**
- `GET` — Return page content by slug
- `PUT` — Update page content by slug (auth + admin)

**Implementation:**
- GET: `SELECT * FROM page_content WHERE slug = ?`
- PUT: Validate against `pageContentSchema`, auth check, then UPDATE
- Rate limit: 10 requests/minute for PUT

**Response:**
```json
{
  "success": true,
  "data": { id, slug, title, body_markdown, updated_at }
}
```

---

## Auth Guard Pattern

For all protected routes, check:
```typescript
const auth = await createServerClient()
const user = await auth.auth.getUser()

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const adminCheck = await db
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single()

if (adminCheck.data?.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

## Rate Limiting Pattern

Use a simple in-memory rate limiter (or Upstash Redis if needed). For simplicity, use `Ratelimit` from `@upstash/ratelimit`:

```typescript
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})

const { success, pending, limit, reset, remaining } = await ratelimit.limit(
  `api_${user.id}`
)

if (!success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  )
}
```

*Alternative (no external service): Use a simple object cache with timestamps. Acceptable for MVP.*

## Error Handling Pattern

All routes should return:
- 400: Validation failure (bad input)
- 401: Not authenticated
- 403: Not authorized (not admin)
- 404: Resource not found
- 429: Rate limit exceeded
- 500: Server error (log to Sentry)

```typescript
try {
  // ... logic
} catch (error) {
  console.error('[API_ERROR]', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## File Structure

```
app/api/
├── announcements/
│   └── route.ts
├── assignments/
│   └── route.ts
├── classes/
│   └── route.ts
├── links/
│   └── route.ts
├── schedule/
│   └── route.ts
├── photo-updates/
│   └── route.ts
└── page-content/
    └── [slug]/
        └── route.ts
```

## Testing Checklist

Before committing, test in Postman / cURL:

- [ ] GET `/api/classes` returns 6 rows (no auth)
- [ ] GET `/api/announcements` returns only public announcements
- [ ] GET `/api/assignments?class_id=uuid` filters correctly
- [ ] POST `/api/announcements` with valid auth creates record
- [ ] POST `/api/announcements` without auth returns 401
- [ ] POST with invalid body (missing required fields) returns 400
- [ ] PUT `/api/schedule` with auth updates schedule
- [ ] DELETE `/api/announcements/uuid` with auth deletes record
- [ ] Rate limit activates after 10 mutations/min on protected routes

## Return to Zach After Completion

```
Phase 3: API Routes Complete

✓ All 7 routes implemented
✓ Zod validation on all POST/PUT/DELETE
✓ Auth guards on all mutations
✓ Rate limiting on all mutations
✓ Error handling (400/401/403/404/429/500)
✓ Manual testing passed
✓ Committed to main

Ready for Phase 4 (Frontend)
```

Include commit SHA.
