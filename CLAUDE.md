# Allison Classroom Portal — Builder Notes

**Project**: Classroom parent resource portal for Allison's 5th/6th grade classes at Wilmot Public School.

**Stack**: Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + Zod

**Site URL**: https://allisons-classroom.vercel.app (deployed to Vercel)

## Key Paths

| File/Folder | Purpose |
|---|---|
| `app/` | Next.js pages and layouts |
| `components/` | Reusable React components |
| `lib/supabase/` | Supabase client utilities |
| `lib/validations/` | Zod validation schemas |
| `supabase/migrations/` | SQL migrations |
| `.env.local` | Local environment variables (not committed) |

## Before Building

1. **Supabase Project**: Create a free Supabase project, copy URL and anon key to `.env.local`
2. **Vercel Project**: Link this repo to Vercel, set env vars in Vercel dashboard
3. **Database Schema**: Run Phase 2 migrations after Supabase is connected

## Design System

- **Base**: Notion's warm minimalism (serif headings, soft surfaces, approachable)
- **Content**: Mintlify's reading-optimized layout (clean, hierarchical, content-focused)
- **Colors**: Allison's blue/teal accent with neutral grays and white backgrounds
- **Components**: Card-based, consistent spacing, mobile-first

## Build Phases

| Phase | Status | Goal |
|---|---|---|
| 1 | In Progress | Infrastructure live |
| 2 | Pending | Database + auth working |
| 3 | Pending | API routes complete |
| 4 | Pending | Frontend pages built |
| 5 | Pending | Admin dashboard done |
| 6 | Pending | Monitoring + handoff |

## Quick Commands

```bash
npm run dev          # Start local dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
```

## Notes

- Single admin (Allison) — no multi-user setup in v1
- Public by default — draft/restricted via visibility field
- No direct auth requirement for parents (public site) — Allison auth only
- Supabase RLS policies guard all data

---

*Last updated: 2026-05-16*
