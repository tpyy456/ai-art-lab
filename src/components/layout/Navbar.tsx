import { motion } from 'framer-motion';

const navItems = ['关于我', '工具实验室', '项目', '简历', '联系我'];

function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-0 z-40 border-b border-white/[0.06] bg-black/20 px-5 backdrop-blur-xl sm:px-8 lg:px-14"
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white">
        <a href="#top" className="font-semibold tracking-[0.12em] text-white">
          TPY / AI ART LAB
        </a>

        <div className="hidden items-center gap-8 text-white/70 md:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href="#lab-sections"
              className="transition-colors duration-300 hover:text-lab-red"
            >
              {item}
            </a>
          ))}
        </div>

        <a href="#lab-sections" className="transition-colors duration-300 hover:text-lab-red">
          INFO
        </a>
      </nav>
    </motion.header>
  );
}

export default Navbar;
