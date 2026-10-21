import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { N, qrCells } from "./QRMark";
import { usePhoneScroll, drawFeed, clamp, FEED_H } from "./Usephonescroll";
import { Phone, Env, DepthReset, haloTexture, reduced } from "./Blueprint3d";
import FloorPlan, { PLAN_W } from "./Floorplan3d";

/* same iPhone model as the hero; the screen is a tall texture and the phone shows a VIEW_H window into it */
const LOGICAL_W = 512;
const SCALE = 2;                                          // texture is drawn at 2x for sharpness
const SCREEN_W = 0.97, SCREEN_H = 2.03;                   // world size of the phone screen
const VIEW_H = Math.round((LOGICAL_W * SCREEN_H) / SCREEN_W);
const FEED_TOP = 890;
const CONTENT_H = FEED_TOP + FEED_H;

const LINE = "#78A9CE";   // Polo Blue: lines read well on the dark section
const INK = "#1C2C35";

function draw(canvas) {
  const W = LOGICAL_W, ctx = canvas.getContext("2d");
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  const text = (s, x, y, font, color, align = "left") => {
    ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(s, x, y);
  };

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, CONTENT_H);

  text("Scan Home QR", W / 2, 130, "500 36px Rubik, sans-serif", "#ffffff", "center");
  text("Position the QR code within", W / 2, 180, "400 22px Rubik, sans-serif", "#8FA3B1", "center");
  text("the frame to scan", W / 2, 210, "400 22px Rubik, sans-serif", "#8FA3B1", "center");

  ctx.fillStyle = "#fff";
  ctx.fillRect(86, 280, 340, 340);
  ctx.fillStyle = INK;
  const cell = 300 / N;
  qrCells.forEach(([r, c]) => ctx.fillRect(106 + c * cell, 300 + r * cell, cell + 0.5, cell + 0.5));

  ctx.strokeStyle = LINE;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  const [x0, y0, x1, y1, L] = [66, 260, 446, 640, 52];
  [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]].forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx * L, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * L);
    ctx.stroke();
  });

  text("Drag to explore", W / 2, 738, "400 20px Rubik, sans-serif", "#8FA3B1", "center");
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(238, 764); ctx.lineTo(256, 782); ctx.lineTo(274, 764); ctx.stroke();

  drawFeed(ctx, W, FEED_TOP);
}

function Scene({ source, zone, view }) {
  const rig = useRef();
  const spin = useRef();
  const beam = useRef();
  const plan = useRef();
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const halo = useMemo(haloTexture, []);

  const tex = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = LOGICAL_W * SCALE;
    canvas.height = CONTENT_H * SCALE;
    draw(canvas);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = gl.capabilities.getMaxAnisotropy();
    t.repeat.set(1, VIEW_H / CONTENT_H);
    t.offset.set(0, 1 - VIEW_H / CONTENT_H);
    return t;
  }, [gl]);

  // redraw once Rubik has loaded so the screen text uses it
  useEffect(() => {
    document.fonts?.ready.then(() => { draw(tex.image); tex.needsUpdate = true; });
  }, [tex]);

  // the section switches to two columns at lg (1024px)
  const isWide = (w) => w >= 1024;
  const phonePx = (w, h) => (isWide(w) ? Math.min(600, h * 0.86) : 440);

  const scroll = usePhoneScroll({
    groupRef: spin,
    element: zone,   // only drags that start on the phone scroll its screen
    contentH: CONTENT_H,
    viewH: VIEW_H,
    getScreenPx: () => (phonePx(size.width, size.height) * SCREEN_H) / 2.1,
    wheel: false,
    touch: false,
  });

  /*
    Background interaction (drag anywhere except on the phone):
      drag            -> rotate / tilt the floor-plan model
      pinch           -> zoom (touch)
      Ctrl/Cmd+wheel  -> zoom (plain wheel keeps scrolling the page)
    Zoom buttons in Home.js use the same `view` ref.
  */
  useEffect(() => {
    if (!source) return;
    const v = view.current;
    const pts = new Map();
    let drag = null, pinch = null;
    const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };

    const down = (e) => {
      if (e.button > 0 || e.target.closest("[data-phone-zone],a,button")) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { pinch = { d: dist(), z: v.tZoom }; drag = null; }
      else if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, yaw: v.tYaw, pitch: v.tPitch };
      source.setPointerCapture?.(e.pointerId);
      source.style.cursor = "grabbing";
    };
    const move = (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size === 2) v.tZoom = clamp(pinch.z * (dist() / pinch.d), 0.6, 2.2);
      else if (drag) {
        v.tYaw = drag.yaw + (e.clientX - drag.x) * 0.006;
        v.tPitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.004, -0.5, 0.4);
      }
    };
    const up = (e) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (pts.size === 0) { drag = null; source.style.cursor = ""; }
    };
    const wheel = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      v.tZoom = clamp(v.tZoom * Math.exp(-e.deltaY * 0.01), 0.6, 2.2);
    };

    source.addEventListener("pointerdown", down);
    source.addEventListener("pointermove", move);
    source.addEventListener("pointerup", up);
    source.addEventListener("pointercancel", up);
    source.addEventListener("wheel", wheel, { passive: false });
    return () => {
      source.removeEventListener("pointerdown", down);
      source.removeEventListener("pointermove", move);
      source.removeEventListener("pointerup", up);
      source.removeEventListener("pointercancel", up);
      source.removeEventListener("wheel", wheel);
      source.style.cursor = "";
    };
  }, [source, view]);

  // always start on the "Scan Home QR" screen (top of the texture)
  useEffect(() => {
    scroll.current.current = 0;
    scroll.current.target = 0;
  }, [scroll]);

  useFrame(({ clock, pointer, viewport, size }, delta) => {
    const t = reduced ? 0 : clock.getElapsedTime();

    // smooth scroll
    const s = scroll.current;
    s.current += (s.target - s.current) * (1 - Math.exp(-delta * 9));
    tex.offset.y = 1 - tex.repeat.y - s.current / CONTENT_H;

    // size and place the phone from real pixel sizes
    const wide = isWide(size.width);
    const px = phonePx(size.width, size.height);
    const k = viewport.height / size.height;
    rig.current.scale.setScalar((px * k) / 2.1);

    // two columns: phone sits in the right column (75% of the width). Stacked: phone at the bottom.
    rig.current.position.set(
      wide ? size.width * 0.25 * k : 0,
      wide ? 0 : -(size.height / 2 - 30 - px / 2) * k,
      0
    );

    // floor-plan model: sits behind the phone (a bit left of it on wide screens), sized from real pixels
    // smooth the drag / zoom the visitor asked for
    const v = view.current, ease = 1 - Math.exp(-delta * 8);
    v.yaw += (v.tYaw - v.yaw) * ease;
    v.pitch += (v.tPitch - v.pitch) * ease;
    v.zoom += (v.tZoom - v.zoom) * ease;

    // the phone is always drawn on top of the plan, so the plan can sit and zoom freely behind it
    const planPx = wide ? Math.min(size.width * 0.55, 1000) : size.width * 0.95;
    plan.current.scale.setScalar(((planPx * k * 1.18) / PLAN_W) * v.zoom);   // 1.18 = it sits further from the camera
    plan.current.position.set(
      wide ? size.width * 0.1 * k * 1.18 : 0,
      wide ? -0.1 : -(size.height / 2 - 30 - px / 2) * k * 1.18,
      -1.2
    );

    spin.current.rotation.y = -0.28 + Math.sin(t * 0.45) * 0.14 + pointer.x * 0.2;
    spin.current.rotation.x = 0.06 - pointer.y * 0.08;
    spin.current.position.y = Math.sin(t * 0.9) * 0.04;

    // scan beam sweeps down the QR frame, rides with the content and fades out once scrolled away
    const p = (t * 0.6) % 1;
    const fade = clamp(1 - s.current / 220, 0, 1);
    beam.current.position.y = 0.5 - p * 0.68 + (s.current * SCREEN_H) / VIEW_H;
    beam.current.material.opacity = (reduced ? 0.6 : 0.9 * Math.sin(p * Math.PI)) * fade;
    beam.current.visible = fade > 0.01;
  });

  return (
    <>
      <fog attach="fog" args={[INK, 9, 24]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <Env />
      {/* solid model first, then clear depth so the phone is always drawn on top of it */}
      <group ref={plan}>
        <FloorPlan view={view} />
      </group>
      <DepthReset />
      <group ref={rig}>
        <mesh position={[0, 0, -0.7]} renderOrder={-1}>
          <planeGeometry args={[5.5, 5.5]} />
          <meshBasicMaterial map={halo} transparent depthWrite={false} fog={false} />
        </mesh>
        <group ref={spin}>
          <Phone tex={tex} layer={10}>
            <mesh ref={beam} position={[0, 0.4, 0.071]} renderOrder={14}>
              <planeGeometry args={[0.66, 0.012]} />
              <meshBasicMaterial color={LINE} transparent toneMapped={false} fog={false} />
            </mesh>
          </Phone>
        </group>
      </group>
    </>
  );
}

/* Full-section canvas: pass the <section> element as `source` so dragging anywhere on it scrolls the phone. */
export default function PhoneScene({ source, zone, view }) {
  return (
    <Canvas
      shadows
      eventSource={source}
      eventPrefix="client"
      camera={{ position: [0, 0.6, 7], fov: 32 }}
      dpr={[1.5, 2]}
      gl={{ antialias: true, alpha: true }}
      aria-label="3D iPhone scanning a home QR code in front of an architectural blueprint skyline. Drag the phone to browse the home's digital passport."
    >
      <Scene source={source} zone={zone} view={view} />
    </Canvas>
  );
}