# Allison Classroom Portal — Design System

**Design Philosophy**: Warm minimalism + reading-optimized layout + pastel rainbow identity

---

## Color Palette

Allison's classroom has a beautiful pastel rainbow identity. Use these colors intentionally:

### Primary Palette (Rainbow)

| Color | Hex | Usage | Tailwind |
|---|---|---|---|
| Hot Pink | `#ff89c6` | Highlights, CTAs, focus states | `accent-pink` |
| Light Pink | `#ffbed2` | Backgrounds, soft emphasis | `accent-light-pink` |
| Pale Yellow | `#ffe08d` | Highlights, warmth | `accent-yellow` |
| Turquoise | `#00d0d0` | Headers, primary actions | `accent-cyan` |
| Sky Blue | `#69dcf1` | Secondary actions, info | `accent-sky-blue` |
| Lavender | `#acaeeb` | Tertiary actions, calm | `accent-lavender` |
| Mauve | `#d596cd` | Accents, playfulness | `accent-purple` |

### Neutral Palette

| Color | Hex | Usage | Tailwind |
|---|---|---|---|
| Off-White | `#f9f9f9` | Primary background | `neutral-off-white` |
| Light Gray | `#f3f3f3` | Card backgrounds, dividers | `neutral-light-gray` |
| Medium Gray | `#e8e8e8` | Borders, subtle dividers | `neutral-medium-gray` |
| Dark Gray | `#5a5a5a` | Secondary text, muted labels | `neutral-dark-gray` |
| Text Black | `#333333` | Primary text, body copy | `neutral-text` |

---

## Typography

### Font Families

- **Headings**: Georgia, Garamond (serif) — warm, approachable, friendly
- **Body**: System fonts (sans-serif) — clean, readable

### Scale

| Element | Size | Weight | Usage |
|---|---|---|---|
| Page Title | 2.5rem (40px) | 700 | H1 |
| Section Title | 2rem (32px) | 600 | H2 |
| Subsection | 1.5rem (24px) | 600 | H3 |
| Card Title | 1.25rem (20px) | 600 | Card headings |
| Body Text | 1rem (16px) | 400 | Paragraphs, labels |
| Small Text | 0.875rem (14px) | 400 | Captions, metadata |

---

## Components

### Cards

- Background: `neutral-light-gray`
- Border: Subtle shadow or `neutral-medium-gray` border
- Padding: 1.5rem (consistent throughout)
- Radius: 0.5rem (moderate roundness)

**Accent**: Use one color from the rainbow palette to accent each card type:
- Announcements: Hot Pink accent bar on left
- Assignments: Turquoise accent bar
- Links: Sky Blue accent bar
- Photos: Lavender accent bar

### Buttons

- **Primary CTA**: Turquoise (`accent-cyan`) background, white text
- **Secondary**: Light Gray background, dark text
- **Hover**: Slightly darker shade, subtle shadow
- **Disabled**: Medium Gray, lighter text

### Links

- Color: Turquoise (`accent-cyan`)
- Hover: Underline + slightly darker shade
- Visited: Lavender (`accent-lavender`)

### Spacing

- Card gap: 1.5rem
- Section gap: 2rem
- Padding (cards/containers): 1.5rem
- Padding (sections): 2rem

---

## Layout Principles

1. **Warm Minimalism** (from Notion):
   - Generous whitespace
   - Serif headings for approachability
   - Soft, rounded corners
   - Clear hierarchy

2. **Reading-Optimized** (from Mintlify):
   - Max line length ~65 characters for body text
   - Clear visual hierarchy
   - Content-focused design
   - Cards group related information

3. **Pastel Rainbow Identity**:
   - Each card type has a signature color accent
   - Use colors to guide attention and categorize
   - Avoid color overload — use pastels sparingly for emphasis
   - White/gray backgrounds keep content readable

---

## Mobile-First Approach

- Base design for 375px (iPhone SE)
- Tablet breakpoint at 768px (iPad)
- Desktop breakpoint at 1024px

### Responsive Guidelines

- **Cards**: Stack vertically on mobile, 2 columns at 768px, 3 columns at 1024px
- **Navigation**: Hamburger menu on mobile, horizontal nav at 768px+
- **Text**: Scale typography down 10-15% on mobile for readability

---

## Dark Mode

**Status**: Not included in v1. Can add later if requested.

---

## Component Library Reference

| Component | File | Status |
|---|---|---|
| GlobalHeader | `components/GlobalHeader.tsx` | Phase 4 |
| QuickLinkBar | `components/QuickLinkBar.tsx` | Phase 4 |
| AnnouncementCard | `components/AnnouncementCard.tsx` | Phase 4 |
| AssignmentCard | `components/AssignmentCard.tsx` | Phase 4 |
| LinkCard | `components/LinkCard.tsx` | Phase 4 |
| ScheduleImageBlock | `components/ScheduleImageBlock.tsx` | Phase 4 |
| PhotoUpdateCard | `components/PhotoUpdateCard.tsx` | Phase 4 |

---

## Usage Examples

### Announcement Card with Hot Pink Accent

```tsx
<div className="bg-neutral-light-gray rounded-lg p-6 border-l-4 border-accent-pink">
  <h3 className="font-serif text-xl font-semibold text-neutral-text mb-2">
    {announcement.title}
  </h3>
  <p className="text-neutral-dark-gray text-sm mb-3">
    {new Date(announcement.date).toLocaleDateString()}
  </p>
  <p className="text-neutral-text leading-relaxed">
    {announcement.body}
  </p>
</div>
```

### Primary CTA Button

```tsx
<button className="bg-accent-cyan hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded transition-colors">
  View Assignment
</button>
```

### Quick Link Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {links.map((link) => (
    <a
      href={link.url}
      className="bg-neutral-light-gray p-6 rounded border-b-4 border-accent-sky-blue hover:shadow-lg transition-shadow"
    >
      {link.title}
    </a>
  ))}
</div>
```

---

## Lighthouse + Performance

- Target Lighthouse score: ≥85
- Mobile: Test on real devices, not just Chrome DevTools
- Images: Use Next.js Image component with proper sizes
- Fonts: Use system fonts first (already loaded)

---

**Last Updated**: 2026-05-16  
**Version**: 1.0 (Allison's Pastel Rainbow Palette)
