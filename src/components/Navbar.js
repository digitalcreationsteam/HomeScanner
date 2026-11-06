import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Magnetic from "./Magnetic";

// 👇 UPDATE THIS PATH TO YOUR ACTUAL LOGO
import LogoImage from "../assets/final.png"; 

const links = [
  ["Product", "/"],
  ["For Builders", "/#builders"],
  ["For Homeowners", "/#homeowners"],
  ["How It Works", "/#how"],
  ["About", "/about"],
  ["Terms & Conditions", "/terms"],
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const close = () => setMobileOpen(false);

  useEffect(() => { 
    setMobileOpen(false); 
  }, [location.pathname, location.hash]);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur">
      <div className="wrap flex h-20 items-center justify-between">
        
        {/* Logo */}
        <Link to="/" onClick={close} className="flex items-center gap-3 shrink-0 group">
          <img src={LogoImage} alt="Logo" className="h-9 w-9 rounded-xl object-cover" />
          <span className="leading-tight">
            <span className="block text-lg font-medium tracking-tight">SpaceScanner</span>
            <span className="hidden text-[10px] text-muted sm:block">The digital passport of your home.</span>
          </span>
        </Link>

        {/* Desktop Links (Hidden on Mobile) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {links.map(([label, to]) => (
            <Link key={label} to={to} className="text-sm font-medium text-muted hover:text-[#4F7DAD] transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Side (Demo Button + Mobile Toggle) */}
        <div className="flex items-center gap-3">
          <Link to="/demo" className="hidden sm:inline-flex btn btn-accent !py-2.5">Book a Demo</Link>
          
          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex flex-col justify-center items-center w-11 h-11 rounded-full border border-line bg-white shadow-sm"
            aria-label="Toggle menu"
          >
            <span className={`block h-[1.5px] w-5 bg-ink transition-transform ${mobileOpen ? 'rotate-45 translate-y-[2px]' : '-translate-y-1'}`} />
            <span className={`block h-[1.5px] w-5 bg-ink transition-transform ${mobileOpen ? '-rotate-45 -translate-y-[2px]' : 'translate-y-1'}`} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden bg-white border-t border-line"
          >
            <nav className="flex flex-col px-6 py-4 space-y-4">
              {links.map(([label, to]) => (
                <Link
                  key={label}
                  to={to}
                  onClick={close}
                  className="text-lg font-medium text-ink hover:text-[#4F7DAD]"
                >
                  {label}
                </Link>
              ))}
              <div className="pt-4 border-t border-line sm:hidden">
                <Link to="/demo" onClick={close} className="btn btn-accent w-full text-center !py-3">
                  Book a Demo
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}