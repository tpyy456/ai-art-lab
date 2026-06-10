const archiveItems = [
  'SCULPTURE WORK',
  'GRADUATION PROJECT',
  'EXHIBITION TRACE',
  'PROCESS IMAGE',
  'LIFE FRAGMENT',
  'STUDY DESK',
];

export default function AboutArchiveGrid() {
  return (
    <section className="border-t border-white/10 py-16 sm:py-20">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.36em] text-lab-red">Archive</p>
          <h2 className="mt-3 text-2xl font-medium uppercase tracking-[0.18em] text-white sm:text-3xl">
            WORK TRACE
          </h2>
        </div>
        <div className="hidden h-px flex-1 bg-white/10 sm:block" />
      </div>

      <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {archiveItems.map((item, index) => (
          <article key={item} className="group min-h-64 bg-[#070707] p-5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-white/28">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span className="h-px w-8 bg-lab-red/50" />
            </div>
            <div className="mt-8 h-36 border border-white/8 bg-[radial-gradient(circle_at_40%_28%,rgba(255,255,255,0.08),transparent_9rem),linear-gradient(135deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] transition-colors duration-300 group-hover:border-lab-red/30" />
            <h3 className="mt-5 text-sm font-medium uppercase tracking-[0.2em] text-white/74">{item}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
