import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const field = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent";

export default function Demo() {
  const [sent, setSent] = useState(false);
  const [data, setData] = useState({ name: "", company: "", email: "" });
  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    // TODO: send `data` to your API
    setSent(true);
  };

  return (
    <section className="wrap max-w-xl py-20">
      <h1 className="text-5xl font-medium tracking-tight">Book a Builder Demo</h1>
      <p className="mt-4 text-muted">Tell us a little about your projects and we'll show you a live handover.</p>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl bg-mist p-6">
            <p className="text-xl font-medium">Request sent</p>
            <p className="mt-1 text-sm text-muted">We'll email {data.email} within one working day.</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} exit={{ opacity: 0 }} className="mt-10 flex flex-col gap-4">
            <label className="text-sm">Your name
              <input required className={`${field} mt-1.5`} value={data.name} onChange={set("name")} />
            </label>
            <label className="text-sm">Company
              <input required className={`${field} mt-1.5`} value={data.company} onChange={set("company")} />
            </label>
            <label className="text-sm">Work email
              <input required type="email" className={`${field} mt-1.5`} value={data.email} onChange={set("email")} />
            </label>
            <button className="btn btn-dark mt-2" type="submit">Request demo</button>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}