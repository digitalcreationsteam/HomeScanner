import { useState, useRef, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const field = "w-full rounded-xl border border-line bg-white/70 backdrop-blur-md px-4 py-3 text-sm outline-none transition-colors focus:border-[#4F7DAD] focus:bg-white";

const PROJECT_SIZES = [
  "Up to 50 units", "51–100 units", "101–300 units", "301–500 units", "500+ units",
];

const initialData = {
  name: "", company: "", designation: "Builder", phone: "", email: "", projectSize: "Up to 50 units", notes: "",
};

// --- 3D CRYSTAL COMPONENT ---
function Crystal() {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Slow rotation for the main crystal
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
    }
    // Fast rotation for the outer ring
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4;
      ringRef.current.rotation.x = Math.PI / 2.5 + Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <group>
      {/* Main Glass Crystal */}
      <mesh ref={meshRef} castShadow>
        <icosahedronGeometry args={[1.2, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={0.5}
          chromaticAberration={0.05}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.3}
          temporalDistortion={0.1}
          color="#ffffff"
          roughness={0.1}
          transmission={1}
          ior={1.5}
        />
      </mesh>

      {/* Orbiting Blueprint Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2, 0.02, 16, 100]} />
        <meshBasicMaterial color="#4F7DAD" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// --- 3D SCENE WRAPPER ---
function Scene3D() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full pointer-events-none lg:pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
            <Crystal />
          </Float>
          
          {/* Lighting and Environment */}
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Environment preset="city" />
          
          {/* Soft shadow on the floor */}
          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#4F7DAD" />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function Demo() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(initialData);

  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Update this URL to your actual backend URL when deploying
      const res = await fetch("https://api.spacexstudio.com/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-paper">
      
      {/* Background Blueprint Grid */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#4F7DAD 1px, transparent 1px), linear-gradient(90deg, #4F7DAD 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* 3D Canvas Background */}
      <Scene3D />

      {/* Main Content Layout */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-12 lg:flex-row lg:items-stretch lg:justify-between lg:py-0">
        
        {/* Left Side: Text & Form */}
        <div className="flex w-full flex-col justify-center lg:w-[45%] lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block rounded-full border border-[#4F7DAD]/30 bg-white/50 px-4 py-1.5 text-xs font-medium text-[#4F7DAD] backdrop-blur-md">
              Book a Demo
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              See SpaceScanner <br className="hidden lg:block"/>
              <span className="text-[#4F7DAD]">in action.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-muted">
              Tell us a little about your projects and we'll show you a live handover demonstration.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10 w-full max-w-lg rounded-[2rem] border border-white/40 bg-white/60 p-6 shadow-[0_20px_60px_-20px_rgba(28,44,53,0.15)] backdrop-blur-xl sm:p-8"
          >
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-[#4F7DAD]/10 text-[#4F7DAD]">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-2xl font-medium text-ink">Request Sent!</h3>
                  <p className="mt-2 text-sm text-muted">
                    We'll email <strong className="text-ink">{data.email}</strong> within one working day to schedule your demo.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-medium text-ink">
                      Full name *
                      <input required className={`${field} mt-1.5`} value={data.name} onChange={set("name")} placeholder="John Doe" />
                    </label>
                    <label className="text-xs font-medium text-ink">
                      Company / Org *
                      <input required className={`${field} mt-1.5`} value={data.company} onChange={set("company")} placeholder="Acme Corp" />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-medium text-ink">
                      Designation
                      <select className={`${field} mt-1.5`} value={data.designation} onChange={set("designation")}>
                        <option>Builder</option>
                        <option>Developer</option>
                      </select>
                    </label>
                    <label className="text-xs font-medium text-ink">
                      Phone number *
                      <input
                        required
                        type="tel"
                        pattern="[+0-9()\-\s]{7,20}"
                        className={`${field} mt-1.5`}
                        value={data.phone}
                        onChange={set("phone")}
                        placeholder="+1 (555) 000-0000"
                      />
                    </label>
                  </div>

                  <label className="text-xs font-medium text-ink">
                    Business email *
                    <input
                      required
                      type="email"
                      className={`${field} mt-1.5`}
                      value={data.email}
                      onChange={set("email")}
                      placeholder="john@company.com"
                    />
                  </label>

                  <label className="text-xs font-medium text-ink">
                    Approximate project size
                    <select className={`${field} mt-1.5`} value={data.projectSize} onChange={set("projectSize")}>
                      {PROJECT_SIZES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs font-medium text-ink">
                    Anything else? (Optional)
                    <textarea
                      rows={3}
                      className={`${field} mt-1.5 resize-none`}
                      value={data.notes}
                      onChange={set("notes")}
                      placeholder="Tell us about your specific needs..."
                    />
                  </label>

                  {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                  <button 
                    className="mt-2 flex w-full items-center justify-center rounded-xl bg-ink py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit demo request"
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Side: Empty Space for 3D Canvas (Hidden on Mobile) */}
        <div className="hidden lg:block lg:w-[45%]" />

      </div>
    </div>
  );
}