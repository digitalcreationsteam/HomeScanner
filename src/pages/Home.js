import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroScene from "../components/HeroScene";
import PhoneScene from "../components/PhoneScene";
import QRMark from "../components/QRMark";
import Icon from "../components/Icon";
import appIcon from "../assets/google.jpeg";
import Magnetic from "../components/Magnetic";
import appPreview from "../assets/google.jpeg";
import { badges, trust, records, steps, benefits, owners, scanSteps } from "../data";

/* ---------- motion presets ---------- */
const ease = [0.22, 1, 0.36, 1];
const spring = { type: "spring", stiffness: 320, damping: 20 };
const viewport = { once: false, amount: 0.15, margin: "0px 0px -80px 0px" };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };
const reveal = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport, transition: { duration: 0.7, ease } };

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
      <section ref={setSection} id="top" className="relative flex items-center overflow-hidden md:min-h-[calc(100vh-4rem)]">
        {section && (
          <div className="pointer-events-none absolute inset-0">
            <HeroScene source={section} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b from-paper via-paper/70 to-transparent md:hidden" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-paper via-paper/60 to-transparent md:block" />

        <div className="wrap relative py-14 md:py-20">
          <motion.div variants={container} initial="hidden" animate="show" className="md:max-w-[44%]">
            <motion.p variants={item} className="inline-block rounded-full border border-accent/30 bg-white px-4 py-1.5 text-sm text-deep">
              The digital passport of your home.
            </motion.p>
            <motion.h1
              variants={item}
              className="mt-6 text-[length:clamp(2.6rem,5.4vw,4.7rem)] font-semibold uppercase leading-[0.92] tracking-[-0.035em] text-ink"
            >
              Your Home.<br />Digitally<br />Documented.
            </motion.h1>
            <motion.p variants={item} className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              HomeScanner creates a permanent digital record of your property — materials, appliances, warranties, installations and maintenance information, all in one place.
            </motion.p>
            <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
              <Magnetic>
                <Link to="/demo" className="btn btn-accent">Book a Builder Demo <Icon name="arrow" className="h-4 w-4" /></Link>
              </Magnetic>
              <Magnetic>
                <a href="#records" className="btn btn-light">Explore HomeScanner</a>
              </Magnetic>
            </motion.div>
            <motion.div variants={item} className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
              {badges.map(([icon, t, d]) => (
                <motion.div key={t} whileHover={rowHover} className="flex items-center gap-3">
                  <IconBox name={icon} />
                  <div className="leading-tight">
                    <p className="text-sm font-medium">{t}</p>
                    <p className="text-xs text-muted">{d}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          {/* room for the phone on mobile */}
          <div className="h-[480px] md:hidden" />
        </div>

        {/* Digital Passport card, set beside the phone */}
        <div className="absolute left-[calc(67%+200px)] top-1/2 hidden -translate-y-1/2 xl:block">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.06, rotate: 2, transition: spring }}
            className="w-40 cursor-pointer rounded-2xl border border-line bg-white p-4 shadow-[0_20px_50px_-20px_rgba(86,70,217,0.35)]"
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
      <div className="wrap grid items-center gap-6 py-8 lg:grid-cols-[1fr_3fr]">
        <Reveal dir="left">
          <p className="max-w-[16rem] text-sm text-muted">Trusted by forward-thinking builders and property owners</p>
        </Reveal>
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          {trust.map(([icon, t]) => (
            <motion.div key={t} variants={item} whileHover={rowHover} className="flex items-center gap-3">
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
    <section id="records" className="py-24">
      <div className="wrap">
        <div className="grid items-end gap-6 md:grid-cols-2">
          <Reveal as="div">
            <h2 className="h2">One digital record.<br /><span className="text-accent">Every detail.</span></h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="max-w-sm text-muted md:justify-self-end">All the essential information about your property, beautifully organized and easy to access.</p>
          </Reveal>
        </div>
        <motion.div
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
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
              className="group cursor-pointer rounded-3xl border border-line bg-white p-7 transition-colors hover:border-accent/50"
            >
              <motion.span
                whileHover={iconHover}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-deep transition-colors group-hover:bg-deep group-hover:text-white"
              >
                <Icon name={icon} className="h-6 w-6" />
              </motion.span>
              <h3 className="mt-6 text-lg font-medium">{t}</h3>
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
    <section id="builders" className="border-y border-line bg-white py-24">
      <div className="wrap grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Reveal>
            <h2 className="h2">Built for Builders.<br /><span className="text-accent">Designed for better handovers.</span></h2>
            <p className="mt-5 max-w-md text-muted">HomeScanner transforms your handover process into a long-term relationship by delivering complete transparency and trust.</p>
          </Reveal>
          <ol id="how" className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map(([icon, t, d], i) => (
              <motion.li
                key={t}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.1 }}
                whileHover={{ y: -6, transition: spring }}
                className="relative cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    whileHover={{ scale: 1.12, rotate: 8, backgroundColor: "#ECECF3", transition: spring }}
                    className="grid h-14 w-14 place-items-center rounded-full border border-line bg-paper text-deep"
                  >
                    <Icon name={icon} className="h-6 w-6" />
                  </motion.span>
                  {i < steps.length - 1 && <Icon name="arrow" className="hidden h-4 w-4 text-line xl:block" />}
                </div>
                <p className="mt-4 font-medium">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        <Reveal dir="right" className="self-start">
          <motion.div
            whileHover={{ y: -6, boxShadow: "0 24px 48px -24px rgba(28,44,53,0.25)", transition: spring }}
            className="rounded-3xl border border-line bg-paper p-8"
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
            <Magnetic className="mt-8 inline-block">
              <Link to="/demo" className="btn btn-accent">Book a Builder Demo <Icon name="arrow" className="h-4 w-4" /></Link>
            </Magnetic>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

function Owners() {
  return (
    <section id="homeowners" className="py-24">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal dir="left">
          <h2 className="h2">For Homeowners.<br /><span className="text-accent">Peace of mind, always.</span></h2>
          <p className="mt-5 max-w-sm text-muted">Everything you need to know about your home, always at your fingertips.</p>
        </Reveal>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {owners.map(([icon, t, d], i) => (
            <motion.div
              key={t}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: spring }}
              className="flex cursor-pointer gap-4 border-t border-line pt-6"
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

/* In Home.js:
   1) change the first import to:  import { useEffect, useState } from "react";
   2) replace the whole Scan() function with this one.
   Everything else in Home.js stays the same. */

/* In Home.js:
   1) change the first import to:  import { useEffect, useRef, useState } from "react";
   2) replace the whole Scan() function with this one.
   Everything else in Home.js stays the same. */

   const ZOOM_MIN = 0.6, ZOOM_MAX = 2.2;

   function Scan() {
     const [section, setSection] = useState(null);
     const [zone, setZone] = useState(null);     // invisible box over the phone: drags that start here scroll the phone
     const [live, setLive] = useState(false);
   
     // drag / zoom state shared with the 3D scene (targets: tYaw, tPitch, tZoom; the scene smooths yaw, pitch, zoom)
     const view = useRef({ yaw: 0, pitch: 0, zoom: 1, tYaw: 0, tPitch: 0, tZoom: 1 });
     const zoomBy = (f) => { const v = view.current; v.tZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.tZoom * f)); };
     const reset = () => Object.assign(view.current, { tYaw: 0, tPitch: 0, tZoom: 1 });
   
     // mount the 3D scene when the section scrolls into view, so the build-up plays in front of the visitor
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
   
         {/* keep the text readable over the blueprint lines */}
         <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-ink via-ink/70 to-transparent lg:hidden" />
         <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-ink via-ink/60 to-transparent lg:block" />
   
         <div className="wrap relative py-24">
           <div className="lg:max-w-[48%]">
             <Reveal>
               <h2 className="h2">Scan. Access.<br /><span className="text-[#9B8EFF]">Know Your Home.</span></h2>
               <p className="mt-5 max-w-md text-white/60">Every home gets a unique QR code — your gateway to the complete digital record of your property.</p>
             </Reveal>
   
             <Reveal delay={0.1}>
               <motion.div
                 whileHover={{ y: -6, scale: 1.02, boxShadow: "0 24px 48px -20px rgba(0,0,0,0.5)", transition: spring }}
                 className="mt-10 flex w-full max-w-sm cursor-pointer items-center gap-5 rounded-3xl bg-white p-5 text-ink"
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
                 <motion.li key={t} variants={item} whileHover={rowHover} className="flex items-start gap-3">
                   <IconBox name={icon} dark />
                   <p className="text-sm leading-snug text-white/70">{t}</p>
                 </motion.li>
               ))}
             </motion.ul>
           </div>
   
           {/* room for the phone when the layout is stacked */}
           <div className="h-[460px] lg:hidden" />
         </div>
   
         {/* drag here = scroll the phone screen. Drag anywhere else = rotate the model. */}
         <div
           ref={setZone}
           data-phone-zone
           className="absolute bottom-0 left-1/2 z-10 h-[470px] w-[280px] -translate-x-1/2 lg:bottom-auto lg:left-[75%] lg:top-1/2 lg:h-[min(640px,86%)] lg:w-[360px] lg:-translate-y-1/2"
         />
   
         {/* zoom controls (pinch or Ctrl/Cmd + scroll also zoom) */}
         <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
           <motion.button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.25)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} className={ctrl}>−</motion.button>
           <motion.button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.25)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} className={ctrl}>+</motion.button>
           <motion.button type="button" aria-label="Reset view" onClick={reset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`${ctrl} w-auto px-4 text-xs`}>Reset</motion.button>
         </div>
       </section>
     );
   }

/* In Home.js: replace the whole Cta() function with everything below.
   Uses things Home.js already has: motion, Link, QRMark, Icon, Magnetic, ease, spring, viewport. */

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

/*
  Store button. On hover a tab with the store's logo grows out of the top edge of the button,
  in the same colour, so it looks attached to it (the small curved fillets blend the corners).
*/
function StoreButton({ small, name, Logo, label }) {
  return (
    <motion.a
      href="#top"
      aria-label={label}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap="tap"
      className="relative block"
    >
      {/* popup: fades up, then the 3D card inside it sways */}
      <motion.span
        variants={{
          rest: { opacity: 0, y: 24, scale: 0.88 },
          hover: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 340, damping: 24 } },
        }}
        style={{ transformOrigin: "50% 100%", perspective: 900 }}
        className="pointer-events-none absolute inset-x-0 bottom-full z-20 mx-auto mb-4 block w-48"
      >
        {/* 3D card */}
        <motion.span
          variants={{
            rest: { rotateY: -18, rotateX: 8 },
            hover: {
              rotateY: [-18, 16, -18],
              rotateX: [8, 3, 8],
              transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            },
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative block"
        >
          {/* layers behind the card give it thickness */}
          <span
            className="absolute inset-0 rounded-2xl bg-white/40"
            style={{ transform: "translateZ(-24px)" }}
          />
          <span
            className="absolute inset-0 rounded-2xl bg-white/60"
            style={{ transform: "translateZ(-12px)" }}
          />

          {/* front face: full image */}
          <span
            className="relative block rounded-2xl bg-white p-2 pt-5 shadow-[0_30px_50px_-20px_rgba(0,0,0,0.8)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* store icon floats in front of the image */}
            <motion.span
              variants={{
                rest: { scale: 0.5, rotate: -14 },
                hover: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 420, damping: 16, delay: 0.1 } },
              }}
              style={{ z: 36 }}
              className="absolute inset-x-0 -top-6 z-10 mx-auto grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-white shadow-[0_12px_20px_-8px_rgba(0,0,0,0.6)]"
            >
              <Logo className="h-7 w-7" />
            </motion.span>

            <img
              src={appPreview}
              alt="SpaceX app preview"
              draggable={false}
              className="block h-auto w-full rounded-xl"
              style={{ transform: "translateZ(8px)" }}
            />
          </span>
        </motion.span>

        <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
      </motion.span>

      <motion.span
        variants={{ rest: { y: 0 }, hover: { y: 0 }, tap: { scale: 0.96 } }}
        className="relative z-10 block rounded-xl bg-white px-6 py-3 text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]"
      >
        <span className="block text-[10px] text-ink/60">{small}</span>
        <span className="block text-base font-medium leading-tight">{name}</span>
      </motion.span>
    </motion.a>
  );
}

function Cta() {
  const points = ["A permanent digital record for every home", "QR access for homeowners, anytime", "Smoother, more transparent handovers"];

  return (
    <section className="py-24">
      <div className="wrap">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={viewport}
          transition={{ duration: 0.8, ease }}
          className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-14 text-white md:px-14 md:py-16"
        >
          {/* backdrop: blueprint grid + soft glows */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "linear-gradient(#78A9CE 1px, transparent 1px), linear-gradient(90deg, #78A9CE 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 75%)",
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-sky/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-[320px] w-[320px] rounded-full bg-deep/40 blur-3xl" />

          <div className="relative grid items-center gap-14 lg:grid-cols-[1.25fr_1fr]">
            {/* copy + actions */}
            <div>
              <motion.p {...reveal} className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80">
                Digital handovers, done right
              </motion.p>
              <motion.h2 {...reveal} transition={{ ...reveal.transition, delay: 0.08 }} className="mt-6 max-w-xl text-3xl font-medium leading-tight tracking-tight md:text-5xl">
                Ready to transform your handovers?
              </motion.h2>
              <motion.p {...reveal} transition={{ ...reveal.transition, delay: 0.16 }} className="mt-4 max-w-lg text-white/60">
                Join leading builders who are delivering exceptional homeowner experiences with HomeScanner.
              </motion.p>

              <motion.ul
                className="mt-8 space-y-3"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={viewport}
              >
                {points.map((p) => (
                  <motion.li key={p} variants={item} whileHover={{ x: 6, transition: spring }} className="flex items-center gap-3 text-sm text-white/80">
                    <motion.span
                      whileHover={{ scale: 1.2, rotate: 10, transition: spring }}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky/20 text-sky"
                    >
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </motion.span>
                    {p}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.24 }} className="mt-10 flex flex-wrap items-end gap-4 pt-10">
                <Magnetic>
                  <Link to="/demo" className="btn btn-accent border border-sky">
                    Book a Builder Demo <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </Magnetic>
                <StoreButton small="Download on the" name="App Store" Logo={AppleLogo} label="Download on the App Store" />
                <StoreButton small="GET IT ON" name="Google Play" Logo={PlayLogo} label="Get it on Google Play" />
              </motion.div>
            </div>

            {/* visual: a stack of digital passport cards */}
            <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.2 }} className="relative mx-auto hidden h-[340px] w-full max-w-[340px] lg:block">
              <div className="absolute inset-x-6 top-6 h-full -rotate-6 rounded-3xl border border-white/10 bg-white/5" />
              <div className="absolute inset-x-3 top-3 h-full rotate-3 rounded-3xl border border-white/10 bg-white/10" />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <motion.div
                  whileHover={{ rotate: -2, scale: 1.04, boxShadow: "0 30px 60px -24px rgba(0,0,0,0.7)", transition: spring }}
                  className="flex h-full cursor-pointer flex-col items-center justify-center rounded-3xl bg-white p-8 text-ink shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)]"
                >
                  <QRMark className="h-36 w-36 text-ink" />
                  <p className="mt-5 font-medium">Demo Home</p>
                  <p className="mt-1 text-xs text-muted">Scan to view this home's digital passport</p>
                  <p className="mt-4 rounded-lg bg-mist px-3 py-1.5 text-xs font-medium text-deep">HS-DEMO-2026-001</p>
                </motion.div>
              </motion.div>
              <motion.span
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                className="absolute -right-3 top-8 flex items-center gap-2 rounded-full bg-sky px-3 py-1.5 text-xs font-medium text-ink shadow-lg"
              >
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