"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Music,
  FileText,
  Video,
  Image as ImageIcon,
  Plus,
  Settings,
  BarChart3,
  Share2,
  Sparkles,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { TonConnectButton } from "@tonconnect/ui-react";

// Dashboard stats
const stats = [
  { label: "Credits", value: "847", icon: Sparkles, change: "+12%" },
  { label: "Content Created", value: "24", icon: FileText, change: "+5" },
  { label: "Total Views", value: "12.4K", icon: TrendingUp, change: "+23%" },
  { label: "Followers", value: "1.2K", icon: Users, change: "+8%" },
];

// Recent content items
const recentContent = [
  {
    id: 1,
    title: "Quantum Finance Deck",
    type: "slide",
    status: "published",
    views: 234,
    createdAt: "2 hours ago",
  },
  {
    id: 2,
    title: "Multiverse Passport Guide",
    type: "video",
    status: "processing",
    views: 0,
    createdAt: "5 hours ago",
  },
  {
    id: 3,
    title: "Thread Remix #47",
    type: "music",
    status: "published",
    views: 1203,
    createdAt: "1 day ago",
  },
  {
    id: 4,
    title: "Eigen-Contract Strategy",
    type: "slide",
    status: "draft",
    views: 0,
    createdAt: "2 days ago",
  },
];

// Content type icons
const typeIcons = {
  slide: FileText,
  music: Music,
  video: Video,
  image: ImageIcon,
};

// Status colors
const statusColors = {
  published: "bg-green-500/20 text-green-400",
  processing: "bg-yellow-500/20 text-yellow-400",
  draft: "bg-white/10 text-white/60",
};

export default function DashboardPage() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "content", label: "My Content", icon: FileText },
    { id: "create", label: "Create", icon: Plus },
    { id: "distribute", label: "Distribute", icon: Share2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display gradient-text">Creative Hub</h1>
            <span className="text-white/40">/</span>
            <span className="text-white/60">Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Credits display */}
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-lg">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="font-semibold">{user?.credits || 0}</span>
              <span className="text-white/40">credits</span>
            </div>

            {/* TON Connect */}
            <TonConnectButton />

            {/* User avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <span className="font-semibold text-black">
                {user?.firstName?.charAt(0) || "U"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-gold-400 to-gold-600 text-black"
                  : "glass hover:bg-white/10"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 glass rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-gold-400" />
                </div>
                <span className="text-green-400 text-sm">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Content */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Content</h2>
                <button className="text-gold-400 text-sm hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentContent.map((item, index) => {
                  const Icon = typeIcons[item.type as keyof typeof typeIcons];
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-lg bg-cosmic-800 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-cosmic-400" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{item.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                          <span className="capitalize">{item.type}</span>
                          <span>-</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.createdAt}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${statusColors[item.status as keyof typeof statusColors]}`}
                        >
                          {item.status}
                        </span>
                        {item.views > 0 && (
                          <div className="text-white/40 text-sm mt-1">
                            {item.views} views
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Create New */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Create New</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Music, label: "Music", color: "from-purple-500 to-pink-500" },
                  { icon: FileText, label: "Slides", color: "from-blue-500 to-cyan-500" },
                  { icon: Video, label: "Video", color: "from-green-500 to-emerald-500" },
                  { icon: ImageIcon, label: "Image", color: "from-orange-500 to-red-500" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Distribute */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Distribute</h2>
              <p className="text-white/60 text-sm mb-4">
                Push your content to social media platforms instantly.
              </p>
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Open Distribution
              </button>
            </div>

            {/* Upgrade CTA */}
            <div className="glass-gold rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-2">Need More Credits?</h2>
              <p className="text-white/60 text-sm mb-4">
                Upgrade your plan for unlimited creative power.
              </p>
              <button className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-semibold rounded-lg hover:from-gold-300 hover:to-gold-500 transition-all">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
