import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* ---------- camera: orthographic, 1 unit = 1 css px, tilted down a little ---------- */
const PITCH = 0.35, DIST = 500, LOOK_Y = 115;
const CAM_Y = LOOK_Y + DIST * Math.sin(PITCH);
const CAM_Z = DIST * Math.cos(PITCH);

/* ---------- materials (shared) ---------- */
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
const M = {
  wall: std("#F1EEE8", { roughness: 0.9 }),
  concrete: std("#D9D6D0", { roughness: 0.9 }),
  sand: std("#E3CFB4"),
  brick: std("#A9553B", { roughness: 0.95 }),
  slate: std("#5C6B78", { roughness: 0.7 }),
  dark: std("#27323B", { roughness: 0.6, metalness: 0.3 }),
  wood: std("#B07A4B", { roughness: 0.6 }),
  wood2: std("#D9B88B", { roughness: 0.6 }),
  fabric: std("#7FA3C7", { roughness: 1 }),
  rug: std("#C9B79C", { roughness: 1 }),
  white: std("#FFFFFF", { roughness: 0.85 }),
  roof: std("#B5573B", { roughness: 0.75 }),
  lawn: std("#6E9A60", { roughness: 1 }),
  leaf: std("#4E8A4A", { roughness: 0.9, flatShading: true }),
  steel: std("#A5B1BA", { metalness: 1, roughness: 0.28 }),
  plinth: std("#16222A", { metalness: 0.6, roughness: 0.35 }),
  water: std("#4FB3D9", { metalness: 0.2, roughness: 0.08 }),
  glass: std("#9ED0EE", { metalness: 0.9, roughness: 0.06, transparent: true, opacity: 0.85, envMapIntensity: 1.5 }),
  glassDark: std("#2F6288", { metalness: 0.95, roughness: 0.1, envMapIntensity: 1.6 }),
  warm: std("#FFE2A3", { emissive: "#FFC766", emissiveIntensity: 1.1, roughness: 0.4 }),
  sky: std("#CDE9FF", { emissive: "#9AD0FF", emissiveIntensity: 0.9, roughness: 0.3 }),
  art: std("#E0A458", { roughness: 0.7 }),
  glow: new THREE.MeshBasicMaterial({ color: "#78A9CE" }),
};

/* ---------- tiny helpers ---------- */
const Box = ({ p = [0, 0, 0], s = [1, 1, 1], m = M.wall, r }) => (
  <mesh position={p} rotation={r} material={m}><boxGeometry args={s} /></mesh>
);
const Cyl = ({ p, r = [0.05, 0.05], h = 0.1, m, seg = 28 }) => (
  <mesh position={p} material={m}><cylinderGeometry args={[r[0], r[1], h, seg]} /></mesh>
);
const Lawn = () => <Cyl p={[0, 0, 0]} r={[0.95, 0.95]} h={0.02} m={M.lawn} seg={64} />;
const Tree = ({ x, z, s = 1 }) => (
  <group position={[x, 0, z]} scale={s}>
    <Cyl p={[0, 0.09, 0]} r={[0.022, 0.03]} h={0.18} m={M.wood} seg={10} />
    <mesh position={[0, 0.27, 0]} material={M.leaf}><icosahedronGeometry args={[0.13, 1]} /></mesh>
  </group>
);

/* generic multi-storey block: origin = centre of the base. mode "flat" = walls + windows, "glass" = curtain wall */
function Block({ w, d, floors, fh = 0.2, wall = M.wall, mode = "flat", balconies = false, position = [0, 0, 0] }) {
  const h = floors * fh;
  const nx = Math.max(2, Math.round(w / 0.26));
  const nz = Math.max(2, Math.round(d / 0.26));
  const xs = Array.from({ length: nx }, (_, c) => -w / 2 + ((c + 0.5) * w) / nx);
  const zs = Array.from({ length: nz }, (_, c) => -d / 2 + ((c + 0.5) * d) / nz);
  const fl = Array.from({ length: floors }, (_, i) => i);
  const glass = mode === "glass";

  return (
    <group position={position}>
      <Box p={[0, h / 2, 0]} s={glass ? [w * 0.985, h, d * 0.985] : [w, h, d]} m={glass ? M.glassDark : wall} />

      {fl.map((i) => <Box key={`l${i}`} p={[0, (i + 1) * fh - 0.01, 0]} s={[w + 0.03, 0.02, d + 0.03]} m={M.white} />)}

      {!glass && fl.map((i) => xs.map((x) => [1, -1].map((sg) => (
        <Box key={`f${i}-${x}-${sg}`} p={[x, i * fh + fh * 0.5, sg * (d / 2 + 0.003)]} s={[(w / nx) * 0.55, fh * 0.5, 0.01]} m={M.glassDark} />
      ))))}
      {!glass && fl.map((i) => zs.map((z) => [1, -1].map((sg) => (
        <Box key={`s${i}-${z}-${sg}`} p={[sg * (w / 2 + 0.003), i * fh + fh * 0.5, z]} s={[0.01, fh * 0.5, (d / nz) * 0.55]} m={M.glassDark} />
      ))))}

      {glass && Array.from({ length: nx + 1 }, (_, k) => [1, -1].map((sg) => (
        <Box key={`mx${k}-${sg}`} p={[-w / 2 + (k * w) / nx, h / 2, sg * (d / 2 * 0.985 + 0.004)]} s={[0.012, h, 0.012]} m={M.white} />
      )))}
      {glass && Array.from({ length: nz + 1 }, (_, k) => [1, -1].map((sg) => (
        <Box key={`mz${k}-${sg}`} p={[sg * (w / 2 * 0.985 + 0.004), h / 2, -d / 2 + (k * d) / nz]} s={[0.012, h, 0.012]} m={M.white} />
      )))}

      {balconies && fl.slice(1).map((i) => xs.filter((_, c) => c % 2 === 0).map((x) => (
        <group key={`b${i}-${x}`}>
          <Box p={[x, i * fh + 0.01, d / 2 + 0.065]} s={[(w / nx) * 1.5, 0.02, 0.13]} m={M.concrete} />
          <Box p={[x, i * fh + 0.06, d / 2 + 0.13]} s={[(w / nx) * 1.5, 0.07, 0.008]} m={M.glass} />
        </group>
      )))}
    </group>
  );
}

/* ---------- the models ---------- */
function House() {
  const roof = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.46, 0); s.lineTo(0.46, 0); s.lineTo(0, 0.36); s.closePath();
    return s;
  }, []);
  return (
    <group>
      <Lawn />
      <Block w={1.1} d={0.8} floors={2} fh={0.27} />
      <group position={[-0.61, 0.54, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh material={M.roof}><extrudeGeometry args={[roof, { depth: 1.22, bevelEnabled: false }]} /></mesh>
      </group>
      <Box p={[0.35, 0.84, -0.1]} s={[0.1, 0.3, 0.1]} m={M.brick} />
      <Box p={[0, 0.12, 0.408]} s={[0.16, 0.24, 0.012]} m={M.wood} />
      <Tree x={0.72} z={0.5} />
      <Tree x={-0.75} z={0.45} s={0.8} />
    </group>
  );
}

function Room() {
  return (
    <group>
      <Box p={[0, 0.025, 0]} s={[1.5, 0.05, 1.3]} m={M.wood2} />
      <Box p={[0, 0.475, -0.625]} s={[1.5, 0.85, 0.05]} m={M.wall} />
      <Box p={[-0.725, 0.475, 0]} s={[0.05, 0.85, 1.3]} m={M.wall} />
      {/* window */}
      <Box p={[0.3, 0.5, -0.596]} s={[0.5, 0.4, 0.008]} m={M.white} />
      <Box p={[0.3, 0.5, -0.59]} s={[0.44, 0.34, 0.012]} m={M.sky} />
      {/* bed */}
      <Box p={[0.2, 0.2, -0.58]} s={[0.7, 0.3, 0.04]} m={M.wood} />
      <Box p={[0.2, 0.1, -0.18]} s={[0.62, 0.1, 0.85]} m={M.wood} />
      <Box p={[0.2, 0.195, -0.18]} s={[0.6, 0.09, 0.83]} m={M.white} />
      <Box p={[0.2, 0.255, 0.0]} s={[0.61, 0.03, 0.5]} m={M.fabric} />
      <Box p={[0.05, 0.265, -0.5]} s={[0.2, 0.05, 0.13]} m={M.white} />
      <Box p={[0.35, 0.265, -0.5]} s={[0.2, 0.05, 0.13]} m={M.white} />
      {/* art above bed */}
      <Box p={[0.2, 0.62, -0.59]} s={[0.28, 0.2, 0.01]} m={M.dark} />
      <Box p={[0.2, 0.62, -0.583]} s={[0.24, 0.16, 0.01]} m={M.art} />
      {/* nightstand + lamp */}
      <Box p={[0.62, 0.15, -0.5]} s={[0.18, 0.2, 0.18]} m={M.wood} />
      <Cyl p={[0.62, 0.3, -0.5]} r={[0.012, 0.012]} h={0.1} m={M.steel} seg={10} />
      <Cyl p={[0.62, 0.38, -0.5]} r={[0.04, 0.065]} h={0.09} m={M.warm} />
      {/* wardrobe */}
      <Box p={[-0.575, 0.4, -0.3]} s={[0.25, 0.7, 0.45]} m={M.dark} />
      <Box p={[-0.445, 0.4, -0.3]} s={[0.006, 0.5, 0.004]} m={M.steel} />
      {/* rug + plant */}
      <Cyl p={[-0.1, 0.054, 0.35]} r={[0.38, 0.38]} h={0.008} m={M.rug} seg={48} />
      <Cyl p={[-0.55, 0.1, 0.45]} r={[0.07, 0.055]} h={0.1} m={M.concrete} seg={16} />
      <mesh position={[-0.55, 0.25, 0.45]} material={M.leaf}><icosahedronGeometry args={[0.12, 1]} /></mesh>
    </group>
  );
}

function Villa() {
  return (
    <group>
      <Lawn />
      <Box p={[-0.05, 0.14, 0]} s={[1.2, 0.28, 0.75]} m={M.wall} />
      <Box p={[-0.05, 0.14, 0.38]} s={[1.0, 0.2, 0.01]} m={M.glassDark} />
      <Box p={[0.1, 0.41, 0.02]} s={[1.25, 0.26, 0.7]} m={M.wood} />
      <Box p={[0.1, 0.41, 0.375]} s={[1.0, 0.16, 0.01]} m={M.glassDark} />
      <Box p={[0.1, 0.555, 0.02]} s={[1.35, 0.03, 0.8]} m={M.white} />
      <Box p={[0.68, 0.14, 0.33]} s={[0.03, 0.28, 0.03]} m={M.steel} />
      <Box p={[0, 0.008, 0.6]} s={[0.5, 0.01, 0.34]} m={M.concrete} />
      <Box p={[0, 0.012, 0.6]} s={[0.44, 0.012, 0.28]} m={M.water} />
      <Tree x={-0.7} z={0.4} s={0.9} />
    </group>
  );
}

function Flat() {
  return (
    <group>
      <Lawn />
      <Block w={1.3} d={0.7} floors={5} fh={0.2} wall={M.sand} balconies position={[0, 0, -0.05]} />
      <Box p={[0, 0.215, 0.37]} s={[0.4, 0.03, 0.2]} m={M.white} />
      <Box p={[0, 1.02, -0.05]} s={[1.36, 0.04, 0.76]} m={M.white} />
      <Box p={[0.35, 1.1, -0.15]} s={[0.28, 0.12, 0.22]} m={M.steel} />
      <Tree x={-0.75} z={0.5} s={0.85} />
    </group>
  );
}

function Skyscraper() {
  return (
    <group>
      <Box p={[0, 0.05, 0]} s={[1.3, 0.1, 1.3]} m={M.concrete} />
      <Block w={1.0} d={1.0} floors={6} fh={0.15} mode="glass" position={[0, 0.1, 0]} />
      <Block w={0.78} d={0.78} floors={5} fh={0.15} mode="glass" position={[0, 1.0, 0]} />
      <Block w={0.56} d={0.56} floors={4} fh={0.15} mode="glass" position={[0, 1.75, 0]} />
      <Box p={[0, 2.4, 0]} s={[0.4, 0.1, 0.4]} m={M.steel} />
      <Cyl p={[0, 2.7, 0]} r={[0.01, 0.02]} h={0.5} m={M.steel} seg={10} />
    </group>
  );
}

function Wing() {
  return (
    <group>
      <Box p={[0, 0.03, 0]} s={[1.6, 0.06, 1.3]} m={M.concrete} />
      <Block w={1.3} d={0.5} floors={6} fh={0.17} mode="glass" position={[0, 0.06, -0.35]} />
      <Block w={0.5} d={0.85} floors={4} fh={0.17} wall={M.wall} position={[0.33, 0.06, 0.1]} />
      <Box p={[-0.3, 1.14, -0.35]} s={[0.4, 0.1, 0.25]} m={M.steel} />
      <Box p={[0.33, 0.8, 0.1]} s={[0.54, 0.03, 0.89]} m={M.white} />
    </group>
  );
}

function Apartments() {
  return (
    <group>
      <Lawn />
      <Block w={0.85} d={0.65} floors={9} fh={0.19} wall={M.sand} balconies />
      <Box p={[0, 0.09, 0.33]} s={[0.8, 0.17, 0.01]} m={M.glassDark} />
      <Box p={[0, 1.73, 0]} s={[0.9, 0.04, 0.7]} m={M.white} />
      <Box p={[0.15, 1.82, -0.1]} s={[0.3, 0.14, 0.25]} m={M.steel} />
      <Tree x={-0.7} z={0.5} s={0.8} />
    </group>
  );
}

function Office() {
  return (
    <group>
      <Box p={[0, 0.05, 0]} s={[1.5, 0.1, 1.1]} m={M.concrete} />
      <Block w={1.25} d={0.8} floors={8} fh={0.16} mode="glass" position={[0, 0.1, -0.05]} />
      <Box p={[0, 0.17, 0.5]} s={[0.5, 0.14, 0.2]} m={M.glassDark} />
      <Box p={[0, 0.25, 0.5]} s={[0.56, 0.02, 0.26]} m={M.white} />
      <Box p={[-0.2, 1.46, -0.05]} s={[0.5, 0.12, 0.35]} m={M.steel} />
    </group>
  );
}

function Townhouses() {
  const rows = [[-0.45, M.brick], [0, M.sand], [0.45, M.slate]];
  return (
    <group>
      <Lawn />
      {rows.map(([x, wall]) => (
        <group key={x}>
          <Block w={0.42} d={0.7} floors={3} fh={0.25} wall={wall} position={[x, 0, 0]} />
          <Box p={[x, 0.77, 0]} s={[0.46, 0.04, 0.74]} m={M.white} />
          <Box p={[x, 0.1, 0.358]} s={[0.12, 0.2, 0.01]} m={M.wood} />
        </group>
      ))}
    </group>
  );
}

function Loft() {
  const saw = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(0.4, 0); s.lineTo(0.4, 0.18); s.closePath();
    return s;
  }, []);
  return (
    <group>
      <Lawn />
      <Block w={1.2} d={0.7} floors={3} fh={0.27} wall={M.brick} />
      {[-0.6, -0.2, 0.2].map((x) => (
        <group key={x}>
          <group position={[x, 0.81, -0.37]}>
            <mesh material={M.slate}><extrudeGeometry args={[saw, { depth: 0.74, bevelEnabled: false }]} /></mesh>
          </group>
          <Box p={[x + 0.405, 0.9, 0]} s={[0.01, 0.15, 0.66]} m={M.glass} />
        </group>
      ))}
      <Cyl p={[0.5, 1.05, -0.2]} r={[0.045, 0.055]} h={0.5} m={M.brick} />
    </group>
  );
}

function Building() {
  return (
    <group>
      <Box p={[0, 0.03, 0]} s={[1.6, 0.06, 1.1]} m={M.concrete} />
      <Block w={1.5} d={0.9} floors={3} fh={0.17} mode="glass" position={[0, 0.06, 0]} />
      <Block w={0.7} d={0.7} floors={11} fh={0.17} mode="glass" position={[0, 0.57, 0]} />
      <Box p={[0, 2.45, 0]} s={[0.74, 0.03, 0.74]} m={M.glow} />
      <Cyl p={[0, 2.75, 0]} r={[0.008, 0.016]} h={0.6} m={M.steel} seg={10} />
    </group>
  );
}

/* one model per letter of H-O-M-E-S-C-A-N-N-E-R */
const MODELS = [
  { name: "House", C: House },
  { name: "Room", C: Room, sway: true },
  { name: "Villa", C: Villa },
  { name: "Flat", C: Flat },
  { name: "Skyscraper", C: Skyscraper },
  { name: "Wing", C: Wing },
  { name: "Apartments", C: Apartments },
  { name: "Office", C: Office },
  { name: "Townhouses", C: Townhouses },
  { name: "Loft", C: Loft },
  { name: "Building", C: Building },
];
export const MODEL_NAMES = MODELS.map((m) => m.name);

/* ---------- scene plumbing ---------- */
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

function Rig() {
  const camera = useThree((s) => s.camera);
  useEffect(() => { camera.lookAt(0, LOOK_Y, 0); camera.updateProjectionMatrix(); }, [camera]);
  return null;
}

function Stage({ index, x, S }) {
  const g = useRef();
  const spin = useRef();
  const [shown, setShown] = useState(null);

  // new letter: swap the model; pop in from nothing, or from a small size if one is already showing
  useEffect(() => {
    if (index === null || !g.current) return;
    const visible = g.current.scale.x > S * 0.5;
    setShown(index);
    g.current.scale.setScalar(visible ? S * 0.6 : 0.001);
    if (!visible) g.current.position.x = x;
  }, [index, x, S]);

  useFrame((state, dt) => {
    const grp = g.current;
    if (!grp) return;
    const on = index !== null;
    const s = THREE.MathUtils.lerp(grp.scale.x, on ? S : 0.001, 1 - Math.exp(-dt * (on ? 9 : 13)));
    grp.scale.setScalar(s);
    grp.position.x = THREE.MathUtils.lerp(grp.position.x, x, 1 - Math.exp(-dt * 12));
    grp.position.y = -42 * (1 - Math.min(1, s / S));
    grp.visible = s > 0.5;

    if (spin.current && shown !== null) {
      if (MODELS[shown].sway) spin.current.rotation.y = 0.45 + Math.sin(state.clock.elapsedTime * 0.8) * 0.4;
      else spin.current.rotation.y += dt * 0.55;
    }
  });

  const Model = shown !== null ? MODELS[shown].C : null;

  return (
    <group ref={g} scale={0.001} visible={false}>
      <mesh position={[0, -0.03, 0]} material={M.plinth}><cylinderGeometry args={[1.02, 1.02, 0.06, 64]} /></mesh>
      <mesh position={[0, 0.004, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.glow}><torusGeometry args={[1.0, 0.012, 8, 96]} /></mesh>
      <group ref={spin} rotation={[0, 0.6, 0]}>{Model && <Model />}</group>
    </group>
  );
}

export default function FooterModels({ index, x, scale }) {
  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, CAM_Y, CAM_Z], zoom: 1, near: 1, far: 2000 }}
    >
      <Rig />
      <Env />
      <ambientLight intensity={0.5} />
      <directionalLight position={[250, 500, 350]} intensity={2.2} />
      <directionalLight position={[-300, 200, -100]} intensity={0.6} />
      <Stage index={index} x={x} S={scale} />
    </Canvas>
  );
}