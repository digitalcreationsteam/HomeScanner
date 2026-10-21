import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PageTemplate({ title, intro, points, closing }) {
  return (
    <>
      <section className="wrap pb-16 pt-16 md:pt-24">
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="max-w-3xl font-display text-5xl leading-[1.05] tracking-tight md:text-7xl"
        >
          {title}
        </motion.h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{intro}</p>
        <Link to="/demo" className="btn btn-dark mt-9">Book a demo</Link>
      </section>

      <section className="wrap grid gap-x-12 gap-y-10 border-t border-line py-16 md:grid-cols-2">
        {points.map(([t, d]) => (
          <div key={t} className="border-b border-line pb-8">
            <h3 className="font-display text-2xl">{t}</h3>
            <p className="mt-2 max-w-sm text-muted">{d}</p>
          </div>
        ))}
      </section>

      <section className="bg-mist/60 py-20">
        <div className="wrap flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-lg font-display text-3xl md:text-4xl">{closing}</h2>
          <Link to="/demo" className="btn btn-dark">Book a demo</Link>
        </div>
      </section>
    </>
  );
}
