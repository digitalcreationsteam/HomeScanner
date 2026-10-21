import { motion } from "framer-motion";
import Icon from "../components/Icon";
import { badges } from "../data";

export default function About() {
  return (
    <section className="wrap py-20 md:py-28">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <h1 className="max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
          The digital passport <span className="text-accent">of your home.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          HomeScanner creates a permanent digital record of your property — materials, appliances, warranties, installations and maintenance information, all in one place.
        </p>
      </motion.div>
      <div id="security" className="mt-16 grid gap-8 border-t border-line pt-10 sm:grid-cols-3">
        {badges.map(([icon, t, d]) => (
          <div key={t} className="flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-mist text-deep"><Icon name={icon} /></span>
            <div>
              <p className="font-medium">{t}</p>
              <p className="text-sm text-muted">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}