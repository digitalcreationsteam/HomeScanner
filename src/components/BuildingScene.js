import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FLOORS = 8;
const FLOOR_H = 0.62;
const BUILD_W = 2.4;
const BUILD_D = 2.0;
const SLICE = 90 / FLOORS; // progress 0–90 is spent building floors, 90–100 is roof and finish

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutBack = (t) => {
  const c1 = 1.4, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/* ---------- one floor: concrete slab + lit windows ---------- */
function Floor({ index, progressRef }) {
  const group = useRef();
  const windowMats = useRef([]);
  const start = index * SLICE;
  const baseY = index * FLOOR_H + FLOOR_H / 2;

  // window positions on front (+z) face
  const windows = useMemo(() => {
    const cols = 3;
    return Array.from({ length: cols }, (_, i) => ({
      x: (i - (cols - 1) / 2) * 0.65,
    }));
  }, []);

  useFrame(() => {
    if (!group.current) return;
    const p = progressRef.current;

    // slab drops in from above and settles with a small overshoot
    const t = clamp01((p - start) / SLICE);
    const eased = easeOutBack(t);
    group.current.position.y = baseY + (1 - eased) * 2.5;
    group.current.visible = t > 0.001;

    // windows light up in the last 40% of the floor's slice
    const lit = clamp01((p - start - SLICE * 0.6) / (SLICE * 0.4));
    windowMats.current.forEach((m) => {
      if (m) m.emissiveIntensity = lit * 1.8;
    });
  });

  return (
    <group ref={group} position={[0, baseY, 0]}>
      {/* concrete body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BUILD_W, FLOOR_H * 0.92, BUILD_D]} />
        <meshStandardMaterial color="#c9ced6" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* window band with a lit panel per window, front and back */}
      {[1, -1].map((side) =>
        windows.map((w, i) => (
          <mesh
            key={`${side}-${i}`}
            position={[w.x, 0, side * (BUILD_D / 2 + 0.01)]}
            castShadow
          >
            <boxGeometry args={[0.42, FLOOR_H * 0.55, 0.02]} />
            <meshStandardMaterial
              ref={(el) => (windowMats.current[side > 0 ? i : i + 3] = el)}
              color="#1b2a3a"
              emissive="#7dd3fc"
              emissiveIntensity={0}
              roughness={0.2}
              metalness={0.6}
            />
          </mesh>
        ))
      )}
    </group>
  );
}

/* ---------- crane that rides to the top of the building ---------- */
function Crane({ progressRef }) {
  const hook = useRef();
  const cable = useRef();
  const jib = useRef();
  const TOP = FLOORS * FLOOR_H + 0.4;

  useFrame((_, delta) => {
    const p = progressRef.current;
    const hookY = 0.4 + easeOutCubic(clamp01(p / 90)) * (TOP - 0.4);
    // retract when the build finishes
    const retract = clamp01((p - 92) / 8);

    if (hook.current) {
      hook.current.position.y = hookY;
      hook.current.scale.setScalar(1 - retract * 0.4);
    }
    if (cable.current) {
      const len = TOP + 0.6 - hookY;
      cable.current.scale.y = Math.max(len, 0.01);
      cable.current.position.y = hookY + len / 2;
    }
    if (jib.current) jib.current.rotation.y += delta * 0.25;
  });

  return (
    <group position={[2.4, 0, -1.6]}>
      {/* mast */}
      <mesh position={[0, TOP / 2, 0]} castShadow>
        <boxGeometry args={[0.12, TOP, 0.12]} />
        <meshStandardMaterial color="#f5b301" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* rotating jib */}
      <group ref={jib} position={[0, TOP, 0]}>
        <mesh position={[-1.2, 0, 0]} castShadow>
          <boxGeometry args={[2.6, 0.1, 0.1]} />
          <meshStandardMaterial color="#f5b301" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0.6, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.18, 0.18]} />
          <meshStandardMaterial color="#222" roughness={0.6} />
        </mesh>
      </group>

      {/* cable */}
      <mesh ref={cable} position={[-1.8, TOP, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* hook block */}
      <group ref={hook} position={[-1.8, 0.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.16, 0.16]} />
          <meshStandardMaterial color="#333" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------- roof cap that appears at the end ---------- */
function Roof({ progressRef }) {
  const mesh = useRef();
  const TOP = FLOORS * FLOOR_H;
  useFrame(() => {
    if (!mesh.current) return;
    const t = clamp01((progressRef.current - 90) / 8);
    mesh.current.position.y = TOP + 0.08 + (1 - easeOutBack(t)) * 1.2;
    mesh.current.scale.set(easeOutCubic(t), 1, easeOutCubic(t));
    mesh.current.visible = t > 0.001;
  });
  return (
    <mesh ref={mesh} castShadow position={[0, TOP + 0.08, 0]}>
      <boxGeometry args={[BUILD_W * 1.04, 0.16, BUILD_D * 1.04]} />
      <meshStandardMaterial color="#38bdf8" roughness={0.4} metalness={0.3} />
    </mesh>
  );
}

/* ---------- scene root ---------- */
function Scene({ progressRef }) {
  const root = useRef();
  useFrame((_, delta) => {
    // slow turntable so the building always feels alive
    if (root.current) root.current.rotation.y += delta * 0.12;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#e0f2fe", "#0b1020", 0.6]} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={6}
        shadow-camera-bottom={-2}
      />

      {/* ground with a soft shadow catcher */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <shadowMaterial opacity={0.35} />
      </mesh>

      <group ref={root} position={[-0.6, 0, 0]}>
        {Array.from({ length: FLOORS }).map((_, i) => (
          <Floor key={i} index={i} progressRef={progressRef} />
        ))}
        <Roof progressRef={progressRef} />
        <Crane progressRef={progressRef} />
      </group>
    </>
  );
}

export default function BuildingScene({ progressRef }) {
  return (
    <Canvas
      shadows
      camera={{ position: [7, 4.5, 8], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <Scene progressRef={progressRef} />
    </Canvas>
  );
}