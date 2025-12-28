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
    title: "The Philosopher's Portfolio",
    description: "Transform base assets into golden opportunities",
    thumbnail: "/slides/eigen-contract.jpg",
    category: "Arcane Slides",
  },
  {
    id: 2,
    type: "slide",
    title: "Transmutation Economics",
    description: "The ancient art of value transformation applied to modern markets",
    thumbnail: "/slides/vermeer-multiverse.jpg",
    category: "Arcane Slides",
  },
  {
    id: 3,
    type: "slide",
    title: "Elemental Balance",
    description: "Portfolio dynamics at the edge of transformation",
    thumbnail: "/slides/cosmic-orbit.jpg",
    category: "Arcane Slides",
  },
  {
    id: 4,
    type: "slide",
    title: "Sanctuary Points",
    description: "Strategic positions where pressure equals release",
    thumbnail: "/slides/lagrange-points.jpg",
    category: "Arcane Slides",
  },
  {
    id: 5,
    type: "music",
    title: "Thread to Hit Demo",
    description: "AI-transmuted song from community discussion threads",
    thumbnail: "/music/thread-to-hit.jpg",
    category: "Music",
  },
  {
    id: 6,
    type: "video",
    title: "The Alchemist's Journey",
    description: "Visual exploration of transformation principles",
    thumbnail: "/videos/passport-guide.jpg",
    category: "Video",
  },
];

const categories = ["All", "Arcane Slides", "Music", "Video", "PDF"];

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
          <h2 className="text-4xl md:text-5xl font-headline mb-4">
            The <span className="gradient-text-gold">Gallery</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Explore our collection of transmuted works spanning
            multiple forms and media.
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
                  ? "bg-gradient-to-r from-gold-muted to-gold text-obsidian"
                  : "glass-gold hover:bg-gold/10"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Main display */}
          <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden glass-gold">
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
                  <div className="absolute inset-0 bg-gradient-to-br from-crucible via-obsidian to-black" />

                  {/* Content overlay */}
                  <div className="absolute inset-0 flex items-end p-8">
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-medium mb-3">
                        {filteredItems[currentIndex].category}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-headline mb-2">
                        {filteredItems[currentIndex].title}
                      </h3>
                      <p className="text-white/60 max-w-md">
                        {filteredItems[currentIndex].description}
                      </p>
                    </div>

                    {/* Action button */}
                    <button className="btn-transmute flex items-center gap-2">
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
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full glass-gold flex items-center justify-center hover:bg-gold/10 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full glass-gold flex items-center justify-center hover:bg-gold/10 transition-colors"
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
                    ? "w-8 bg-gold"
                    : "bg-gold/20 hover:bg-gold/40"
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
              className={`aspect-video rounded-lg overflow-hidden glass-gold transition-all ${
                index === currentIndex
                  ? "ring-2 ring-gold scale-105"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <div className="w-full h-full bg-gradient-to-br from-crucible to-obsidian flex items-center justify-center">
                <span className="text-xs text-white/60">{item.title}</span>
              </div>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
