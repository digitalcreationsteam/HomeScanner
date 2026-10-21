import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const spring = { stiffness: 420, damping: 36, mass: 0.5 };

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("idle"); // idle | link | drag
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, spring);
  const ry = useSpring(y, spring);

  // only on devices with a real mouse
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine);
    if (fine) document.documentElement.classList.add("has-cursor");
    return () => document.documentElement.classList.remove("has-cursor");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target;
      if (t.closest?.("[data-phone-zone]")) setMode("drag");
      else if (t.closest?.("a, button, [role='button'], [role='tab'], input, textarea, label")) setMode("link");
      else setMode("idle");
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const ringScale = pressed ? 0.8 : mode === "link" ? 1.6 : mode === "drag" ? 2.2 : 1;

  return (
    <>
      {/* ring: follows with a soft spring */}
      <motion.div
        aria-hidden="true"
        style={{ x: rx, y: ry }}
        className="pointer-events-none fixed left-0 top-0 z-[200] -ml-5 -mt-5 h-10 w-10 mix-blend-difference"
      >
        <motion.div
          animate={{ scale: ringScale, opacity: visible ? 1 : 0, backgroundColor: mode === "idle" ? "rgba(255,255,255,0)" : "rgba(255,255,255,0.18)" }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="h-full w-full rounded-full border border-white"
        />
      </motion.div>

      {/* dot: sticks to the pointer */}
      <motion.div
        aria-hidden="true"
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[200] -ml-[3px] -mt-[3px] h-1.5 w-1.5 mix-blend-difference"
      >
        <motion.div
          animate={{ scale: mode === "idle" ? 1 : 0, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full rounded-full bg-white"
        />
      </motion.div>
    </>
  );
}