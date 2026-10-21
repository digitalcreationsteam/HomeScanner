import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { reduced } from "./Blueprint3d";

/*
  A flat floor plan that is "built" as a solid, lit 3D model:
    1. a wood-floor base appears and the plan is drawn flat on it (wall outlines, dimensions, room names)
    2. solid walls rise out of the plan one after another
    3. furniture (sofa, beds, kitchen, bath ...) rises inside the rooms
    4. the model tilts like an isometric view and slowly sways
  Everything casts and receives real shadows (the Canvas needs `shadows` and a shadow-casting light).
  Starts when it mounts, so mount the Canvas when the section scrolls into view.
*/

export const PLAN_W = 9.6;      // approx. width of the plan incl. dimension lines (world units)
const T = 0.14;                 // wall thickness
const WH = 0.95;                // wall height
const SLAB_W = 8.8, SLAB_D = 6.8, SLAB_T = 0.15;
const LINE = "#78A9CE";

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutBack = (p) => { const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
const easeOutQuart = (p) => 1 - Math.pow(1 - p, 4);
const seeded = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };

/* walls as [x1, z1, x2, z2]; gaps are doors */
const WALLS = [
  // outside
  [-4, -3, 4, -3], [-4, 3, -0.8, 3], [0.8, 3, 4, 3], [-4, -3, -4, 3], [4, -3, 4, 3],
  // inside: horizontal wall with door gaps, vertical dividers, half wall between living room and kitchen
  [-4, -0.6, -2.6, -0.6], [-1.6, -0.6, 0, -0.6], [0.9, -0.6, 2.8, -0.6], [3.6, -0.6, 4, -0.6],
  [-0.8, -3, -0.8, -0.6], [2, -3, 2, -0.6], [1.2, 0.6, 1.2, 3],
];

/* furniture as [type, x, z, width (x), depth (z), height] */
const FURN = [
  ["sofa", -0.8, 1.2, 0.8, 2.0],
  ["coffee", -2.2, 1.2, 1.0, 0.8, 0.16],
  ["tv", -3.7, 1.2, 0.3, 1.8, 0.45],
  ["counter", 3.6, 1.4, 0.6, 2.8, 0.5],
  ["counter", 2.4, 1.6, 0.8, 1.4, 0.45],      // island
  ["bed", -2.9, -2.0, 2.0, 1.6],
  ["nightstand", -1.4, -2.6, 0.4, 0.4, 0.3],
  ["wardrobe", -3.3, -0.95, 1.4, 0.5, 0.8],
  ["tub", 0.6, -2.5, 1.4, 0.7, 0.3],
  ["toilet", 1.5, -1.3, 0.4, 0.5],
  ["sink", -0.35, -1.4, 0.4, 0.4, 0.3],
  ["bed", 3.0, -1.8, 1.2, 1.6],
];

/* flat labels written on the floor: [text, x, z, width, color] (free floor spots, outside = light blue) */
const INK = "#4A3622";
const LABELS = [
  ["LIVING", -2.2, 2.5, 1.3, INK], ["KITCHEN", 2.5, 0.2, 1.5, INK], ["BEDROOM", -1.35, -1.55, 0.9, INK],
  ["BATH", 0.55, -1.65, 0.8, INK], ["BED 2", 3.0, -0.82, 0.9, INK],
  ["SCAN HERE", 0, 3.7, 1.7, LINE], ["8.0 m", 0, 4.65, 0.9, LINE], ["6.0 m", -5.5, 0, 0.9, LINE],
];

/* ---------- materials ---------- */
const std = (color, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });

/* procedural oak floor: staggered planks, grain, small tone differences */
function woodTexture() {
  const S = 1024, plank = 128, len = 420;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#5A4330";
  ctx.fillRect(0, 0, S, S);
  let n = 0;
  for (let y = 0, row = 0; y < S; y += plank, row++) {
    for (let x = -((row * 137) % len); x < S; x += len, n++) {
      const l = 50 + seeded(n) * 9;
      ctx.fillStyle = `hsl(${30 + seeded(n + 3) * 4}, ${46 + seeded(n + 5) * 8}%, ${l}%)`;
      ctx.fillRect(x + 2, y + 2, len - 4, plank - 4);
      ctx.strokeStyle = "rgba(90,55,25,0.13)";
      ctx.lineWidth = 1.2;
      for (let g = 0; g < 7; g++) {
        const gy = y + 10 + seeded(n * 11 + g) * (plank - 20);
        ctx.beginPath();
        ctx.moveTo(x + 4, gy);
        ctx.bezierCurveTo(x + len * 0.3, gy + 3, x + len * 0.65, gy - 3, x + len - 4, gy + 1);
        ctx.stroke();
      }
    }
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 4.25);
  t.anisotropy = 8;
  return t;
}

function floorLabel(text, x, z, w, color) {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 128;
  const ctx = cv.getContext("2d");
  ctx.font = "600 56px 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), mat);
  mesh.rotation.x = -Math.PI / 2;      // lie flat on the floor
  mesh.position.set(x, 0.03, z);
  mesh.renderOrder = 1;
  return { mesh, mat };
}

/* a solid block whose base sits at y (x, z = its centre) */
function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y + h / 2, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function furniture(type, w, d, h, M) {
  const g = new THREE.Group();
  const add = (...a) => g.add(box(...a));
  switch (type) {
    case "sofa":                                         // back on the +x side
      add(w, 0.2, d, M.fabricD);
      add(w - 0.26, 0.16, d - 0.36, M.fabric, -0.13, 0.2, 0);
      add(0.26, 0.55, d, M.fabric, w / 2 - 0.13, 0.2, 0);
      [-1, 1].forEach((s) => add(w, 0.3, 0.18, M.fabricD, 0, 0.2, s * (d / 2 - 0.09)));
      break;
    case "coffee":
      add(w, 0.05, d, M.woodL, 0, h - 0.05, 0);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => add(0.05, h - 0.05, 0.05, M.woodD, a * (w / 2 - 0.05), 0, b * (d / 2 - 0.05)));
      break;
    case "tv":
      add(w, h, d, M.woodD);
      add(0.04, 0.42, 1.25, M.black, 0, h, 0);
      break;
    case "counter":                                      // kitchen counter / island
      add(w, h, d, M.cabinet);
      add(w + 0.04, 0.05, d + 0.02, M.stone, 0, h, 0);
      break;
    case "bed": {                                        // head at -x (wide bed) or -z (narrow bed)
      const headX = w > d, L = headX ? w : d, B = headX ? d : w;
      const bg = new THREE.Group();
      const badd = (...a) => bg.add(box(...a));
      badd(L, 0.18, B, M.woodD);
      badd(L - 0.1, 0.16, B - 0.1, M.white, 0, 0.18, 0);
      badd(0.1, 0.55, B, M.woodD, -L / 2 + 0.05, 0, 0);
      const pw = Math.min(0.4, B * 0.38);
      [-1, 1].forEach((s) => badd(0.32, 0.08, pw, M.white, -L / 2 + 0.3, 0.34, s * B * 0.22));
      badd(L * 0.5, 0.05, B - 0.1, M.blanket, L * 0.25 - 0.05, 0.34, 0);
      if (!headX) bg.rotation.y = -Math.PI / 2;
      g.add(bg);
      break;
    }
    case "nightstand":
      add(w, h, d, M.woodL);
      add(0.12, 0.2, 0.12, M.white, 0, h, 0);
      break;
    case "wardrobe":                                     // doors face +z
      add(w, h, d, M.woodL);
      add(0.02, h * 0.92, 0.01, M.woodD, 0, h * 0.04, d / 2);
      add(0.02, 0.12, 0.02, M.black, -0.07, h * 0.4, d / 2 + 0.01);
      add(0.02, 0.12, 0.02, M.black, 0.07, h * 0.4, d / 2 + 0.01);
      break;
    case "tub":
      add(w, h, d, M.white);
      add(w - 0.2, 0.01, d - 0.2, M.water, 0, h, 0);
      break;
    case "toilet":                                       // tank against the +x wall
      add(w * 0.6, 0.22, d, M.white, -w * 0.2, 0, 0);
      add(w * 0.28, 0.38, d, M.white, w * 0.36, 0, 0);
      break;
    case "sink":
      add(w, h, d, M.woodL);
      add(w - 0.08, 0.03, d - 0.08, M.white, 0, h, 0);
      break;
    default:
      add(w, h || 0.3, d, M.white);
  }
  return g;
}

function buildPlan() {
  const root = new THREE.Group();
  const M = {
    wall: std("#DCE1E6", 0.9), wallTop: std("#B9C2CA", 0.8),
    woodL: std("#C9A070", 0.6), woodD: std("#7A5436", 0.6),
    fabric: std("#6F8CA6", 0.95), fabricD: std("#3F5668", 0.95),
    white: std("#F4F4F1", 0.5), cabinet: std("#E6E1D8", 0.6), stone: std("#2D353B", 0.35, 0.1),
    blanket: std("#4F7DAD", 0.95), black: std("#0E1316", 0.3, 0.3), water: std("#9ACBE8", 0.15),
  };

  // drafting grid under the model
  const grid = new THREE.GridHelper(16, 32, LINE, LINE);
  grid.position.y = -SLAB_T - 0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0;
  grid.material.depthWrite = false;
  grid.renderOrder = 1;
  root.add(grid);

  // wood-floor base (a slab with a real thickness)
  const slabGeo = new THREE.BoxGeometry(SLAB_W, SLAB_T, SLAB_D);
  slabGeo.translate(0, -SLAB_T / 2, 0);
  const side = std("#5A4231", 0.7);
  const top = std("#ffffff", 0.55);
  top.map = woodTexture();
  const slab = new THREE.Mesh(slabGeo, [side, side, top, side, side, side]);
  slab.receiveShadow = slab.castShadow = true;
  slab.visible = false;
  root.add(slab);

  // walls: a flat outline appears first, then the solid wall rises from it
  const wallMats = [M.wall, M.wall, M.wallTop, M.wall, M.wall, M.wall];
  const walls = WALLS.map(([x1, z1, x2, z2], i) => {
    const horizontal = z1 === z2;
    const len = Math.abs(horizontal ? x2 - x1 : z2 - z1);
    const w = horizontal ? len + T : T, d = horizontal ? T : len + T;
    const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;

    const geo = new THREE.BoxGeometry(w, WH, d);
    geo.translate(0, WH / 2, 0);
    const mesh = new THREE.Mesh(geo, wallMats);
    mesh.castShadow = mesh.receiveShadow = true;
    const g = new THREE.Group();
    g.add(mesh);
    g.position.set(cx, 0, cz);
    g.scale.y = 0.001;
    g.visible = false;
    root.add(g);

    const footMat = new THREE.LineBasicMaterial({ color: "#CFE8F8", transparent: true, opacity: 0, depthWrite: false });
    const foot = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-w / 2, 0.02, -d / 2), new THREE.Vector3(w / 2, 0.02, -d / 2),
        new THREE.Vector3(w / 2, 0.02, d / 2), new THREE.Vector3(-w / 2, 0.02, d / 2),
      ]),
      footMat
    );
    foot.position.set(cx, 0, cz);
    foot.renderOrder = 1;
    root.add(foot);

    return { g, footMat, appear: 0.5 + i * 0.09, rise: 2.0 + i * 0.07 };
  });

  // furniture rises after the walls
  const furn = FURN.map(([type, x, z, w, d, h], j) => {
    const g = furniture(type, w, d, h, M);
    g.position.set(x, 0, z);
    g.scale.y = 0.001;
    g.visible = false;
    root.add(g);
    return { g, rise: 3.7 + j * 0.12 };
  });

  // flat drafting marks: dimension lines with end ticks
  const dim = [];
  dim.push(-4.4, 0, 4.2, 4.4, 0, 4.2, -4.4, 0, 4.05, -4.4, 0, 4.35, 4.4, 0, 4.05, 4.4, 0, 4.35);       // width
  dim.push(-4.9, 0, -3.4, -4.9, 0, 3.4, -5.05, 0, -3.4, -4.75, 0, -3.4, -5.05, 0, 3.4, -4.75, 0, 3.4); // depth
  const dimGeo = new THREE.BufferGeometry();
  dimGeo.setAttribute("position", new THREE.Float32BufferAttribute(dim, 3));
  const dimMat = new THREE.LineBasicMaterial({ color: LINE, transparent: true, opacity: 0 });
  const dimLines = new THREE.LineSegments(dimGeo, dimMat);
  dimLines.renderOrder = 1;
  root.add(dimLines);

  // room names written on the floor
  const labels = LABELS.map(([t, x, z, w, c]) => floorLabel(t, x, z, w, c));
  labels.forEach((l) => root.add(l.mesh));

  // pulsing ring at the front door: where you scan
  const ringMat = new THREE.MeshBasicMaterial({ color: "#FFFFFF", transparent: true, opacity: 0, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.45, 48), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.03, 3);
  ring.renderOrder = 1;
  root.add(ring);

  return { root, grid, slab, walls, furn, dimMat, labels, ring, ringMat };
}

export default function FloorPlan({ view }) {
  const tilt = useRef();
  const spin = useRef();
  const t0 = useRef(null);
  const plan = useMemo(() => buildPlan(), []);

  useFrame(({ clock, pointer }) => {
    const now = clock.getElapsedTime();
    if (t0.current === null) t0.current = now;
    const el = reduced ? 99 : now - t0.current;   // seconds since the scene mounted
    const t = reduced ? 0 : now;

    plan.grid.material.opacity = 0.14 * clamp01(el / 1.2);

    // base slides in
    const fe = easeOutQuart(clamp01((el - 0.3) / 1.0));
    plan.slab.visible = fe > 0;
    plan.slab.scale.set(0.85 + 0.15 * fe, 1, 0.85 + 0.15 * fe);

    const grow = (s) => {
      const p = clamp01((el - s.rise) / 0.9);
      s.g.visible = p > 0;
      s.g.scale.y = Math.max(0.001, easeOutBack(p));
    };
    plan.walls.forEach((s) => {
      grow(s);
      const a = clamp01((el - s.appear) / 0.5), q = clamp01((el - s.rise) / 0.6);
      s.footMat.opacity = 0.9 * a * (1 - q);      // the flat outline hands over to the solid wall
    });
    plan.furn.forEach(grow);

    // dimensions + room names are drawn on the flat plan
    const f = clamp01((el - 1.2) / 0.8);
    plan.dimMat.opacity = 0.55 * f;
    plan.labels.forEach((l) => { l.mat.opacity = 0.8 * f; });

    // entrance ring
    const p = (t * 0.7) % 1;
    plan.ring.scale.setScalar(1 + p * 0.9);
    plan.ringMat.opacity = 0.85 * (1 - p) * f;

    // isometric-style tilt (settles in as the scene starts) + gentle sway
    const settle = 1 - Math.pow(1 - clamp01(el / 2.2), 3);
    // view = what the visitor did by dragging: extra yaw / pitch (smoothed in PhoneScene)
    const yaw = view ? view.current.yaw : 0, pitch = view ? view.current.pitch : 0;
    tilt.current.rotation.x = 0.35 + 0.6 * settle + pitch - pointer.y * 0.05;
    spin.current.rotation.y = -0.5 + Math.sin(t * 0.15) * 0.28 * (1 - Math.min(1, Math.abs(yaw))) + yaw + pointer.x * 0.12;
  });

  return (
    <group ref={tilt}>
      <group ref={spin}>
        <primitive object={plan.root} />
      </group>
    </group>
  );
}