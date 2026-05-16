export default function ContactPage() {
  return (
    <div className="classroom-shell py-10 sm:py-14">
      <section className="paper-card rounded-[2rem] p-8 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <span className="section-eyebrow">Contact</span>
          <h1 className="mt-4 font-serif text-5xl font-black tracking-tight text-neutral-text">Need to reach Allison?</h1>
          <p className="mt-4 text-lg leading-8 text-neutral-dark-gray">Use the school&apos;s preferred communication channel for classroom questions, assignment clarification, or schedule needs.</p>
        </div>
      </section>
      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-[1.7rem] border border-neutral-medium-gray/70 bg-white p-7 shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent-light-pink/45 text-2xl">💬</div>
          <h2 className="font-serif text-2xl font-black text-neutral-text">Classroom communication</h2>
          <p className="mt-3 leading-7 text-neutral-dark-gray">Check ClassDojo, Google Classroom, and posted announcements first for routine updates.</p>
        </div>
        <div className="rounded-[1.7rem] border border-neutral-medium-gray/70 bg-white p-7 shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent-sky-blue/40 text-2xl">🏫</div>
          <h2 className="font-serif text-2xl font-black text-neutral-text">School office</h2>
          <p className="mt-3 leading-7 text-neutral-dark-gray">For urgent or official school matters, use Wilmot Public School&apos;s office communication process.</p>
        </div>
      </section>
    </div>
  )
}

