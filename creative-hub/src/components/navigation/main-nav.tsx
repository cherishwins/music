"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Music,
  Shield,
  Rocket,
  Palette,
  Globe,
  Zap,
  Star,
} from "lucide-react";

const navLinks = [
  {
    name: "Ecosystem",
    href: "/ecosystem",
    icon: Globe,
    description: "Explore JPanda's Network",
  },
  {
    name: "Studio",
    href: "/studio",
    icon: Music,
    description: "Create Music & Art",
  },
  {
    name: "Rug Score",
    href: "/rug-score",
    icon: Shield,
    description: "Check Token Safety",
    badge: "FREE",
  },
  {
    name: "Drops",
    href: "/drops",
    icon: Rocket,
    description: "Latest Releases",
  },
  {
    name: "Brand Kit",
    href: "/brand",
    icon: Palette,
    description: "Design Resources",
  },
];

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-xl border-b border-white/5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-tiger/30 group-hover:border-tiger/60 transition-colors">
              <Image
                src="/assets/brand/logo-primary.jpg"
                alt="White Tiger"
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-headline text-lg text-white group-hover:text-tiger transition-colors">
                JPANDA
              </span>
              <span className="block text-[10px] text-white/40 -mt-1">
                ECOSYSTEM
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <link.icon className="w-4 h-4" />
                  {link.name}
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-neon-green/20 text-neon-green rounded">
                      {link.badge}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-tiger to-neon-purple text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Zap className="w-4 h-4" />
              Launch
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden relative bg-obsidian/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tiger/20 to-neon-cyan/20 flex items-center justify-center">
                    <link.icon className="w-5 h-5 text-tiger" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{link.name}</span>
                      {link.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-neon-green/20 text-neon-green rounded">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-white/50">{link.description}</span>
                  </div>
                </Link>
              ))}

              {/* Mobile CTA */}
              <Link
                href="/create"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 mt-4 px-6 py-4 rounded-xl bg-gradient-to-r from-tiger to-neon-purple text-white font-semibold"
              >
                <Zap className="w-5 h-5" />
                Start Creating
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
