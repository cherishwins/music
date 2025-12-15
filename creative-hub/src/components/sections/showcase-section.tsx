"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";
import Image from "next/image";

// Example content items - in production, these would come from your API/CMS
const showcaseItems = [
  {
    id: 1,
    type: "slide",
    title: "The Eigen-Contract Strategy",
    description: "Quantum Asset Protection explained through physics metaphors",
    thumbnail: "/slides/eigen-contract.jpg",
    category: "Slide Deck",
  },
  {
    id: 2,
    type: "slide",
    title: "Vermeer's Multiverse Jackpot",
    description: "Non-orientable financial surfaces and infinite money pitchers",
    thumbnail: "/slides/vermeer-multiverse.jpg",
    category: "Slide Deck",
  },
  {
    id: 3,
    type: "slide",
    title: "Sustainable Cosmic Orbit",
    description: "Portfolio dynamics at the Hawking Radiation Threshold",
    thumbnail: "/slides/cosmic-orbit.jpg",
    category: "Slide Deck",
  },
  {
    id: 4,
    type: "slide",
    title: "Lagrange Points of Residency",
    description: "Where tax gravity equals zero - Monaco, Singapore, and beyond",
    thumbnail: "/slides/lagrange-points.jpg",
    category: "Slide Deck",
  },
  {
    id: 5,
    type: "music",
    title: "Thread to Hit Demo",
    description: "AI-generated song from a community discussion thread",
    thumbnail: "/music/thread-to-hit.jpg",
    category: "Music",
  },
  {
    id: 6,
    type: "video",
    title: "Multiverse Passport Guide",
    description: "Visual journey through timeline optimization strategies",
    thumbnail: "/videos/passport-guide.jpg",
    category: "Video",
  },
];

const categories = ["All", "Slide Deck", "Music", "Video", "PDF"];

export function ShowcaseSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredItems =
    activeCategory === "All"
      ? showcaseItems
      : showcaseItems.filter((item) => item.category === activeCategory);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + filteredItems.length) % filteredItems.length
    );
  };

  return (
    <section className="py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display mb-4">
            Creative <span className="gradient-text">Showcase</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Explore our collection of quantum-inspired creative works spanning
            multiple dimensions and media types.
          </p>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setCurrentIndex(0);
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-gradient-to-r from-gold-400 to-gold-600 text-black"
                  : "glass hover:bg-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Main display */}
          <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden glass">
            <AnimatePresence mode="wait">
              {filteredItems[currentIndex] && (
                <motion.div
                  key={filteredItems[currentIndex].id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {/* Placeholder gradient - replace with actual images */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cosmic-800 via-cosmic-900 to-black" />

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex items-end p-8">
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-xs font-medium mb-3">
                        {filteredItems[currentIndex].category}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-display mb-2">
                        {filteredItems[currentIndex].title}
                      </h3>
                      <p className="text-white/60 max-w-md">
                        {filteredItems[currentIndex].description}
                      </p>
                    </div>

                    {/* Action button */}
                    <button className="btn-primary flex items-center gap-2">
                      {filteredItems[currentIndex].type === "video" ||
                      filteredItems[currentIndex].type === "music" ? (
                        <>
                          <Play className="w-5 h-5" />
                          Play
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-5 h-5" />
                          View
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {filteredItems.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {filteredItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-gold-400"
                    : "bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {filteredItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`aspect-video rounded-lg overflow-hidden glass transition-all ${
                index === currentIndex
                  ? "ring-2 ring-gold-400 scale-105"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <div className="w-full h-full bg-gradient-to-br from-cosmic-700 to-cosmic-900 flex items-center justify-center">
                <span className="text-xs text-white/60">{item.title}</span>
              </div>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
