import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export const SECTIONS = ["records", "builders", "how", "homeowners", "scan"];

export default function SmoothScroll() {
  const { pathname } = useLocation();

  // smooth scrolling
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      prevent: () => document.body.style.overflow === "hidden", // let the preloader lock scrolling
    });
    window.__lenis = lenis;

    let raf;
    const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); lenis.destroy(); window.__lenis = null; };
  }, []);

  // route change: scroll to the section for /records, /homeowners... or to the top for other pages
  useEffect(() => {
    const id = pathname.slice(1);
    const isSection = SECTIONS.includes(id);
    let tries = 0, timer;

    const go = () => {
      const el = isSection ? document.getElementById(id) : null;
      const locked = document.body.style.overflow === "hidden"; // preloader still showing

      // wait for the page (and preloader) before scrolling to a section
      if (isSection && (!el || locked) && tries++ < 60) { timer = setTimeout(go, 100); return; }

      if (window.__lenis) {
        window.__lenis.scrollTo(el || 0, { offset: el ? -64 : 0, immediate: !el });
      } else if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo(0, 0);
      }
    };

    go();
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}