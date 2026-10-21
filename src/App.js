import { useState, useCallback, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Demo from "./pages/Demo";
import Preloader from "./components/Preloader";
import SmoothScroll, { SECTIONS } from "./components/SmoothScroll";
import Cursor from "./components/Cursor";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const reveal = useCallback(() => setReady(true), []);

  // old links like /#homeowners -> /homeowners
  useEffect(() => {
    const id = location.hash.slice(1);
    if (SECTIONS.includes(id)) navigate(`/${id}`, { replace: true });
  }, [location.hash, navigate]);

  // "/", "/records", "/homeowners"... are all the Home page, so they share one key and don't remount
  const section = location.pathname.slice(1);
  const pageKey = location.pathname === "/" || SECTIONS.includes(section) ? "home" : location.pathname;

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
              key={pageKey}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Routes location={location}>
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