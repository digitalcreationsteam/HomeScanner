import { useEffect, useState } from "react";
import { AnimatePresence, motion, animate, useMotionValue, useTransform } from "framer-motion";
import Icon from "./Icon";

const ease = [0.76, 0, 0.24, 1];
const NAME = "HomeScanner".split("");

const letters = { hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.25 } } };
const letter = { hidden: { y: "110%" }, show: { y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

export default function Preloader({ onReveal }) {
  const [show, setShow] = useState(true);
  const progress = useMotionValue(0);
  const count = useTransform(progress, (v) => Math.round(v));
  const barScale = useTransform(progress, [0, 100], [0, 1]); 
  useEffect(() => {
    document.body.style.overflow = "hidden";
    let alive = true;

    // wait for: minimum show time + page load + fonts
    const loaded = new Promise((res) => {
      if (document.readyState === "complete") res();
      else window.addEventListener("load", res, { once: true });
    });
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const toNinety = animate(progress, 90, { duration: 1.6, ease: "easeOut" });

    Promise.all([loaded, fonts, toNinety])
      .then(() => animate(progress, 100, { duration: 0.4, ease: "easeInOut" }))
      .then(() => new Promise((r) => setTimeout(r, 200)))
      .then(() => {
        if (!alive) return;
        document.body.style.overflow = "";
        setShow(false);
        onReveal?.();
      });

    return () => { alive = false; document.body.style.overflow = ""; };
  }, [progress, onReveal]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] bg-ink text-white"
          exit={{ y: "-100%", transition: { duration: 0.9, ease } }}
        >
          {/* curved bottom edge that travels with the curtain */}
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute left-0 top-full h-[10vh] w-full fill-ink" aria-hidden="true">
            <path d="M0 0H100Q50 10 0 0Z" />
          </svg>

          <motion.div
            className="grid h-full place-items-center"
            exit={{ opacity: 0, y: -24, transition: { duration: 0.4, ease: "easeIn" } }}
          >
            <div className="flex flex-col items-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="grid h-16 w-16 place-items-center rounded-2xl bg-deep"
              >
                <Icon name="qr" className="h-8 w-8" />
              </motion.span>

              <motion.h1 variants={letters} initial="hidden" animate="show" className="mt-6 flex overflow-hidden text-4xl font-medium tracking-tight md:text-5xl" aria-label="HomeScanner">
                {NAME.map((c, i) => (
                  <motion.span key={i} variants={letter} className="inline-block">{c}</motion.span>
                ))}
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }} className="mt-3 text-sm text-white/50">
                The digital passport of your home.
              </motion.p>
            </div>
          </motion.div>

          {/* counter + progress line */}
          <motion.div className="absolute inset-x-0 bottom-0 p-6 md:p-10" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
            <div className="flex items-end justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Loading</p>
              <p className="flex text-6xl font-medium tabular-nums leading-none md:text-8xl">
                <motion.span>{count}</motion.span><span className="text-white/30">%</span>
              </p>
            </div>
            <div className="mt-5 h-px w-full bg-white/10">
            <motion.div className="h-full origin-left bg-sky" style={{ scaleX: barScale }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}