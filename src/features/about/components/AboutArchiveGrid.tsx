import { Fragment } from 'react';

const archiveItems = [
  { id: '01', title: 'SCULPTURE WORK', desc: 'Physical materials & spatial forms' },
  { id: '02', title: 'GRADUATION PROJECT', desc: 'Early conceptual explorations' },
  { id: '03', title: 'EXHIBITION TRACE', desc: 'Gallery views & offline presence' },
  { id: '04', title: 'PROCESS IMAGE', desc: 'Behind the scenes & raw drafts' },
  { id: '05', title: 'LIFE FRAGMENT', desc: 'Unstructured daily records' },
  { id: '06', title: 'STUDY DESK', desc: 'Where the digital shell is built' },
];

function ArchiveCard({ item }: { item: typeof archiveItems[0] }) {
  return (
    <article className="group relative w-[280px] shrink-0 cursor-pointer sm:w-[360px] lg:w-[420px]">
      {/* Image Placeholder */}
      <div className="relative aspect-[16/9] w-full overflow-hidden border border-white/5 bg-[#0a0a0a] transition-colors duration-500 group-hover:border-white/15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)] transition-opacity duration-500 group-hover:opacity-50" />
        <div className="absolute inset-0 mix-blend-overlay bg-lab-red/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="absolute inset-0 flex items-center justify-center text-[10px] tracking-[0.2em] text-white/20 transition-colors duration-500 group-hover:text-white/50 font-mono">
          [ IMAGE PENDING ]
        </div>

        {/* Corner marks */}
        <span className="absolute left-3 top-3 h-2 w-2 border-l border-t border-white/20 transition-colors duration-500 group-hover:border-lab-red/60" />
        <span className="absolute bottom-3 right-3 h-2 w-2 border-b border-r border-white/20 transition-colors duration-500 group-hover:border-lab-red/60" />

        {/* Hover scanline accent */}
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-lab-red transition-all duration-700 ease-out group-hover:w-full" />
      </div>

      {/* Metadata */}
      <div className="mt-4 px-1">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-lab-red/70">[ TRACE-{item.id} ]</span>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/80 transition-colors duration-300 group-hover:text-white">{item.title}</h3>
        </div>
      </div>
    </article>
  );
}

export default function AboutArchiveGrid() {
  // We duplicate the items to create a seamless loop
  const duplicatedItems = [...archiveItems, ...archiveItems];

  // Split into two rows, but use the same set for both to ensure they are long enough.
  // In a real scenario, you might have 12 distinct items.
  const row1 = duplicatedItems;
  const row2 = [...archiveItems].reverse().concat([...archiveItems].reverse());

  return (
    <section className="py-20 sm:py-28 overflow-hidden -mx-5 sm:-mx-8 lg:-mx-14 px-5 sm:px-8 lg:px-14">
      <div className="mb-14 flex items-end justify-between border-b border-white/10 pb-6 max-w-7xl mx-auto">
        <div>
          <p className="text-[10px] uppercase tracking-[0.36em] text-lab-red">Archive</p>
          <h2 className="mt-3 text-2xl font-medium uppercase tracking-[0.18em] text-white sm:text-3xl">
            WORK TRACE
          </h2>
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex flex-col gap-10">
        
        {/* Track 1: Left to Right */}
        <div className="group flex overflow-hidden">
          <div className="flex gap-6 w-max animate-scroll-left hover:[animation-play-state:paused] motion-reduce:animate-none">
            {row1.map((item, index) => (
              <Fragment key={`r1-${index}`}>
                <ArchiveCard item={item} />
              </Fragment>
            ))}
          </div>
        </div>

        {/* Track 2: Right to Left */}
        <div className="group flex overflow-hidden">
          <div className="flex gap-6 w-max animate-scroll-right hover:[animation-play-state:paused] motion-reduce:animate-none">
            {row2.map((item, index) => (
              <Fragment key={`r2-${index}`}>
                <ArchiveCard item={item} />
              </Fragment>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}