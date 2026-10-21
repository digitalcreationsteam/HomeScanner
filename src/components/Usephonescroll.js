import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const FEED_H = 1800; // height of the passport feed drawn by drawFeed()

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export { rr };

const FEED = [
  ["Materials & Products", [
    ["Vitrified Tile Flooring", "Living room & bedrooms", "Installed"],
    ["Premium Emulsion Paint", "Interior walls · 2 coats", "Installed"],
    ["Modular Switches", "All rooms", "Installed"],
  ]],
  ["Warranties & Documents", [
    ["Waterproofing", "Valid until 2036", "10 yrs"],
    ["Kitchen Chimney", "Valid until 2028", "2 yrs"],
    ["Home Owner's Manual", "Handover document", "PDF"],
  ]],
  ["Electrical & Plumbing", [
    ["Main DB Panel", "Utility area · 32A", "Mapped"],
    ["Water Heater", "Master bathroom", "Mapped"],
    ["Concealed Piping", "Kitchen & bathrooms", "Mapped"],
  ]],
  ["Maintenance & Service", [
    ["AC Service", "Due in 45 days", "Reminder"],
    ["Water Tank Cleaning", "Due Jan 2027", "Reminder"],
    ["Pest Control", "Due Mar 2027", "Reminder"],
  ]],
];

/* draws the "digital passport" feed starting at y = top (logical 512px-wide coordinates) */
export function drawFeed(ctx, W, top) {
  const text = (s, x, y, font, color, align = "left") => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(s, x, y);
  };

  ctx.fillStyle = "#243844"; rr(ctx, 36, top, 440, 150, 28); ctx.fill();
  ctx.fillStyle = "#4F7DAD"; rr(ctx, 60, top + 32, 72, 72, 18); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(76, top + 72); ctx.lineTo(96, top + 52); ctx.lineTo(116, top + 72); ctx.lineTo(110, top + 72);
  ctx.lineTo(110, top + 90); ctx.lineTo(82, top + 90); ctx.lineTo(82, top + 72); ctx.closePath(); ctx.fill();
  text("Demo Home", 152, top + 60, "500 28px Rubik, sans-serif", "#fff");
  text("HS-DEMO-2026-001", 152, top + 92, "400 20px Rubik, sans-serif", "#8FA3B1");
  ctx.fillStyle = "rgba(120,169,206,0.18)"; rr(ctx, 152, top + 106, 104, 28, 14); ctx.fill();
  text("Verified", 204, top + 126, "500 16px Rubik, sans-serif", "#78A9CE", "center");

  let y = top + 190;
  FEED.forEach(([title, rows]) => {
    text(title, 44, y + 28, "500 24px Rubik, sans-serif", "#fff");
    y += 52;
    rows.forEach(([a, b, tag]) => {
      ctx.fillStyle = "#243844"; rr(ctx, 36, y, 440, 80, 22); ctx.fill();
      ctx.fillStyle = "rgba(120,169,206,0.18)"; rr(ctx, 54, y + 20, 40, 40, 12); ctx.fill();
      ctx.fillStyle = "#78A9CE"; ctx.beginPath(); ctx.arc(74, y + 40, 7, 0, Math.PI * 2); ctx.fill();
      text(a, 110, y + 36, "500 20px Rubik, sans-serif", "#fff");
      text(b, 110, y + 62, "400 16px Rubik, sans-serif", "#8FA3B1");
      text(tag, 456, y + 47, "500 15px Rubik, sans-serif", "#78A9CE", "right");
      y += 94;
    });
    y += 24;
  });

  text("You're all caught up", W / 2, y + 40, "400 20px Rubik, sans-serif", "#8FA3B1", "center");
  text("HomeScanner", W / 2, y + 76, "500 18px Rubik, sans-serif", "#78A9CE", "center");
}

/**
 * Makes a 3D phone screen scrollable: click-drag (mouse/pen), plus optional wheel and touch.
 * Uses native events + its own ray test against `groupRef`, so it works even when the canvas
 * has pointer-events:none (pass the element that receives events, e.g. the hero section).
 * Returns a ref { target, current } (scroll position in content px); ease `current` toward
 * `target` in useFrame and apply it to the texture offset.
 */
export function usePhoneScroll({ groupRef, element, contentH, viewH, getScreenPx, wheel = true, touch = true }) {
  const { gl, camera } = useThree();
  const scroll = useRef({ target: 0, current: 0 });
  const screenPx = useRef(getScreenPx);
  screenPx.current = getScreenPx;
  const max = contentH - viewH;

  useEffect(() => {
    const el = element || gl.domElement, canvas = gl.domElement, s = scroll.current;
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const st = { hover: false, dragging: false, touch: false, touchY: 0 };
    const toContent = () => viewH / screenPx.current();
    const setCursor = (c) => { document.body.style.cursor = c; };

    const over = (cx, cy) => {
      if (!groupRef.current) return false;
      const r = canvas.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObject(groupRef.current, true).length > 0;
    };
    const scrollBy = (d) => {
      const next = clamp(s.target + d, 0, max);
      if (next === s.target) return false;
      s.target = next;
      return true;
    };

    const onMove = (e) => {
      if (st.dragging || e.pointerType === "touch") return;
      st.hover = over(e.clientX, e.clientY);
      setCursor(st.hover ? "grab" : "");
    };
    const onLeave = () => { st.hover = false; if (!st.dragging) setCursor(""); };

    const onWheel = (e) => {
      if (!wheel || e.ctrlKey || !over(e.clientX, e.clientY)) return;
      const d = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      if (scrollBy(d)) e.preventDefault(); // at top/bottom the page scrolls instead
    };

    /* click + drag. Drag UP -> content moves up -> scroll position increases */
    const onDown = (e) => {
      if (e.pointerType === "touch" || e.button !== 0 || !over(e.clientX, e.clientY)) return;
      st.dragging = true;
      e.preventDefault();
      window.getSelection()?.removeAllRanges();
      const noSelect = (ev) => ev.preventDefault();
      document.addEventListener("selectstart", noSelect);
      document.body.style.userSelect = "none";
      setCursor("grabbing");
      let lastY = e.clientY, lastT = performance.now(), vel = 0;
      const move = (ev) => {
        const now = performance.now();
        const d = -(ev.clientY - lastY) * toContent();
        s.target = clamp(s.target + d, 0, max);
        vel = d / Math.max(now - lastT, 1);
        lastY = ev.clientY;
        lastT = now;
      };
      const up = () => {
        st.dragging = false;
        setCursor(st.hover ? "grab" : "");
        document.body.style.userSelect = "";
        document.removeEventListener("selectstart", noSelect);
        if (performance.now() - lastT < 80) s.target = clamp(s.target + vel * 220, 0, max); // flick momentum
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
    // mousedown's default action is what starts text selection
    const onMouseDown = (e) => { if (e.button === 0 && over(e.clientX, e.clientY)) e.preventDefault(); };
    const onDragStart = (e) => { if (over(e.clientX, e.clientY)) e.preventDefault(); };

    const onTouchStart = (e) => {
      const t = e.touches[0];
      st.touch = touch && over(t.clientX, t.clientY);
      st.touchY = t.clientY;
    };
    const onTouchMove = (e) => {
      if (!st.touch) return;
      const yy = e.touches[0].clientY, dy = yy - st.touchY;
      st.touchY = yy;
      if (scrollBy(-dy * toContent()) && e.cancelable) e.preventDefault();
    };
    const endTouch = () => { st.touch = false; };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("dragstart", onDragStart);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", endTouch);
    el.addEventListener("touchcancel", endTouch);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("dragstart", onDragStart);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", endTouch);
      el.removeEventListener("touchcancel", endTouch);
      setCursor("");
      document.body.style.userSelect = "";
    };
  }, [element, gl, camera, groupRef, max, viewH, wheel, touch]);

  return scroll;
}