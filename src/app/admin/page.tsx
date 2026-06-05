"use client";

import { useSession } from "next-auth/react";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Eye, 
  TrendingUp, 
  PlusCircle,
  Clock,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    posts: 0,
    views: 0,
    admins: 1,
    messages: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        if (Array.isArray(data)) {
          setStats(prev => ({ ...prev, posts: data.length }));
          setRecentPosts(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statsDisplay = [
    { name: "Total Posts", value: stats.posts, icon: <FileText className="text-blue-500" />, trend: "Live from DB" },
    { name: "Total Views", value: stats.views, icon: <Eye className="text-purple-500" />, trend: "Coming soon" },
    { name: "Active Admins", value: stats.admins, icon: <Users className="text-green-500" />, trend: "Authorized" },
    { name: "Messages", value: stats.messages, icon: <MessageSquare className="text-orange-500" />, trend: "Inbox" },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Systems Overview</h1>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs">Welcome back, {session?.user?.name || "Admin"}</p>
        </div>
        <Link 
          href="/admin/write" 
          className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
        >
          <PlusCircle size={20} /> Create New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsDisplay.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white dark:bg-dark/50 border border-border rounded-[2rem] shadow-sm group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-light dark:bg-dark rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                {stat.trend}
              </div>
            </div>
            <p className="text-secondary font-bold uppercase tracking-widest text-[10px] mb-1">{stat.name}</p>
            <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-3">
            <TrendingUp className="text-primary" /> Recent Insights
          </h2>
          <div className="bg-white dark:bg-dark/50 border border-border rounded-[2.5rem] overflow-hidden min-h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post: any, i) => (
                <div key={post._id} className="p-6 border-b border-border last:border-0 flex items-center justify-between hover:bg-light dark:hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-light dark:bg-dark rounded-2xl flex-shrink-0 overflow-hidden relative">
                      {post.image && <img src={post.image} className="object-cover w-full h-full" alt="" />}
                    </div>
                    <div>
                      <h4 className="font-black text-lg group-hover:text-primary transition-colors line-clamp-1">{post.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-secondary text-[10px] font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">{post.category}</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/admin/manage" className="p-3 bg-light dark:bg-dark rounded-xl text-secondary hover:text-primary transition-all">
                    <FileText size={20} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-secondary">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No posts yet. Time to write!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-3">
            <MessageSquare className="text-primary" /> New Messages
          </h2>
          <div className="space-y-4">
            <div className="p-10 bg-white dark:bg-dark/50 border border-border rounded-[2rem] text-center">
              <MessageSquare size={32} className="mx-auto mb-4 opacity-20" />
              <p className="text-secondary font-bold uppercase tracking-widest text-[10px]">No messages in your pulse inbox yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
