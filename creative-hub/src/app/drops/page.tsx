"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MainNav } from "@/components/navigation/main-nav";
import {
  Play,
  Pause,
  Download,
  Share2,
  Heart,
  Clock,
  TrendingUp,
  Flame,
  Sparkles,
  Music,
  Zap,
  ArrowRight,
  Filter,
  ExternalLink,
} from "lucide-react";

// Sample drops data - would come from database in production
const featuredDrops = [
  {
    id: "1",
    title: "MOON MISSION",
    artist: "DegenDAO",
    coverUrl: "/assets/brand/logo-primary.jpg",
    plays: "12.4K",
    likes: 847,
    duration: "2:34",
    genre: "Trap",
    trending: true,
    new: true,
  },
  {
    id: "2",
    title: "DIAMOND HANDS",
    artist: "CryptoKing",
    coverUrl: "/assets/brand/logo-dj-vinyl.jpg",
    plays: "8.2K",
    likes: 523,
    duration: "3:12",
    genre: "Drill",
    trending: true,
    new: false,
  },
  {
    id: "3",
    title: "WAGMI ANTHEM",
    artist: "PepeHolder",
    coverUrl: "/assets/brand/logo-city.jpg",
    plays: "5.1K",
    likes: 312,
    duration: "2:48",
    genre: "Phonk",
    trending: false,
    new: true,
  },
];

const recentDrops = [
  {
    id: "4",
    title: "TO THE MARS",
    artist: "ShibArmy",
    coverUrl: "/assets/brand/logo-aggressive.jpg",
    plays: "3.2K",
    likes: 189,
    duration: "2:21",
    genre: "Hype",
  },
  {
    id: "5",
    title: "PUMP IT UP",
    artist: "MemeSquad",
    coverUrl: "/assets/brand/logo-friendly.jpg",
    plays: "2.8K",
    likes: 156,
    duration: "2:56",
    genre: "R&B",
  },
  {
    id: "6",
    title: "RUGGED",
    artist: "SadDegen",
    coverUrl: "/assets/brand/logo-primary.jpg",
    plays: "4.5K",
    likes: 278,
    duration: "3:05",
    genre: "Lo-Fi",
  },
  {
    id: "7",
    title: "100X VISION",
    artist: "AlphaHunter",
    coverUrl: "/assets/brand/logo-dj-vinyl.jpg",
    plays: "1.9K",
    likes: 98,
    duration: "2:33",
    genre: "Trap",
  },
  {
    id: "8",
    title: "WHALE ALERT",
    artist: "BigBags",
    coverUrl: "/assets/brand/logo-city.jpg",
    plays: "6.7K",
    likes: 445,
    duration: "2:44",
    genre: "Drill",
  },
];

const genres = ["All", "Trap", "Drill", "Phonk", "R&B", "Lo-Fi", "Hype"];

type Track = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  plays: string;
  likes: number;
  duration: string;
  genre: string;
  trending?: boolean;
  new?: boolean;
};

function TrackCard({
  track,
  featured = false,
}: {
  track: Track;
  featured?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group relative rounded-2xl glass hover:glass-tiger transition-all ${
        featured ? "p-4" : "p-3"
      }`}
    >
      {/* Badges */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {track.trending && (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-tiger/20 text-tiger rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3" />
            HOT
          </span>
        )}
        {track.new && (
          <span className="px-2 py-0.5 text-[10px] font-bold bg-neon-green/20 text-neon-green rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            NEW
          </span>
        )}
      </div>

      {/* Cover Art */}
      <div
        className={`relative ${featured ? "aspect-square" : "aspect-square"} rounded-xl overflow-hidden mb-3`}
      >
        <Image
          src={track.coverUrl}
          alt={track.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full bg-tiger flex items-center justify-center hover:scale-110 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Track Info */}
      <div className="space-y-2">
        <div>
          <h3
            className={`font-semibold text-white truncate ${featured ? "text-lg" : "text-sm"}`}
          >
            {track.title}
          </h3>
          <p className="text-white/60 text-sm truncate">{track.artist}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {track.plays}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {track.duration}
            </span>
          </div>
          <span className="px-2 py-0.5 bg-white/5 rounded text-[10px]">
            {track.genre}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-1 text-xs ${isLiked ? "text-neon-pink" : "text-white/40 hover:text-white"} transition-colors`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {track.likes}
          </button>
          <button className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="ml-auto p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function DropsPage() {
  const [selectedGenre, setSelectedGenre] = useState("All");

  return (
    <main className="min-h-screen bg-obsidian">
      <MainNav />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/assets/brand/banners/white-tiger-party.png"
            alt="Latest Drops"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian/70 to-obsidian" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiger/10 border border-tiger/20 mb-6"
          >
            <TrendingUp className="w-4 h-4 text-tiger" />
            <span className="text-sm text-tiger font-medium">
              Fresh Hits Daily
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-headline mb-6"
          >
            <span className="text-white">LATEST</span>
            <br />
            <span className="gradient-text-cyberpunk">DROPS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-8"
          >
            The freshest tracks from the degen music scene.
            <br />
            <span className="text-tiger">
              All AI-generated. All certified bangers.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/create"
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-tiger to-neon-purple text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <Music className="w-5 h-5" />
              Create Your Own
            </Link>
            <button className="flex items-center gap-2 px-8 py-4 rounded-xl glass border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">
              <Play className="w-5 h-5" />
              Shuffle Play
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-headline mb-2">
                <span className="text-tiger">Featured</span> Drops
              </h2>
              <p className="text-white/60">Trending in the ecosystem</p>
            </div>
            <Link
              href="#all"
              className="flex items-center gap-1 text-tiger hover:text-tiger/80 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredDrops.map((track) => (
              <TrackCard key={track.id} track={track} featured />
            ))}
          </div>
        </div>
      </section>

      {/* All Drops Section */}
      <section id="all" className="py-12 px-6 bg-gradient-to-b from-obsidian to-crucible">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-headline mb-2">
                All <span className="text-tiger">Tracks</span>
              </h2>
              <p className="text-white/60">Browse the complete catalog</p>
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedGenre === genre
                      ? "bg-tiger text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...featuredDrops, ...recentDrops].map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button className="px-8 py-3 rounded-xl glass border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
              Load More Tracks
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Tracks Created" },
              { value: "50K+", label: "Total Plays" },
              { value: "2.5K+", label: "Downloads" },
              { value: "8", label: "Voice Styles" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl glass"
              >
                <div className="text-2xl md:text-3xl font-bold text-tiger mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl glass-tiger"
          >
            <Music className="w-16 h-16 text-tiger mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              Ready to Drop Your <span className="gradient-text-cyberpunk">Anthem</span>?
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Join the movement. Create your token&apos;s signature sound and share it with
              the world.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-tiger to-neon-pink text-white text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Zap className="w-6 h-6" />
              Start Creating
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
