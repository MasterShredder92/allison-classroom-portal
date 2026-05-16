export default function AboutPage() {
  return (
    <div className="classroom-shell py-10 sm:py-14">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <div className="paper-card rounded-[2rem] p-8 sm:p-10">
          <div className="relative z-10">
            <span className="section-eyebrow">Meet the Teacher</span>
            <h1 className="mt-4 font-serif text-5xl font-black tracking-tight text-neutral-text">About Allison&apos;s Classroom</h1>
            <p className="mt-5 text-lg leading-8 text-neutral-dark-gray">This portal gives families one clear place to find classroom updates, assignments, school links, schedules, and snapshots from the school year.</p>
          </div>
        </div>
        <div className="rounded-[2rem] border border-neutral-medium-gray/70 bg-white/80 p-8 shadow-[0_18px_45px_rgba(65,47,25,0.1)]">
          <h2 className="font-serif text-3xl font-black text-neutral-text">Built for parent clarity</h2>
          <div className="mt-6 grid gap-4">
            {['Important announcements stay easy to find.', 'Assignments are grouped by class so families do not hunt.', 'Helpful links live in one organized resource shelf.', 'Classroom moments can be shared without cluttering the main workflow.'].map((item, index) => (
              <div key={item} className="flex gap-4 rounded-2xl bg-neutral-off-white p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-cyan text-sm font-black text-white">{index + 1}</span>
                <p className="font-semibold leading-6 text-neutral-dark-gray">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

