import { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export const ACCENT = "#4F7DAD";
export const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- mobile helpers ---------- */
export const isPhone = () => typeof window !== "undefined" && window.innerWidth < 768;

/* texture scale for the phone screen: 2x on desktop, 1.5x on phones, never bigger than the GPU allows */
export function texScale(gl, contentH) {
  return Math.max(1, Math.min(isPhone() ? 1.5 : 2, gl.capabilities.maxTextureSize / contentH));
}

/* true while `el` is on (or near) the screen: used to pause WebGL rendering when scrolled away (saves battery) */
export function useOnScreen(el, margin = 100) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: `${margin}px` });
    io.observe(el);
    return () => io.disconnect();
  }, [el, margin]);
  return on;
}

/* ---------- helpers ---------- */
export function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

export function haloTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(120,169,206,0.38)");
  g.addColorStop(1, "rgba(120,169,206,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* soft studio reflections so the metal frame looks real */
export function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}

/*
  Resets the depth buffer to "far" for everything drawn after it (renderOrder > `order`).
  Draw a solid backdrop first, add <DepthReset />, then draw the phone with a higher renderOrder:
  the backdrop keeps its own depth sorting, but can never cover the phone.
*/
export function DepthReset({ order = 5 }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: "void main() { gl_Position = vec4(position.xy, 1.0, 1.0); }",
    fragmentShader: "void main() { gl_FragColor = vec4(0.0); }",
    depthTest: true, depthWrite: true, depthFunc: THREE.AlwaysDepth, colorWrite: false, transparent: true,
  }), []);
  return (
    <mesh renderOrder={order} frustumCulled={false} material={mat}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

/* ---------- 3D iPhone (children render inside the phone's group, e.g. a scan beam) ---------- */
export function Phone({ tex, children, layer }) {
  // layer: when set, the phone is drawn in the transparent pass at this renderOrder (and the next few),
  // so it always lands on top of anything with a lower order, e.g. a backdrop that ignores depth.
  const tp = layer !== undefined;
  const r = (n) => (tp ? layer + n : 0);
  const parts = useMemo(() => {
    const body = new THREE.ExtrudeGeometry(roundedRect(1, 2.06, 0.17), {
      depth: 0.09, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 8, curveSegments: 32,
    });
    body.center();

    const W = 0.97, H = 2.03;
    const screen = new THREE.ShapeGeometry(roundedRect(W, H, 0.15), 32);
    const p = screen.attributes.position, uv = screen.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + W / 2) / W, (p.getY(i) + H / 2) / H);

    const island = new THREE.ShapeGeometry(roundedRect(0.29, 0.08, 0.04), 16);
    const metal = new THREE.MeshStandardMaterial({ color: "#56646F", metalness: 1, roughness: 0.28, transparent: tp });
    return { body, screen, island, metal };
  }, [tp]);

  const buttons = [
    [-0.53, 0.62, 0.1], [-0.53, 0.42, 0.17], [-0.53, 0.18, 0.17], [0.53, 0.4, 0.28],
  ];

  return (
    <>
      <mesh geometry={parts.body} material={parts.metal} renderOrder={r(0)} />
      {buttons.map(([x, y, h]) => (
        <mesh key={`${x}${y}`} position={[x, y, 0]} material={parts.metal} renderOrder={r(0)}>
          <boxGeometry args={[0.03, h, 0.06]} />
        </mesh>
      ))}
      <mesh geometry={parts.screen} position={[0, 0, 0.067]} renderOrder={r(1)}>
        <meshBasicMaterial map={tex} color="#ffffff" toneMapped={false} fog={false} transparent={tp} />
      </mesh>
      <mesh geometry={parts.island} position={[0, 0.935, 0.069]} renderOrder={r(2)}>
        <meshBasicMaterial color="#000000" transparent={tp} />
      </mesh>
      {children}
    </>
  );
}

/* ---------- 3D architecture backdrop (procedural blueprint skyline) ---------- */
const seeded = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutQuart = (p) => 1 - Math.pow(1 - p, 4);
const easeOutBack = (p) => { const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };

const toGeo = (a) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(a, 3));
  return g;
};

/* multi-storey block */
function towerSegments(w, h, d, roof) {
  const a = [], x = w / 2, z = d / 2;
  const P = (...v) => a.push(...v);
  [[-x, -z], [x, -z], [x, z], [-x, z]].forEach(([px, pz]) => P(px, 0, pz, px, h, pz));
  const levels = Math.max(2, Math.round(h / 0.55));
  for (let k = 0; k <= levels; k++) {
    const y = (k * h) / levels;
    P(-x, y, -z, x, y, -z, x, y, -z, x, y, z, x, y, z, -x, y, z, -x, y, z, -x, y, -z);
  }
  if (roof) {
    const r = d * 0.38;
    P(-x, h, -z, -x, h + r, 0, -x, h + r, 0, -x, h, z, x, h, -z, x, h + r, 0, x, h + r, 0, x, h, z, -x, h + r, 0, x, h + r, 0);
  }
  return toGeo(a);
}

/* gable-roof house. raw=true -> unfinished frame (posts, beams, trusses, bracing) */
function houseSegments(w, h, d, raw) {
  const a = [], x = w / 2, z = d / 2, rh = Math.min(w, d) * 0.55, ridge = h + rh;
  const L = (...v) => a.push(...v);
  const posts = [[-x, -z], [x, -z], [x, z], [-x, z]];
  const rect = (y) => L(-x, y, -z, x, y, -z, x, y, -z, x, y, z, x, y, z, -x, y, z, -x, y, z, -x, y, -z);

  posts.forEach(([px, pz]) => L(px, 0, pz, px, h, pz));
  rect(0); rect(h);
  // gable roof, ridge along x
  L(-x, h, -z, -x, ridge, 0, -x, ridge, 0, -x, h, z);
  L(x, h, -z, x, ridge, 0, x, ridge, 0, x, h, z);
  L(-x, ridge, 0, x, ridge, 0);

  if (raw) {
    rect(h * 0.5);                                   // mid-floor slab edge
    const n = Math.max(2, Math.round(w / 0.7));
    for (let k = 1; k < n; k++) {                    // roof trusses + wall studs
      const px = -x + (w * k) / n;
      L(px, h, -z, px, ridge, 0, px, ridge, 0, px, h, z);
      L(px, 0, -z, px, h, -z, px, 0, z, px, h, z);
    }
    L(-x, 0, z, x, h, z, x, 0, z, -x, h, z);         // X bracing on the front face
  } else {
    const dh = Math.min(h * 0.62, 0.9), dw = 0.22;   // door
    L(-dw, 0, z, -dw, dh, z, dw, 0, z, dw, dh, z, -dw, dh, z, dw, dh, z);
    [-1, 1].forEach((sd) => {                        // windows
      const cx = sd * w * 0.28, y0 = h * 0.4, y1 = h * 0.78, ww = 0.18;
      L(cx - ww, y0, z, cx + ww, y0, z, cx + ww, y0, z, cx + ww, y1, z, cx + ww, y1, z, cx - ww, y1, z, cx - ww, y1, z, cx - ww, y0, z, cx, y0, z, cx, y1, z);
    });
    const cx = x * 0.55, cz = -z * 0.35, cs = 0.13, top = ridge + 0.3, base = h + rh * 0.55; // chimney
    [[-cs, -cs], [cs, -cs], [cs, cs], [-cs, cs]].forEach(([dx, dz]) => L(cx + dx, base, cz + dz, cx + dx, top, cz + dz));
    L(cx - cs, top, cz - cs, cx + cs, top, cz - cs, cx + cs, top, cz - cs, cx + cs, top, cz + cs,
      cx + cs, top, cz + cs, cx - cs, top, cz + cs, cx - cs, top, cz + cs, cx - cs, top, cz - cs);
  }
  return toGeo(a);
}

/* ---------- tall blueprint towers: "drafted" on screen, step by step ---------- */
const LH = 0.3;     // storey height
const DRAW = 4.5;   // seconds to draft one tower
const lerp = (a, b, t) => a + (b - a) * t;

function towerBlueprint(w, d, h) {
  const m = [], g = [];
  const levels = Math.round(h / LH), x = w / 2, z = d / 2;
  const scaleAt = (y) => (y < h * 0.6 ? 1 : y < h * 0.82 ? 0.78 : 0.56); // setbacks
  const rect = (arr, hw, hd, y) => arr.push(-hw, y, -hd, hw, y, -hd, hw, y, -hd, hw, y, hd, hw, y, hd, -hw, y, hd, -hw, y, hd, -hw, y, -hd);
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];

  // 1 · floor plan: footprint, structural core, struts joining them
  rect(m, x, z, 0); rect(m, x * 0.38, z * 0.38, 0);
  corners.forEach(([a, b]) => m.push(a * x, 0, b * z, a * x * 0.38, 0, b * z * 0.38));

  // 2 · structure, storey by storey: columns, floor edges, core, bracing, setbacks
  let prev = 1;
  for (let k = 1; k <= levels; k++) {
    const y0 = (k - 1) * LH, y1 = k * LH, s = scaleAt(y0), hw = x * s, hd = z * s;
    if (s !== prev) rect(m, hw, hd, y0);
    [-1, -1 / 3, 1 / 3, 1].forEach((f) => m.push(f * hw, y0, -hd, f * hw, y1, -hd, f * hw, y0, hd, f * hw, y1, hd));
    [-1 / 3, 1 / 3].forEach((f) => m.push(-hw, y0, f * hd, -hw, y1, f * hd, hw, y0, f * hd, hw, y1, f * hd));
    corners.forEach(([a, b]) => m.push(a * hw * 0.38, y0, b * hd * 0.38, a * hw * 0.38, y1, b * hd * 0.38));
    rect(m, hw, hd, y1);
    if (k % 4 === 0) m.push(-hw, y0, hd, hw, y1, hd, hw, y0, hd, -hw, y1, hd);
    prev = s;
  }

  // 3 · crown + spire
  const s = scaleAt(h), hw = x * s, hd = z * s, apex = h * 1.2;
  corners.forEach(([a, b]) => m.push(a * hw, h, b * hd, 0, apex, 0));
  m.push(0, apex, 0, 0, apex + 0.7, 0);

  // drafting guides: centre axes, height + width dimension lines with ticks
  g.push(-x * 2.4, 0, 0, x * 2.4, 0, 0, 0, 0, -z * 2.4, 0, 0, z * 2.4);
  const dx = x + 0.7, dz = z + 0.7;
  g.push(dx, 0, dz, dx, apex, dz);
  for (let k = 0; k <= levels; k++) g.push(dx - 0.09, k * LH, dz, dx + 0.09, k * LH, dz);
  g.push(dx - 0.28, 0, dz, dx + 0.28, 0, dz, dx - 0.28, apex, dz, dx + 0.28, apex, dz);
  g.push(-x, 0, dz, x, 0, dz, -x, 0, dz - 0.14, -x, 0, dz + 0.14, x, 0, dz - 0.14, x, 0, dz + 0.14);
  return { main: m, guide: g };
}

const STAGES = ["01  FLOOR PLAN", "02  STRUCTURE", "03  SETBACKS & CROWN", "04  DESIGN COMPLETE"];

function makeTower(cfg, color, penColor) {
  // tallest height that still fits in the camera view at this depth
  const h = (3 + 0.196 * (7 - cfg.z) - 1.1) / 1.2;
  const { main, guide } = towerBlueprint(cfg.w, cfg.d, h);
  const mGeo = toGeo(main), gGeo = toGeo(guide);
  mGeo.setDrawRange(0, 0); gGeo.setDrawRange(0, 0);

  const mLine = new THREE.LineSegments(mGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 }));
  const gLine = new THREE.LineSegments(gGeo, new THREE.LineDashedMaterial({ color, transparent: true, opacity: 0.45, dashSize: 0.16, gapSize: 0.08 }));
  gLine.computeLineDistances();
  const pen = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 12, 12),
    new THREE.MeshBasicMaterial({ color: penColor, fog: false, toneMapped: false })
  );

  const g = new THREE.Group();
  g.position.set(cfg.x, 0, cfg.z);
  g.visible = false;
  g.add(gLine, mLine, pen);

  let label = null;
  if (cfg.label) {
    const cv = document.createElement("canvas");
    cv.width = 512; cv.height = 64;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, opacity: 0.9 }));
    spr.scale.set(4, 0.5, 1);
    spr.position.set(cfg.w / 2 + 2.9, h * 0.8, cfg.d / 2 + 0.7);
    g.add(spr);
    label = { cv, tex, stage: -1, color, spr };
  }
  return { g, mGeo, gGeo, pen, label, mSegs: main.length / 6, gSegs: guide.length / 6, at: cfg.at };
}

function updateTower(tw, el, now, showLabel = true) {
  const P = clamp01((el - tw.at) / DRAW);   // overall progress of this tower
  const q = clamp01((P - 0.06) / 0.94);     // progress of the main drawing
  tw.g.visible = P > 0;

  tw.gGeo.setDrawRange(0, 2 * Math.floor(clamp01(P / 0.3) * tw.gSegs)); // guides are laid down first
  const f = q * tw.mSegs, n = Math.min(Math.floor(f), tw.mSegs);
  tw.mGeo.setDrawRange(0, 2 * n);

  // the "pen": a bright dot at the tip of the line being drawn
  const pos = tw.mGeo.attributes.position, i = Math.min(n, tw.mSegs - 1) * 2, fr = f - n;
  tw.pen.position.set(
    lerp(pos.getX(i), pos.getX(i + 1), fr), lerp(pos.getY(i), pos.getY(i + 1), fr), lerp(pos.getZ(i), pos.getZ(i + 1), fr)
  );
  tw.pen.visible = q > 0 && q < 1;
  tw.pen.scale.setScalar(1 + 0.35 * Math.sin(now * 14));

  if (tw.label) {
    tw.label.spr.visible = showLabel;   // on narrow (portrait) screens the label would be cropped
    const stage = P < 0.3 ? 0 : q < 0.6 ? 1 : q < 1 ? 2 : 3;
    if (stage !== tw.label.stage) {
      tw.label.stage = stage;
      const ctx = tw.label.cv.getContext("2d");
      ctx.clearRect(0, 0, 512, 64);
      ctx.font = "600 26px 'Courier New', monospace";
      ctx.textBaseline = "middle";
      ctx.fillStyle = tw.label.color;
      ctx.fillText(STAGES[stage], 10, 32);
      tw.label.tex.needsUpdate = true;
    }
  }
}

const TOWERS = [
  { x: -1.2, z: -9, w: 1.9, d: 1.7, at: 0.6, label: true },
  { x: 7.6, z: -12, w: 2.1, d: 1.8, at: 1.5 },
  { x: -7.6, z: -10, w: 1.8, d: 1.6, at: 2.2 },
  { x: 9.6, z: -8, w: 1.9, d: 1.7, at: 2.9 },
];

const COLS = 8, ROWS = 3, RISE = 1.4; // RISE = seconds each building takes to rise and align

/*
  The intro animation starts when this component mounts, so mount the Canvas
  when the section scrolls into view.
  color / penColor / gridOpacity let you retune it for light or dark backgrounds.
*/
export const Architecture = memo(function Architecture({ color = ACCENT, penColor = "#1C2C35", gridOpacity = 0.16 }) {
  const group = useRef();
  const nodes = useRef([]);
  const t0 = useRef(null);

  const buildings = useMemo(
    () => Array.from({ length: COLS * ROWS }, (_, i) => {
      const r = (n) => seeded(i * 13 + n);
      const col = i % COLS, row = Math.floor(i / COLS), roll = r(7);
      // front row = low houses; back rows are mostly houses/raw frames so the tall blueprint towers stand out
      const kind = row === 0 ? (roll < 0.5 ? "house" : "raw") : roll < 0.15 ? "tower" : roll < 0.6 ? "house" : "raw";
      if (row === 0 && kind === "raw") return null; // no raw frames in the front row
      const x = -14 + col * 4 + (r(2) - 0.5) * 1.6;
      const z = -3.5 - row * 4.2 - r(3) * 1.2;

      let geo;
      if (kind === "tower") {
        const h = 1.3 + r(1) * 1.8;
        geo = towerSegments(1.6 + r(4) * 1.4, h, 1.6 + r(5) * 1.2, r(6) > 0.55 && h < 3.6);
      } else {
        geo = houseSegments(1.8 + r(4) * 1.0, 0.9 + r(1) * 0.6, 1.6 + r(5) * 0.8, kind === "raw");
      }
      return {
        key: i, geo, pos: [x, 0, z],
        op: kind === "tower" ? 0.42 : 0.58,
        delay: ((x + 14) / 28) * 1.3 + r(8) * 0.35,       // sweeps in from left to right
        from: [(r(9) - 0.5) * 8, (r(10) - 0.5) * 6],      // start scattered...
        spin: (r(11) - 0.5) * 1.4,                        // ...and misaligned
      };
    }).filter(Boolean), []);

  const towers = useMemo(() => TOWERS.map((cfg) => makeTower(cfg, color, penColor)), [color, penColor]);

  const grid = useMemo(() => {
    const g = new THREE.GridHelper(60, 60, color, color);
    g.material.transparent = true;
    g.material.opacity = 0;
    g.material.depthWrite = false;
    return g;
  }, [color]);

  useFrame(({ clock, pointer, size }) => {
    const now = clock.getElapsedTime();
    if (t0.current === null) t0.current = now;
    const el = reduced ? 99 : now - t0.current;   // seconds since the scene mounted
    const t = reduced ? 0 : now;

    grid.material.opacity = gridOpacity * clamp01(el / 1.2);

    // intro: every building rises from the ground and slides/rotates into its aligned spot
    buildings.forEach((b, i) => {
      const m = nodes.current[i];
      if (!m) return;
      const p = clamp01((el - b.delay) / RISE);
      const e = easeOutQuart(p);
      m.visible = p > 0;
      m.scale.y = Math.max(0.001, easeOutBack(p));
      m.position.set(b.pos[0] + b.from[0] * (1 - e), 0, b.pos[2] + b.from[1] * (1 - e));
      m.rotation.y = b.spin * (1 - e);
      m.material.opacity = b.op * clamp01(p * 2.5);
    });

    // tall towers are drafted line by line
    towers.forEach((tw) => updateTower(tw, el, now, size.width >= 1024));

    group.current.rotation.y = Math.sin(t * 0.08) * 0.12 + pointer.x * 0.05;
    group.current.position.x = -pointer.x * 0.5;
  });

  return (
    <group ref={group} position={[0, -2.4, 0]}>
      <primitive object={grid} />
      {towers.map((tw, i) => <primitive key={`t${i}`} object={tw.g} />)}
      {buildings.map((b, i) => (
        <lineSegments key={b.key} ref={(m) => (nodes.current[i] = m)} geometry={b.geo} visible={false}>
          <lineBasicMaterial color={color} transparent opacity={0} />
        </lineSegments>
      ))}
    </group>
  );
});