import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Magnetic hover: the child gets pulled toward the cursor and springs back on leave.
 * strength  – how far it follows the cursor (0.2 subtle, 0.5 strong)
 * className – classes for the outer hit-area wrapper (replaces the default "inline-block")
 */
export default function Magnetic({ children, strength = 0.35, className = "inline-block" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 220, damping: 18, mass: 0.12 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const onMove = (e) => {
    if (reduce || e.pointerType === "touch") return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    // outer element stays still, so the hover area never jitters at the edges
    <div ref={ref} className={className} onPointerMove={onMove} onPointerLeave={reset}>
      <motion.div style={{ x: sx, y: sy }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
        {children}
      </motion.div>
    </div>
  );
}