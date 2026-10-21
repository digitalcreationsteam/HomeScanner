import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";
import Magnetic from "./Magnetic";
const links = [
  ["Product", "/"],
  ["For Builders", "/#builders"],
  ["For Homeowners", "/#homeowners"],
  ["How It Works", "/#how"],
  ["About", "/about"],
];

const ease = [0.22, 1, 0.36, 1];

const panel = {
  hidden: { opacity: 0, scale: 0.92, y: -14 },
  show: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.35, ease, when: "beforeChildren", staggerChildren: 0.05, delayChildren: 0.08 },
  },
  exit: { opacity: 0, scale: 0.94, y: -10, transition: { duration: 0.22, ease: "easeIn" } },
};

const row = {
  hidden: { opacity: 0, x: 14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease } },
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const close = () => setOpen(false);

  // close on route / hash change
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);

  // Esc to close + lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between">
        <Link to="/" onClick={close} className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-deep text-white"><Icon name="qr" className="h-5 w-5" /></span>
          <span className="leading-tight">
            <span className="block text-lg font-medium tracking-tight">HomeScanner</span>
            <span className="hidden text-[10px] text-muted sm:block">The digital passport of your home.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
        <Magnetic className="hidden sm:inline-block">
  <Link to="/demo" className="btn btn-accent !py-2.5">Book a Demo</Link>
</Magnetic>
<Magnetic strength={0.25}>
          {/* Menu pill */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-haspopup="dialog"
            className="group flex items-center gap-3 rounded-full border border-line bg-white py-1.5 pl-5 pr-1.5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-sm font-semibold text-ink">Menu</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-deep transition-colors group-hover:bg-ink">
              <span className="flex flex-col gap-[5px]">
                <span className="block h-[1.5px] w-4 rounded bg-white transition-transform group-hover:translate-x-0.5" />
                <span className="block h-[1.5px] w-4 rounded bg-white transition-transform group-hover:-translate-x-0.5" />
              </span>
            </span>
          </motion.button>
          </Magnetic>
        </div>
      </div>

      {/* Portal: the header's backdrop-blur would otherwise trap position:fixed children */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* backdrop */}
              <motion.div
                key="backdrop"
                className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={close}
              />

              {/* modal card */}
              <motion.div
                key="panel"
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                variants={panel}
                initial="hidden"
                animate="show"
                exit="exit"
                style={{ transformOrigin: "top right" }}
                className="fixed right-4 top-4 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_-20px_rgba(15,15,25,0.35)] md:right-8 md:top-6"
              >
                <button
                  onClick={close}
                  aria-label="Close menu"
                  className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink transition-all hover:rotate-90 hover:border-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>

                <nav className="px-6 pb-2 pt-5">
                  <ul>
                    {links.map(([label, to], i) => (
                      <motion.li key={label} variants={row} className="border-b border-dashed border-line last:border-b-0">
                        <Link
                          to={to}
                          onClick={close}
                          className="group flex items-center gap-4 py-4 pr-10 text-muted transition-colors hover:text-ink focus-visible:text-ink"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-sm font-semibold transition-colors group-hover:bg-deep group-hover:text-white group-focus-visible:bg-deep group-focus-visible:text-white">
                            {i + 1}
                          </span>
                          <span className="text-xl font-semibold tracking-tight">{label}</span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                <motion.div variants={row} className="border-t border-line p-4">
                  <Link
                    to="/demo"
                    onClick={close}
                    className="flex items-center justify-center gap-3 rounded-full bg-deep py-3 pl-3 pr-6 text-lg font-semibold text-white transition-colors hover:bg-ink"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
                      <Icon name="phone" className="h-4 w-4" />
                    </span>
                    Book a Demo
                  </Link>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}