import { useState, useCallback, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Demo from "./pages/Demo";
import Preloader from "./components/Preloader";
import SmoothScroll from "./components/SmoothScroll";
import Cursor from "./components/Cursor";
export default function App() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const reveal = useCallback(() => setReady(true), []);
  useEffect(() => {
    if (!location.hash) { window.scrollTo(0, 0); return; }
    // wait for the page transition so the target section exists
    const id = setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 320);
    return () => clearTimeout(id);
  }, [location.key, location.hash]);

  return (
    <>
    <Preloader onReveal={reveal} />
    <SmoothScroll />
<Cursor />
    {ready && (
      <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
      </>
      )}
    </>
  );
}