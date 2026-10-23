import { useEffect, useState } from "react";
import { AnimatePresence, motion, animate, useMotionValue, useTransform } from "framer-motion";

const ease = [0.76, 0, 0.24, 1];
const NAME = "HomeScanner".split("");

const letters = { hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.25 } } };
const letter = { hidden: { y: "110%" }, show: { y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

/* a stroke that draws itself between two progress values */
function Draw({ progress, from, to, as = "path", ...rest }) {
  const pathLength = useTransform(progress, [from, to], [0, 1], { clamp: true });
  const opacity = useTransform(progress, [from, from + 0.5], [0, 1], { clamp: true });
  const Tag = motion[as];
  return <Tag {...rest} style={{ pathLength, opacity }} />;
}

/* fades an element in between two progress values */
function Fade({ progress, from, to, max = 1, as = "g", ...rest }) {
  const opacity = useTransform(progress, [from, to], [0, max], { clamp: true });
  const Tag = motion[as];
  return <Tag {...rest} style={{ opacity }} />;
}

/* window: frame, cross mullions, sill, and warm light at the end */
function Win({ progress, x, y, from }) {
  const w = 24, h = 24;
  return (
    <g>
      <Fade progress={progress} from={92} to={100} max={0.9} as="rect" x={x} y={y} width={w} height={h} fill="#FFE2A3" stroke="none" />
      <Draw progress={progress} from={from} to={from + 8} as="rect" x={x} y={y} width={w} height={h} rx="1" />
      <Draw progress={progress} from={from + 6} to={from + 13} d={`M${x + w / 2} ${y}V${y + h}M${x} ${y + h / 2}H${x + w}`} strokeWidth="1" />
      <Draw progress={progress} from={84} to={91} d={`M${x - 3} ${y + h + 2.5}H${x + w + 3}`} strokeWidth="1.4" />
    </g>
  );
}

function House({ progress }) {
  const halo = useTransform(progress, [92, 100], [0, 0.6], { clamp: true });
  const wallFill = useTransform(progress, [40, 60], [0, 1], { clamp: true });
  const roofFill = useTransform(progress, [58, 76], [0, 0.9], { clamp: true });

  return (
    <svg viewBox="0 0 320 250" className="h-[210px] w-auto md:h-[250px]" role="img" aria-label="A house being drawn">
      <defs>
        <pattern id="pl-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#78A9CE" strokeOpacity="0.1" strokeWidth="1" />
        </pattern>
        <radialGradient id="pl-halo" cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor="#78A9CE" stopOpacity="0.5" />
          <stop offset="1" stopColor="#78A9CE" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="250" fill="url(#pl-grid)" />
      <motion.rect width="320" height="250" fill="url(#pl-halo)" style={{ opacity: halo }} />

      {/* fills sit under the linework */}
      <motion.rect x="80" y="116" width="160" height="84" fill="#243845" style={{ opacity: wallFill }} />
      <motion.polygon points="66,116 160,58 254,116" fill="#2D4B5E" style={{ opacity: roofFill }} />

      <g fill="none" stroke="#78A9CE" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* drafting guides: centre axis + dimension lines */}
        <Fade progress={progress} from={0} to={8} max={0.4}>
          <line x1="160" y1="38" x2="160" y2="232" strokeDasharray="4 4" strokeWidth="1" />
          <path d="M80 224H240M80 219V229M240 219V229" strokeWidth="1" />
          <path d="M50 116V200M45 116H55M45 200H55" strokeWidth="1" />
        </Fade>

        {/* ground + hatching */}
        <Draw progress={progress} from={0} to={10} d="M24 208H296" />
        <Fade progress={progress} from={8} to={16} max={0.35}>
          {Array.from({ length: 11 }, (_, k) => <line key={k} x1={32 + k * 26} y1="210" x2={24 + k * 26} y2="218" strokeWidth="1" />)}
        </Fade>

        {/* foundation plinth */}
        <Draw progress={progress} from={10} to={20} as="rect" x="76" y="200" width="168" height="8" />

        {/* walls + storey slab */}
        <Draw progress={progress} from={20} to={38} d="M80 200V116H240V200" />
        <Draw progress={progress} from={34} to={42} d="M80 158H240" strokeWidth="1.2" />

        {/* roof: eaves, slopes, tile lines */}
        <Draw progress={progress} from={40} to={52} d="M66 116L160 58L254 116Z" />
        <Draw progress={progress} from={50} to={58} d="M94 100H226M118 84H196M137 72H183" strokeWidth="1" />

        {/* chimney */}
        <Fade progress={progress} from={50} to={56} as="path" d="M198 82V62H214V92Z" fill="#1C2C35" stroke="none" />
        <Draw progress={progress} from={50} to={58} d="M198 82V62H214V92M195 62H217" />

        {/* door, centred on the axis */}
        <Draw progress={progress} from={58} to={68} as="rect" x="148" y="166" width="24" height="34" rx="1" />
        <Draw progress={progress} from={66} to={72} d="M160 166V200" strokeWidth="0.8" />
        <Fade progress={progress} from={84} to={90} as="circle" cx="167" cy="185" r="1.8" fill="#78A9CE" stroke="none" />

        {/* windows: upper row aligned with the ground-floor windows and door */}
        <Win progress={progress} x={100} y={168} from={60} />
        <Win progress={progress} x={196} y={168} from={63} />
        <Win progress={progress} x={100} y={126} from={68} />
        <Win progress={progress} x={148} y={126} from={72} />
        <Win progress={progress} x={196} y={126} from={76} />
      </g>
    </svg>
  );
}

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
    const toNinety = animate(progress, 90, { duration: 2.4, ease: "easeOut" }); // slow enough to watch the house go up

    Promise.all([loaded, fonts, toNinety])
      .then(() => animate(progress, 100, { duration: 0.6, ease: "easeInOut" }))
      .then(() => new Promise((r) => setTimeout(r, 450)))
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
              <House progress={progress} />

              <motion.h1 variants={letters} initial="hidden" animate="show" className="mt-4 flex overflow-hidden text-4xl font-medium tracking-tight md:text-5xl" aria-label="HomeScanner">
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