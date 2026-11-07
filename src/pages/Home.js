import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimate } from "framer-motion";
import HeroScene from "../components/HeroScene";
import PhoneScene from "../components/PhoneScene";
import QRMark from "../components/QRMark";
import Icon from "../components/Icon";
import appIcon from "../assets/google.jpeg";
import Magnetic from "../components/Magnetic";
import appPreview from "../assets/google.jpeg";
import appPreviewIos from "../assets/app.png";
import { createPortal } from "react-dom";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { badges, trust, records, steps, benefits, owners, scanSteps } from "../data";

/* ---------- motion presets ---------- */
const ease = [0.22, 1, 0.36, 1];
const spring = { type: "spring", stiffness: 320, damping: 20 };
const viewport = { once: false, amount: 0.15, margin: "0px 0px -80px 0px" };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const reveal = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport, transition: { duration: 0.7, ease } };

const NAV_DELAY = 950;
/* hover presets */
const cardHover = {
  y: -8,
  boxShadow: "0 24px 48px -24px rgba(28,44,53,0.28)",
  transition: spring,
};
const cardTap = { scale: 0.98 };
const iconHover = { scale: 1.15, rotate: -6, transition: spring };
const rowHover = { x: 6, transition: spring };

/* Reveals its children when scrolled into view. dir: "up" | "left" | "right" */
function Reveal({ children, dir = "up", delay = 0, className = "", as = "div" }) {
  const Tag = motion[as];
  const from = {
    up: { opacity: 0, y: 32 },
    left: { opacity: 0, x: -40 },
    right: { opacity: 0, x: 40 },
  }[dir];
  return (
    <Tag
      className={className}
      initial={from}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.75, ease, delay }}
    >
      {children}
    </Tag>
  );
}

/* Icon chip: pops and tilts on hover */
const IconBox = ({ name, dark }) => (
  <motion.span
    whileHover={iconHover}
    whileTap={{ scale: 0.92 }}
    className={`grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl ${dark ? "bg-white/10 text-white" : "bg-mist text-deep"}`}
  >
    <Icon name={name} className="h-5 w-5" />
  </motion.span>
);

function Hero() {
  const [section, setSection] = useState(null);

  return (
    <>
      <section ref={setSection} id="top" className="relative flex flex-col lg:flex-row items-center overflow-hidden lg:min-h-[calc(100vh-4rem)]">
        {section && (
          <div className="pointer-events-none absolute inset-0">
            <HeroScene source={section} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-paper via-paper/70 to-transparent lg:hidden" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-paper via-paper/60 to-transparent lg:block" />

        <div className="wrap relative py-14 md:py-20 w-full">
          <motion.div variants={container} initial="hidden" animate="show" className="lg:max-w-[44%] mx-auto lg:mx-0 text-center lg:text-left">
            
            <motion.p variants={item} className="inline-block rounded-full border border-accent/30 bg-white px-4 py-1.5 text-xs sm:text-sm text-deep font-medium">
              The digital passport of your space.
            </motion.p>
            
            {/* FIXED TYPOGRAPHY: Larger on mobile, scaled on desktop */}
            <motion.h1
              variants={item}
              className="mt-6 text-4xl sm:text-5xl lg:text-[4.7rem] font-semibold uppercase leading-[1.05] lg:leading-[0.92] tracking-[-0.035em] text-ink"
            >
              Your Home.<br />Digitally<br />Documented.
            </motion.h1>
            
            <motion.p variants={item} className="mt-6 max-w-lg mx-auto lg:mx-0 text-base sm:text-lg leading-relaxed text-muted">
              SpaceScanner creates a permanent digital record of your property — materials, appliances, warranties, installations and maintenance information, all in one place.
            </motion.p>
            
            {/* FIXED BUTTONS: Full width on mobile, side-by-side on desktop */}
            <motion.div variants={item} className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Magnetic className="w-full sm:w-auto">
                <Link to="/demo" className="btn btn-accent w-full !py-3.5 sm:!py-3 flex justify-center">Book a Builder Demo <Icon name="arrow" className="h-4 w-4 ml-2" /></Link>
              </Magnetic>
              <Magnetic className="w-full sm:w-auto">
                <a href="#records" className="btn btn-light w-full !py-3.5 sm:!py-3 flex justify-center">Explore SpaceScanner</a>
              </Magnetic>
            </motion.div>
            
            {/* FEATURES GRID: Stacked on mobile, inline on desktop */}
            <motion.div variants={item} className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-6 sm:gap-8">
              {badges.map(([icon, t, d]) => (
                <motion.div key={t} whileHover={rowHover} className="flex items-center gap-3 text-left">
                  <IconBox name={icon} />
                  <div className="leading-tight">
                    <p className="text-sm font-medium">{t}</p>
                    <p className="text-xs text-muted">{d}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Mobile 3D Canvas Space */}
          <div className="relative h-[clamp(400px,calc(100vw_+_60px),500px)] w-full lg:hidden mt-12">
            <div
              data-passport-mobile
              className="absolute z-20 md:translate-y-6"
              style={{
                left: "calc(50% + clamp(368px, 115vw, 520px) * 0.25)",
                top: "calc(clamp(368px, 115vw, 520px) * 0.32)",
              }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                whileTap={{ scale: 0.95 }}
                className="w-[7.5rem] rounded-2xl border border-line bg-white p-3 shadow-[0_16px_40px_-16px_rgba(28,44,53,0.35)]"
              >
                <QRMark className="mx-auto h-14 w-14 text-ink" />
                <p className="mt-2 text-[11px] font-medium text-deep">Digital Passport</p>
                <p className="text-[9px] leading-snug text-muted">Scan to view this home's digital record</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Desktop Digital Passport card */}
        <div className="absolute left-[calc(67%+160px)] top-1/2 hidden -translate-y-1/2 lg:block xl:left-[calc(67%+200px)]">
          <motion.div
            animate={{ y: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.06, rotate: 2, transition: spring }}
            className="w-40 cursor-pointer rounded-2xl border border-line bg-white p-4 shadow-[0_20px_50px_-20px_rgba(28,44,53,0.3)]"
          >
            <QRMark className="mx-auto h-20 w-20 text-ink" />
            <p className="mt-3 text-xs font-medium text-deep">Digital Passport</p>
            <p className="text-[10px] leading-snug text-muted">Scan to view this home's digital record</p>
          </motion.div>
        </div>
      </section>
    </>
  );
}

function Trust() {
  return (
    <section className="border-y border-line bg-white">
      <div className="wrap grid items-center gap-8 py-10 lg:py-8 lg:grid-cols-[1fr_3fr]">
        <Reveal dir="left">
          <p className="max-w-[16rem] text-sm text-muted mx-auto lg:mx-0 text-center lg:text-left">Trusted by forward-thinking builders and property owners</p>
        </Reveal>
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          {trust.map(([icon, t]) => (
            <motion.div key={t} variants={item} whileHover={rowHover} className="flex items-center gap-3 justify-center sm:justify-start">
              <IconBox name={icon} />
              <p className="max-w-[10rem] text-xs leading-snug text-ink/80">{t}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Records() {
  return (
    <section id="records" className="py-20 lg:py-24">
      <div className="wrap">
        <div className="grid items-end gap-6 md:grid-cols-2 text-center md:text-left">
          <Reveal as="div">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">One digital record.<br /><span className="text-accent">Every detail.</span></h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="max-w-sm text-muted mx-auto md:mx-0 md:justify-self-end text-sm sm:text-base">All the essential information about your property, beautifully organized and easy to access.</p>
          </Reveal>
        </div>
        <motion.div
          className="mt-12 lg:mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          {records.map(([icon, t, d]) => (
            <motion.div
              key={t}
              variants={item}
              whileHover={cardHover}
              whileTap={cardTap}
              className="group cursor-pointer rounded-3xl border border-line bg-white p-6 sm:p-7 transition-colors hover:border-accent/50"
            >
              <motion.span
                whileHover={iconHover}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-deep transition-colors group-hover:bg-deep group-hover:text-white"
              >
                <Icon name={icon} className="h-6 w-6" />
              </motion.span>
              <h3 className="mt-5 sm:mt-6 text-lg font-medium">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Builders() {
  return (
    <section id="builders" className="border-y border-line bg-white py-20 lg:py-24">
      <div className="wrap grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Reveal className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">Built for Builders.<br /><span className="text-accent">Designed for better handovers.</span></h2>
            <p className="mt-5 max-w-md mx-auto md:mx-0 text-muted text-sm sm:text-base">SpaceScanner transforms your handover process into a long-term relationship by delivering complete transparency and trust.</p>
          </Reveal>
          <ol id="how" className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4 text-center sm:text-left">
            {steps.map(([icon, t, d], i) => (
              <motion.li
                key={t}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.1 }}
                whileHover={{ y: -6, transition: spring }}
                className="relative cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <motion.span
                    whileHover={{ scale: 1.12, rotate: 8, backgroundColor: "#ECECF3", transition: spring }}
                    className="grid h-14 w-14 place-items-center rounded-full border border-line bg-paper text-deep"
                  >
                    <Icon name={icon} className="h-6 w-6" />
                  </motion.span>
                  {i < steps.length - 1 && <Icon name="arrow" className="hidden h-4 w-4 text-line xl:block" />}
                </div>
                <p className="mt-4 font-medium text-sm sm:text-base">{t}</p>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted">{d}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        <Reveal dir="right" className="self-start mt-8 lg:mt-0">
          <motion.div
            whileHover={{ y: -6, boxShadow: "0 24px 48px -24px rgba(28,44,53,0.25)", transition: spring }}
            className="rounded-3xl border border-line bg-paper p-6 sm:p-8"
          >
            <h3 className="text-sm font-medium">Benefits for Builders</h3>
            <motion.ul
              className="mt-5 space-y-4"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
            >
              {benefits.map((b) => (
                <motion.li key={b} variants={item} whileHover={rowHover} className="flex items-start gap-3 text-sm text-ink/80">
                  <motion.span
                    whileHover={{ scale: 1.25, rotate: 12, transition: spring }}
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mist text-deep"
                  >
                    <Icon name="check" className="h-3 w-3" />
                  </motion.span>
                  {b}
                </motion.li>
              ))}
            </motion.ul>
            <Magnetic className="mt-8 inline-block w-full sm:w-auto">
              <Link to="/demo" className="btn btn-accent w-full sm:w-auto !py-3.5 sm:!py-3 flex justify-center">Book a Builder Demo <Icon name="arrow" className="h-4 w-4 ml-2" /></Link>
            </Magnetic>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

function Owners() {
  return (
    <section id="homeowners" className="py-20 lg:py-24">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal dir="left" className="text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">For Homeowners.<br /><span className="text-accent">Peace of mind, always.</span></h2>
          <p className="mt-5 max-w-sm mx-auto md:mx-0 text-muted text-sm sm:text-base">Everything you need to know about your home, always at your fingertips.</p>
        </Reveal>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {owners.map(([icon, t, d], i) => (
            <motion.div
              key={t}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: spring }}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 border-t border-line pt-6 cursor-pointer"
            >
              <IconBox name={icon} />
              <div>
                <p className="font-medium">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const ZOOM_MIN = 0.6, ZOOM_MAX = 2.2;

function Scan() {
  const [section, setSection] = useState(null);
  const [zone, setZone] = useState(null);
  const [live, setLive] = useState(false);

  const view = useRef({ yaw: 0, pitch: 0, zoom: 1, tYaw: 0, tPitch: 0, tZoom: 1 });
  const zoomBy = (f) => { const v = view.current; v.tZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.tZoom * f)); };
  const reset = () => Object.assign(view.current, { tYaw: 0, tPitch: 0, tZoom: 1 });

  useEffect(() => {
    if (!section) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setLive(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(section);
    return () => io.disconnect();
  }, [section]);

  const ctrl = "grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-lg text-white backdrop-blur transition-colors hover:bg-white/20";

  return (
    <section ref={setSection} id="scan" className="relative cursor-grab touch-pan-y select-none overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -right-32 top-0 h-[520px] w-[520px] rounded-full bg-deep/40 blur-3xl" />

      {section && zone && live && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <PhoneScene source={section} zone={zone} view={view} />
        </motion.div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-ink via-ink/70 to-transparent lg:hidden" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-ink via-ink/60 to-transparent lg:block" />

      <div className="wrap relative py-20 lg:py-24">
        <div className="lg:max-w-[48%] mx-auto lg:mx-0 text-center lg:text-left">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">Scan. Access.<br /><span className="text-[#9B8EFF]">Know Your Home.</span></h2>
            <p className="mt-5 max-w-md mx-auto lg:mx-0 text-white/60 text-sm sm:text-base">Every home gets a unique QR code — your gateway to the complete digital record of your property.</p>
          </Reveal>

          <Reveal delay={0.1}>
            <motion.div
              whileHover={{ y: -6, scale: 1.02, boxShadow: "0 24px 48px -20px rgba(0,0,0,0.5)", transition: spring }}
              className="mt-10 flex flex-col sm:flex-row w-full max-w-sm mx-auto lg:mx-0 cursor-pointer items-center gap-5 rounded-3xl bg-white p-5 text-ink text-center sm:text-left"
            >
              <QRMark className="h-24 w-24 shrink-0 text-ink" />
              <div>
                <p className="font-medium">Demo Home</p>
                <p className="mt-1 text-xs text-muted">Scan to view this home's digital passport</p>
                <p className="mt-3 rounded-lg bg-mist px-3 py-1.5 text-center text-xs font-medium text-deep">HS-DEMO-2026-001</p>
              </div>
            </motion.div>
          </Reveal>

          <motion.ul
            className="mt-10 grid gap-5 sm:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            {scanSteps.map(([icon, t]) => (
              <motion.li key={t} variants={item} whileHover={rowHover} className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <IconBox name={icon} dark />
                <p className="text-sm leading-snug text-white/70">{t}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <div className="h-[clamp(400px,calc(100vw_+_50px),500px)] w-full lg:hidden" />
      </div>

      <div
        ref={setZone}
        data-phone-zone
        className="absolute bottom-0 left-1/2 z-10 h-[clamp(360px,calc(100vw_+_20px),480px)] w-[260px] -translate-x-1/2 lg:bottom-auto lg:left-[75%] lg:top-1/2 lg:h-[min(640px,86%)] lg:w-[360px] lg:-translate-y-1/2"
      />

      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
        <motion.button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.25)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} className={ctrl}>−</motion.button>
        <motion.button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.25)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} className={ctrl}>+</motion.button>
        <motion.button type="button" aria-label="Reset view" onClick={reset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`${ctrl} w-auto px-4 text-xs`}>Reset</motion.button>
      </div>
    </section>
  );
}

/* ---------- store logos ---------- */
const AppleLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#1C2C35"
      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
    />
  </svg>
);

const PlayLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#00A0FF" d="M3.6 1.5 13.2 12 3.6 22.5Q3 22.1 3 21.3V2.7Q3 1.9 3.6 1.5Z" />
    <path fill="#00E07A" d="M3.6 1.5 16.2 8.6 13.2 12Z" />
    <path fill="#FFD500" d="M16.2 8.6 20.6 11.1Q21.4 12 20.6 12.9L16.2 15.4 13.2 12Z" />
    <path fill="#FF3A44" d="M3.6 22.5 13.2 12 16.2 15.4Z" />
  </svg>
);

function StoreButton({ small, name, Logo, label, preview, href }) {
  const [scope, animate] = useAnimate();
  const [origin, setOrigin] = useState(null); 
  const reduce = useReducedMotion();
  const timer = useRef();

  useEffect(() => {
    const reset = (e) => { if (e.persisted) setOrigin(null); };
    window.addEventListener("pageshow", reset);
    return () => { window.removeEventListener("pageshow", reset); clearTimeout(timer.current); };
  }, []);

  const handleClick = (e) => {
    if (!href || origin) { e.preventDefault(); return; }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; 
    e.preventDefault();

    const openStore = () => {
      const w = window.open(href, "_blank");
      if (w) w.opener = null; 
      else window.location.assign(href); 
    };

    if (reduce) { openStore(); return; }

    const r = e.currentTarget.getBoundingClientRect();
    const keyboard = e.detail === 0;
    setOrigin({ x: keyboard ? r.left + r.width / 2 : e.clientX, y: keyboard ? r.top + r.height / 2 : e.clientY });

    animate(scope.current, { scale: [1, 0.92, 1] }, { duration: 0.25 });

    timer.current = setTimeout(() => {
      openStore();
      timer.current = setTimeout(() => setOrigin(null), 450);
    }, NAV_DELAY);
  };

  return (
    <>
      <motion.a
        ref={scope}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label={label}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileTap="tap"
        className="relative block cursor-pointer w-full sm:w-auto"
      >
        <motion.span
          variants={{
            rest: { opacity: 0, y: 28, scale: 0.86 },
            hover: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 24 } },
          }}
          style={{ transformOrigin: "50% 100%", perspective: 1000 }}
          className="pointer-events-none absolute inset-x-0 bottom-full z-20 mx-auto mb-6 hidden sm:block w-[9.5rem]"
        >
          <span className="absolute -inset-8 rounded-full bg-sky/30 blur-3xl" />
          <span className="absolute -bottom-4 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-black/50 blur-md" />
          <motion.span
            variants={{
              rest: { rotateY: -14, rotateX: 6 },
              hover: { rotateY: [-14, 12, -14], rotateX: [6, 2, 6], transition: { duration: 7, repeat: Infinity, ease: "easeInOut" } },
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative block"
          >
            <span className="absolute inset-0 rounded-[2rem] bg-sky/25" style={{ transform: "translateZ(-22px)" }} />
            <span className="absolute inset-0 rounded-[2rem] bg-sky/40" style={{ transform: "translateZ(-11px)" }} />
            <span className="relative block rounded-[2rem] bg-gradient-to-b from-[#52646f] via-[#2a3a45] to-[#16232b] p-[5px] shadow-[0_32px_60px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/25" style={{ transformStyle: "preserve-3d" }}>
              <span className="absolute -left-[3px] top-[4.2rem] h-6 w-[3px] rounded-l bg-[#3b4c58]" />
              <span className="absolute -left-[3px] top-[6.2rem] h-10 w-[3px] rounded-l bg-[#3b4c58]" />
              <span className="absolute -right-[3px] top-[5.4rem] h-14 w-[3px] rounded-r bg-[#3b4c58]" />
              <span className="relative block aspect-[9/19] overflow-hidden rounded-[1.6rem] bg-ink">
                <motion.img variants={{ rest: { scale: 1.08 }, hover: { scale: 1, transition: { duration: 0.9, ease } } }} src={preview} alt={`${name} app preview`} draggable={false} className="absolute inset-0 h-full w-full object-cover object-top" />
                <span className="absolute left-1/2 top-2 z-10 h-[14px] w-[46px] -translate-x-1/2 rounded-full bg-black" />
                <span className="absolute bottom-1.5 left-1/2 z-10 h-1 w-14 -translate-x-1/2 rounded-full bg-white/70" />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
              </span>
            </span>
            <motion.span variants={{ rest: { scale: 0.4, rotate: -16, opacity: 0 }, hover: { scale: 1, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 16, delay: 0.12 } } }} style={{ z: 46 }} className="absolute -right-5 bottom-14 grid h-12 w-12 place-items-center rounded-full bg-white shadow-[0_14px_24px_-8px_rgba(0,0,0,0.7)] ring-2 ring-sky/60">
              <Logo className="h-7 w-7" />
            </motion.span>
            <motion.span variants={{ rest: { x: 12, opacity: 0 }, hover: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 22, delay: 0.2 } } }} style={{ z: 34 }} className="absolute -left-7 top-10 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-ink/85 px-2.5 py-1 text-[10px] font-medium text-white shadow-lg backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-sky" /> App preview
            </motion.span>
          </motion.span>
        </motion.span>

        <motion.span
          variants={{ rest: { y: 0 }, hover: { y: -3 }, tap: { scale: 0.96 } }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="relative z-10 flex min-w-[13.5rem] w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] py-2.5 pl-2.5 pr-3 text-white shadow-[0_14px_32px_-14px_rgba(0,0,0,0.75)] backdrop-blur transition-colors duration-300 hover:border-sky/60 hover:bg-white/[0.12]"
        >
          <motion.span variants={{ rest: { x: "-120%" }, hover: { x: "420%", transition: { duration: 0.9, ease: "easeInOut" } } }} className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <motion.span variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -8, scale: 1.08, transition: spring } }} className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)]">
            <Logo className="h-6 w-6" />
          </motion.span>
          <span className="relative flex flex-col text-left leading-tight">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/55">{small}</span>
            <span className="text-[17px] font-semibold tracking-tight">{name}</span>
          </span>
          <motion.span variants={{ rest: { x: 0, y: 0, opacity: 0.7 }, hover: { x: 3, y: -3, opacity: 1, transition: spring } }} className="relative ml-auto grid h-8 w-8 place-items-center rounded-full bg-white/10 text-sky">
            <Icon name="arrow" className="h-4 w-4 -rotate-45" />
          </motion.span>
        </motion.span>
      </motion.a>

      {typeof document !== "undefined" && createPortal(
          <AnimatePresence>
            {origin && (
              <motion.div key="store-transition" role="status" aria-live="polite" className="fixed inset-0 z-[100] grid place-items-center bg-ink text-white" initial={{ clipPath: `circle(0% at ${origin.x}px ${origin.y}px)` }} animate={{ clipPath: `circle(160% at ${origin.x}px ${origin.y}px)` }} exit={{ clipPath: `circle(0% at ${origin.x}px ${origin.y}px)`, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }} transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}>
                <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "linear-gradient(#78A9CE 1px, transparent 1px), linear-gradient(90deg, #78A9CE 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/20 blur-3xl" />
                <motion.div className="relative flex flex-col items-center px-6 text-center" initial={{ opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.45, duration: 0.5, ease }}>
                  <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)]">
                    <Logo className="h-11 w-11" />
                  </motion.span>
                  <p className="mt-6 text-sm text-white/60">Opening</p>
                  <p className="mt-1 text-2xl font-medium tracking-tight">{name}</p>
                  <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-sky" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ delay: 0.45, duration: (NAV_DELAY - 450) / 1000, ease: "easeInOut" }} />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>, document.body
      )}
    </>
  );
}

function Cta() {
  const points = ["A permanent digital record for every home", "QR access for homeowners, anytime", "Smoother, more transparent handovers"];

  return (
    <section className="py-20 lg:py-24">
      <div className="wrap">
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={viewport} transition={{ duration: 0.8, ease }} className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white md:px-14 md:py-16">
          
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(#78A9CE 1px, transparent 1px), linear-gradient(90deg, #78A9CE 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 75%)" }} />
          <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-sky/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-[320px] w-[320px] rounded-full bg-deep/40 blur-3xl" />

          <div className="relative grid items-center gap-14 lg:grid-cols-[1.25fr_1fr]">
            <div className="text-center lg:text-left">
              <motion.p {...reveal} className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs sm:text-sm text-white/80">Digital handovers, done right</motion.p>
              <motion.h2 {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className="mt-6 max-w-xl mx-auto lg:mx-0 text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight tracking-tight">Ready to transform your handovers?</motion.h2>
              <motion.p {...reveal} transition={{ ...reveal.transition, delay: 0.16 }} className="mt-4 max-w-lg mx-auto lg:mx-0 text-white/60 text-sm sm:text-base">Join leading builders who are delivering exceptional homeowner experiences with SpaceScanner.</motion.p>

              <motion.ul className="mt-8 space-y-3 flex flex-col items-center lg:items-start" variants={container} initial="hidden" whileInView="show" viewport={viewport}>
                {points.map((p) => (
                  <motion.li key={p} variants={item} whileHover={{ x: 6, transition: spring }} className="flex items-center gap-3 text-sm text-white/80">
                    <motion.span whileHover={{ scale: 1.2, rotate: 10, transition: spring }} className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky/20 text-sky">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </motion.span>
                    {p}
                  </motion.li>
                ))}
              </motion.ul>

              {/* FIXED CTA BUTTONS: Full width flex-col on mobile, flex-row on desktop */}
              <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.24 }} className="mt-10 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 pt-10">
                <Magnetic className="w-full sm:w-auto">
                  <Link to="/demo" className="btn btn-accent border border-sky w-full sm:w-auto !py-3.5 sm:!py-5 flex justify-center">
                    Book a Builder Demo <Icon name="arrow" className="h-4 w-4 ml-2" />
                  </Link>
                </Magnetic>
                <StoreButton small="Download on the" name="App Store" Logo={AppleLogo} label="Download on the App Store" preview={appPreviewIos} href="https://apps.apple.com/us/app/spacescanner/id6767776133" />
                <StoreButton small="GET IT ON" name="Google Play" Logo={PlayLogo} label="Get it on Google Play" preview={appPreview} href="https://play.google.com/store/apps/details?id=com.vishwal.spacex&hl=en_IN" />
              </motion.div>
            </div>

            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.2 }} className="relative mx-auto hidden h-[340px] w-full max-w-[340px] lg:block">
              <div className="absolute inset-x-6 top-6 h-full -rotate-6 rounded-3xl border border-white/10 bg-white/5" />
              <div className="absolute inset-x-3 top-3 h-full rotate-3 rounded-3xl border border-white/10 bg-white/10" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0">
                <motion.div whileHover={{ rotate: -2, scale: 1.04, boxShadow: "0 30px 60px -24px rgba(0,0,0,0.7)", transition: spring }} className="flex h-full cursor-pointer flex-col items-center justify-center rounded-3xl bg-white p-8 text-ink shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)]">
                  <QRMark className="h-36 w-36 text-ink" />
                  <p className="mt-5 font-medium">Demo Home</p>
                  <p className="mt-1 text-xs text-muted">Scan to view this home's digital passport</p>
                  <p className="mt-4 rounded-lg bg-mist px-3 py-1.5 text-xs font-medium text-deep">HS-DEMO-2026-001</p>
                </motion.div>
              </motion.div>
              <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} className="absolute -right-3 top-8 flex items-center gap-2 rounded-full bg-sky px-3 py-1.5 text-xs font-medium text-ink shadow-lg">
                <Icon name="check" className="h-3 w-3" /> Verified
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Trust />
      <Records />
      <Builders />
      <Owners />
      <Scan />
      <Cta />
    </>
  );
}