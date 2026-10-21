import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import Icon from "./Icon";
import Magnetic from "./Magnetic";
import FooterModels, { MODEL_NAMES } from "./FooterModels";
import { footerCols } from "../data";

const ease = [0.22, 1, 0.36, 1];
const spring = { type: "spring", stiffness: 320, damping: 20 };
const viewport = { once: true, margin: "-60px" };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };

const WORD = "HomeScanner".split("");
const textGradient = (a) => `linear-gradient(180deg, rgba(120,169,206,${a}) 0%, rgba(120,169,206,0) 85%)`;

/* small inline social icons */
const socials = [
  {
    label: "LinkedIn",
    href: "#top",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.83v1.57h.06c.53-1 1.84-2.07 3.78-2.07 4.04 0 4.78 2.66 4.78 6.12v5.88h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.29h-4V9.75Z",
  },
  {
    label: "Instagram",
    href: "#top",
    path: "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z",
  },
  {
    label: "X",
    href: "#top",
    path: "M17.53 3H20.6l-6.7 7.66L21.8 21h-6.18l-4.84-6.33L5.24 21H2.17l7.17-8.2L2.2 3h6.34l4.37 5.78L17.53 3Zm-1.08 16.15h1.7L7.62 4.76H5.8l10.65 14.39Z",
  },
];

function scrollToTop() {
  if (window.__lenis) window.__lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Footer() {
  const stageRef = useRef(null);
  const seen = useInView(stageRef, { once: true, margin: "200px" }); // mount WebGL only when the footer is near
  const [hover, setHover] = useState(null); // { i, x, w, on }

  const activate = (i, el) => {
    const box = stageRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setHover({ i, x: r.left + r.width / 2 - box.left - box.width / 2, w: box.width, on: true });
  };
  const deactivate = () => setHover((h) => (h ? { ...h, on: false } : h));
  const modelScale = hover ? Math.min(85, Math.max(48, hover.w / 17)) : 85;

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* backdrop: blueprint grid + soft glows */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "linear-gradient(#78A9CE 1px, transparent 1px), linear-gradient(90deg, #78A9CE 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 0%, #000 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, #000 10%, transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-0 h-[360px] w-[360px] rounded-full bg-deep/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-20 h-[300px] w-[300px] rounded-full bg-sky/15 blur-3xl" />

      <div className="wrap relative">
        {/* top: brand + columns */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid gap-12 pb-14 pt-20 md:grid-cols-[1.5fr_repeat(4,1fr)]"
        >
          <motion.div variants={item} className="max-w-xs">
            <Link to="/" className="flex items-center gap-3">
              <motion.span
                whileHover={{ rotate: -8, scale: 1.08, transition: spring }}
                className="grid h-10 w-10 place-items-center rounded-xl bg-deep"
              >
                <Icon name="qr" className="h-5 w-5" />
              </motion.span>
              <span className="leading-tight">
                <span className="block text-lg font-medium">HomeScanner</span>
                <span className="block text-[10px] text-white/50">The digital passport of your home.</span>
              </span>
            </Link>

            <p className="mt-6 text-sm leading-relaxed text-white/55">
              A permanent digital record of your property: materials, appliances, installations and maintenance information, all in one place.
            </p>

            <div className="mt-7 flex gap-2.5">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  whileHover={{ y: -4, scale: 1.1, transition: spring }}
                  whileTap={{ scale: 0.92 }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-colors hover:border-sky hover:bg-sky/20 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d={s.path} /></svg>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {footerCols.map(([title, items]) => (
            <motion.div key={title} variants={item}>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">{title}</p>
              <ul className="mt-5 space-y-3 text-sm">
                {items.map(([label, to]) => (
                  <li key={label}>
                    <motion.span whileHover={{ x: 6, transition: spring }} className="inline-block">
                      <Link to={to} className="group inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white">
                        {label}
                        <Icon name="arrow" className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </motion.span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col items-start justify-between gap-5 border-t border-white/10 py-6 text-xs text-white/45 sm:flex-row sm:items-center"
        >
          <p>© 2026 HomeScanner. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="#top" className="transition-colors hover:text-white">Privacy Policy</a>
            <a href="#top" className="transition-colors hover:text-white">Terms of Use</a>
            <Magnetic>
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white/80 transition-colors hover:border-sky hover:bg-sky/20 hover:text-white"
              >
                Back to top
                <Icon name="arrow" className="h-3 w-3 -rotate-90" />
              </button>
            </Magnetic>
          </div>
        </motion.div>
      </div>

      {/* giant wordmark: hover a letter to raise a 3D model above it */}
      <div ref={stageRef} className="relative">
        {seen && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 z-30"
            style={{ bottom: "calc(100% - 1.8vw)", height: 300 }}
          >
            <FooterModels index={hover?.on ? hover.i : null} x={hover ? hover.x : 0} scale={modelScale} />

            <div className="absolute inset-x-0 bottom-2 flex justify-center">
              <motion.span
                initial={false}
                animate={{ x: hover ? hover.x : 0, opacity: hover?.on ? 1 : 0, y: hover?.on ? 0 : 8 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80 backdrop-blur"
              >
                {hover ? `${String(hover.i + 1).padStart(2, "0")} · ${MODEL_NAMES[hover.i]}` : ""}
              </motion.span>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1, ease }}
          aria-hidden="true"
          className="select-none px-4 text-center"
        >
          <p
            className="-mb-[0.18em] flex justify-center font-semibold uppercase leading-[0.85] tracking-[-0.04em]"
            style={{ fontSize: "clamp(3rem, 14.5vw, 14rem)" }}
          >
            {WORD.map((ch, i) => {
              const on = hover?.on && hover.i === i;
              return (
                <span
                  key={i}
                  onPointerEnter={(e) => activate(i, e.currentTarget)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && deactivate()}
                  onClick={(e) => activate(i, e.currentTarget)}
                  className="inline-block cursor-pointer transition-opacity duration-300"
                  style={{
                    backgroundImage: textGradient(on ? 0.9 : 0.35),
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}