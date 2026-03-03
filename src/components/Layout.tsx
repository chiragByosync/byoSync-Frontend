import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  UserPlus,
  Search,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { NavLink } from './NavLink';

const LOGO_SRC = '/assets/20250725_0419_BS_Logo_Design_remix_01k10ahmxhec68r0m1x62nsb3e-removebg-preview.png';

export function Layout() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Floating blurred circles — subtle ambient background */}
      <div className="floating-blur floating-blur-1" aria-hidden />
      <div className="floating-blur floating-blur-2" aria-hidden />
      <div className="floating-blur floating-blur-3" aria-hidden />

      <header
        className={`sticky top-0 z-50 border-b border-[var(--byosync-gray-200)]/80 bg-white/75 shadow-[var(--shadow-header)] backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? 'shadow-[var(--shadow-header-scrolled)]' : ''
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl py-1.5 pr-2 transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
          >
            <img
              src={LOGO_SRC}
              alt="ByoSync"
              className="h-9 w-auto object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-[var(--byosync-gray-900)]">
              ByoSync
            </span>
          </Link>
          <nav className="flex items-center gap-0.5">
            <NavLink to="/" icon={Home}>Home</NavLink>
            <NavLink to="/identity/create" icon={UserPlus}>Create Identity</NavLink>
            <NavLink to="/identity/lookup" icon={Search}>Look up</NavLink>
            <NavLink to="/auth/challenge" icon={ShieldCheck}>Challenge</NavLink>
            <NavLink to="/auth/jwks" icon={Key}>JWKS</NavLink>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-7xl page-in"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-[var(--byosync-gray-200)]/80 bg-white/60 py-6 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm font-medium text-[var(--byosync-gray-500)]">
          ByoSync — Zero-Biometrics Identity Platform
        </div>
      </footer>
    </div>
  );
}
