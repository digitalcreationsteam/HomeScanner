import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { drawFeed, rr, FEED_H } from "./Usephonescroll";
import screenImage from "../assets/app-splash.jpeg";

const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ZOOM_MIN = 0.6, ZOOM_MAX = 2.2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- screen texture: splash first, passport feed below ---------- */
const LOGICAL_W = 512;
const SCALE = 2;
const VIEW_H = Math.round((LOGICAL_W * 2.03) / 0.97);
const FEED_TOP = VIEW_H + 40;
const CONTENT_H = FEED_TOP + FEED_H;

function paintScreen(canvas, img) {
  const ctx = canvas.getContext("2d");
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.fillStyle = "#1C2C35";
  ctx.fillRect(0, 0, LOGICAL_W, CONTENT_H);

  if (img) {
    const r = Math.max(LOGICAL_W / img.width, VIEW_H / img.height);
    const dw = img.width * r, dh = img.height * r;
    ctx.drawImage(img, (LOGICAL_W - dw) / 2, (VIEW_H - dh) / 2, dw, dh);
  }

  ctx.fillStyle = "rgba(28,44,53,0.6)";
  rr(ctx, 156, VIEW_H - 96, 200, 44, 22); ctx.fill();
  ctx.font = "500 18px Roboto, sans-serif";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("Drag up to explore", LOGICAL_W / 2, VIEW_H - 68);

  drawFeed(ctx, LOGICAL_W, FEED_TOP);
}

function makeTex(canvas, gl) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = gl.capabilities.getMaxAnisotropy();
  t.repeat.set(1, VIEW_H / CONTENT_H);
  t.offset.set(0, 1 - VIEW_H / CONTENT_H);
  return t;
}

/* ---------- helpers ---------- */
function roundedRect(w, h, r) {
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

function haloTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(120,169,206,0.35)");
  g.addColorStop(1, "rgba(120,169,206,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => { scene.environment = null; env.dispose(); pmrem.dispose(); };
  }, [gl, scene]);
  return null;
}

/* ---------- one 3D iPhone ---------- */
function Phone({ tex, tint }) {
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
    const metal = new THREE.MeshStandardMaterial({ color: tint, metalness: 1, roughness: 0.28 });
    return { body, screen, island, metal };
  }, [tint]);

  const buttons = [[-0.53, 0.62, 0.1], [-0.53, 0.42, 0.17], [-0.53, 0.18, 0.17], [0.53, 0.4, 0.28]];

  return (
    <>
      <mesh geometry={parts.body} material={parts.metal} />
      {buttons.map(([x, y, h]) => (
        <mesh key={`${x}${y}`} position={[x, y, 0]} material={parts.metal}>
          <boxGeometry args={[0.03, h, 0.06]} />
        </mesh>
      ))}
      <mesh geometry={parts.screen} position={[0, 0, 0.067]}>
        <meshBasicMaterial map={tex} color="#ffffff" toneMapped={false} fog={false} />
      </mesh>
      <mesh geometry={parts.island} position={[0, 0.935, 0.069]}>
        <meshBasicMaterial color="#000000" />
      </mesh>
    </>
  );
}

/* ---------- scene ---------- */
function Scene({ source, zone, view }) {
  const rig = useRef();
  const duo = useRef();
  const phoneA = useRef();
  const phoneB = useRef();
  const screenPx = useRef(500);
  const scroll = useRef({ current: 0, target: 0 });

  const gl = useThree((s) => s.gl);
  const halo = useMemo(haloTexture, []);

  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = LOGICAL_W * SCALE;
    c.height = CONTENT_H * SCALE;
    paintScreen(c, null);
    return c;
  }, []);
  const texA = useMemo(() => makeTex(canvas, gl), [canvas, gl]);
  const texB = useMemo(() => makeTex(canvas, gl), [canvas, gl]);

  // load the splash image, then repaint (and again when the font is ready)
  useEffect(() => {
    let img = null, alive = true;
    const repaint = () => {
      if (!alive) return;
      paintScreen(canvas, img);
      texA.needsUpdate = true;
      texB.needsUpdate = true;
    };
    const im = new Image();
    im.onload = () => { img = im; repaint(); };
    im.src = screenImage;
    document.fonts?.ready.then(repaint);
    return () => { alive = false; };
  }, [canvas, texA, texB]);

  // drag in the phone zone = scroll the screens; drag elsewhere = rotate; Ctrl/Cmd + wheel = zoom
  useEffect(() => {
    if (!source) return;
    const v = view.current;
    let mode = null, lx = 0, ly = 0;

    const down = (e) => {
      if (e.pointerType === "touch") return;          // touch keeps scrolling the page
      if (e.target.closest?.("button")) return;
      mode = zone && zone.contains(e.target) ? "scroll" : "rotate";
      lx = e.clientX; ly = e.clientY;
    };
    const move = (e) => {
      if (!mode) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      if (mode === "scroll") {
        const s = scroll.current;
        s.target = clamp(s.target - dy * (VIEW_H / (screenPx.current * v.zoom)), 0, CONTENT_H - VIEW_H);
      } else {
        v.tYaw += dx * 0.006;
        v.tPitch = clamp(v.tPitch + dy * 0.004, -0.5, 0.5);
      }
    };
    const up = () => { mode = null; };
    const wheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      v.tZoom = clamp(v.tZoom * Math.exp(-e.deltaY * 0.002), ZOOM_MIN, ZOOM_MAX);
    };

    source.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    source.addEventListener("wheel", wheel, { passive: false });
    return () => {
      source.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      source.removeEventListener("wheel", wheel);
    };
  }, [source, zone, view]);

  useFrame(({ clock, pointer, viewport, size }, delta) => {
    const t = reduced ? 0 : clock.getElapsedTime();
    const v = view.current;
    const k = 1 - Math.exp(-delta * 8);
    v.yaw += (v.tYaw - v.yaw) * k;
    v.pitch += (v.tPitch - v.pitch) * k;
    v.zoom += (v.tZoom - v.zoom) * k;

    // screens: front phone scrolls the whole page, back phone shows the feed and moves at half speed
    const s = scroll.current;
    s.current += (s.target - s.current) * (1 - Math.exp(-delta * 9));
    texA.offset.y = 1 - texA.repeat.y - s.current / CONTENT_H;
    const bStart = clamp(FEED_TOP - 24 + s.current * 0.5, 0, CONTENT_H - VIEW_H);
    texB.offset.y = 1 - texB.repeat.y - bStart / CONTENT_H;

    // size and place the pair from real pixel sizes
    const wide = size.width >= 1024;
    const px = wide ? Math.min(540, size.height * 0.8) : 330;
    screenPx.current = (px * 2.03) / 2.1;
    const pk = viewport.height / size.height;
    rig.current.scale.setScalar(((px * pk) / 2.1) * v.zoom);
    rig.current.position.set(
      wide ? size.width * 0.25 * pk : 0,
      wide ? 0 : -(size.height / 2 - 30 - px / 2) * pk,
      0
    );

    duo.current.rotation.y = v.yaw + Math.sin(t * 0.45) * 0.1 + pointer.x * 0.15;
    duo.current.rotation.x = 0.05 + v.pitch - pointer.y * 0.06;

    const spread = wide ? 0.62 : 0.5;
    phoneA.current.position.set(-spread, -0.08 + Math.sin(t * 0.9) * 0.04, 0.22);
    phoneB.current.position.set(spread, 0.14 + Math.sin(t * 0.9 + 1.6) * 0.045, -0.28);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <Env />
      <group ref={rig}>
        <mesh position={[0, 0, -1]}>
          <planeGeometry args={[7, 7]} />
          <meshBasicMaterial map={halo} transparent depthWrite={false} fog={false} />
        </mesh>
        <group ref={duo}>
          <group ref={phoneA} rotation={[0, 0.22, 0]}>
            <Phone tex={texA} tint="#56646F" />
          </group>
          <group ref={phoneB} rotation={[0, -0.22, 0]}>
            <Phone tex={texB} tint="#8A7F73" />
          </group>
        </group>
      </group>
    </>
  );
}

export default function PhoneDuoScene({ source, zone, view }) {
  return (
    <Canvas
      eventSource={source}
      eventPrefix="client"
      camera={{ position: [0, 0.6, 7], fov: 32 }}
      dpr={[1.5, 2]}
      gl={{ antialias: true, alpha: true }}
      aria-label="Two 3D iPhones showing the HomeScanner app. Drag a phone to scroll its screen."
    >
      <Scene source={source} zone={zone} view={view} />
    </Canvas>
  );
}