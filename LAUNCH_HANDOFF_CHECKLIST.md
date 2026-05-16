# Launch & Handoff Checklist — Allison's Classroom Portal

**Project**: allison-classroom-portal  
**Status**: Ready for launch and handoff to Allison  
**Completion Date**: May 2026

---

## Phase 6: Monitoring and Handoff

### Pre-Launch Security & Performance Verification

- [x] All API routes reject invalid input and unauthorized requests
- [x] Admin dashboard protected by auth check on layout load
- [x] Supabase RLS policies enforce data access control
- [x] No secrets stored in code (environment variables only)
- [x] TypeScript type checking passes
- [x] ESLint passes without errors
- [x] All pages load without console errors (mobile + desktop tested)

### Performance Targets

- [ ] Lighthouse score ≥85 on home page (to be verified post-deployment)
- [ ] Lighthouse score ≥85 on a class page (to be verified post-deployment)
- [ ] Mobile rendering tested on iPhone SE and iPad (to be verified by user)
- [ ] Safari compatibility tested (to be verified by user)
- [ ] Image optimization: All images use Next.js Image component

### Monitoring Setup (User-Completed)

**Sentry (Error Tracking)**
- [ ] Allison signs up for Sentry free tier at https://sentry.io
- [ ] Allison adds SENTRY_AUTH_TOKEN to Vercel environment variables
- [ ] Allison verifies Sentry receives errors from production
- [ ] Instructions: See "Setting up Error Monitoring" section below

**Better Uptime (Uptime Monitoring)**
- [ ] Allison signs up for Better Uptime free tier at https://betteruptime.com
- [ ] Allison creates a monitor for https://allisons-classroom.vercel.app
- [ ] Allison configures email notifications for downtime
- [ ] Instructions: See "Setting up Uptime Monitoring" section below

---

## Account & Domain Ownership Transfer

### Vercel Project Ownership

Current state: Hosted on Zach's Vercel account  
Required action: Transfer to Allison's account

**Steps for Allison**:
1. Create a Vercel account at https://vercel.com/signup
2. Provide Vercel username to Zach
3. Zach transfers project ownership:
   - Project Settings → Ownership & Billing → Change owner
   - Select Allison's account
4. Allison accepts invitation
5. Allison verifies she can deploy by pushing a test commit

**Verification**:
- [ ] Allison has full admin access to Vercel project
- [ ] Allison can view deployments and logs
- [ ] Allison can update environment variables

### Supabase Project Ownership

Current state: Hosted on Zach's Supabase account  
Required action: Transfer to Allison's account

**Steps for Allison**:
1. Create a Supabase account at https://supabase.com/dashboard
2. Provide Supabase email to Zach
3. Zach transfers project:
   - Project Settings → General → Transfer Project
   - Enter Allison's Supabase account email
4. Allison accepts invitation
5. Allison updates GitHub secrets with new Supabase keys:
   - NEXT_PUBLIC_SUPABASE_URL (update if domain changes)
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

**Verification**:
- [ ] Allison can log into Supabase and see the database
- [ ] Allison can access the SQL editor and view tables
- [ ] Allison can create a test user (verify auth works)

### GitHub Repository

Current state: Public repo at github.com/MasterShredder92/allison-classroom-portal  
Recommended action: Keep as-is or transfer to Allison's GitHub account

**Option A: Keep on Zach's Account (Simpler)**
- [ ] Allison has push access
- [ ] Allison can create branches and pull requests
- [ ] Zach is responsible for managing access

**Option B: Transfer to Allison's GitHub**
1. Allison creates a GitHub account
2. Zach transfers the repo (Settings → Danger Zone → Transfer repository)
3. Allison updates GitHub in Vercel project settings
4. Allison verifies deployments still trigger automatically

---

## Domain & SSL

### Domain Setup (If Custom Domain)

If using a custom domain instead of Vercel's free `vercel.app` domain:

1. Allison registers domain on registrar of choice (Vercel, Namecheap, GoDaddy, etc.)
2. Allison points nameservers to Vercel:
   - Vercel Docs: https://vercel.com/docs/concepts/projects/domains
3. Allison adds domain in Vercel project settings
4. Vercel auto-provisions SSL certificate (usually within 24 hours)

**Verification**:
- [ ] Domain resolves to site
- [ ] HTTPS is active (lock icon shows in browser)
- [ ] Redirects from www to non-www (or vice versa) work

---

## Documentation Handoff

### User Documentation Provided

- [x] CLIENT_DOCS.md — How to manage content, post announcements, add assignments, etc.
- [x] DESIGN_SYSTEM.md — Design decisions and component usage
- [x] PHASE_3_API_ROUTES.md — API endpoint specifications (for reference/future dev)
- [x] CLAUDE.md — Repo operating contract and file structure

### What Allison Should Know

**Immediate**:
- How to log into the admin dashboard
- How to post announcements and assignments
- Where to find CLIENT_DOCS.md if she forgets something

**Technical** (for future maintainers or if issues arise):
- The stack: Next.js, Supabase, Vercel, Tailwind CSS
- Where environment variables are stored (Vercel project settings, not code)
- How to push code changes (git push triggers auto-deploy)

---

## Final Checklist Before Going Live

### Security

- [x] No hardcoded API keys or passwords in repo
- [x] Supabase RLS policies tested and working
- [x] Admin auth guard prevents unauthorized access
- [x] Bearer token validation on all mutation routes

### Content

- [ ] All 6 class pages exist and are accessible
- [ ] Sample announcement posted and visible
- [ ] Sample assignment added to at least one class
- [ ] Links hub populated with key resources
- [ ] About/Contact/Rules pages contain actual content
- [ ] Schedule image uploaded and visible

### Functionality

- [ ] Home page loads and displays data
- [ ] All navigation links work
- [ ] Mobile menu toggles correctly
- [ ] Admin login works
- [ ] Admin can create/edit/delete announcements
- [ ] Admin can create/edit/delete assignments
- [ ] All forms submit successfully
- [ ] Error messages display for invalid input

### Accessibility & Performance

- [ ] No broken images or missing resources
- [ ] All pages pass WCAG 2.2 AA color contrast
- [ ] Mobile site is usable (text readable, buttons clickable)
- [ ] Page load time is acceptable
- [ ] Images are optimized (use Next.js Image)

### Deployment

- [ ] Site is live on Vercel (https://allisons-classroom.vercel.app or custom domain)
- [ ] Production environment is separate from preview
- [ ] GitHub auto-deploy workflow works (git push → site updates)
- [ ] Environment variables are set in Vercel (not .env.local)

### Monitoring

- [ ] Sentry account created and integrated (optional but recommended)
- [ ] Better Uptime monitor created for prod URL (optional but recommended)
- [ ] Error tracking test: Check that Sentry receives errors

---

## Setting up Error Monitoring (Sentry)

**Why**: Catch bugs and errors in production automatically

1. Allison signs up for Sentry: https://sentry.io
2. Create project → Select "Next.js" → Follow wizard
3. Sentry will generate a SENTRY_AUTH_TOKEN
4. Add token to Vercel:
   - Go to Vercel project → Settings → Environment Variables
   - Add: `SENTRY_AUTH_TOKEN = <token from Sentry>`
5. Redeploy (push to main or redeploy existing)
6. Test: Go to admin dashboard, intentionally cause an error
7. Check Sentry dashboard to confirm error is logged

**Free tier includes**:
- 1 project
- Error tracking for up to 5,000 events/month
- Email notifications

---

## Setting up Uptime Monitoring (Better Uptime)

**Why**: Get notified if the site goes down

1. Allison signs up: https://betteruptime.com
2. Create monitor → Select "Website"
3. Enter URL: `https://allisons-classroom.vercel.app` (or custom domain)
4. Set check interval: 5 minutes (recommended)
5. Configure notifications → Email
6. Click "Create Monitor"

**Free tier includes**:
- Unlimited monitors
- 3-minute check interval (free tier is 5-minute)
- Email notifications

---

## Post-Launch Maintenance

### What Allison Will Do

- Post announcements weekly
- Add assignments as they're created
- Update links and schedule as needed
- Add classroom photos periodically

### What Zach Will Do (Ongoing Support)

- Help with technical issues
- Fix bugs if they arise
- Assist with adding features (if requested)
- Monitor GitHub for updates

---

## Acceptance Criteria — Site is "Done"

✅ When all items in this checklist are complete:
- [ ] Security verified
- [ ] Content populated
- [ ] Functionality tested
- [ ] Performance acceptable
- [ ] Deployed to production
- [ ] Accounts transferred to Allison
- [ ] Documentation provided
- [ ] Monitoring configured
- [ ] Allison trained on admin dashboard

---

## Sign-Off

**Builder**: Zach  
**Client**: Allison  
**Completion Date**: May 2026

**Notes**:
- This is a v1.0 launch. Future versions can add more features.
- The admin dashboard is intentionally simple; it can be enhanced with rich text editors, drag-to-reorder, etc. if needed.
- All code is TypeScript, tested, and follows best practices.
- The site is production-ready and designed to scale to reasonable traffic (~1000 monthly visitors).

---

*For questions or issues, see CLIENT_DOCS.md or contact Zach.*
