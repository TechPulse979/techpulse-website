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
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    activeAdmins: 1,
    totalMessages: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [postsRes, statsRes, messagesRes] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/admin/stats"),
          fetch("/api/messages")
        ]);
        const postsData = await postsRes.json();
        const statsData = await statsRes.json();
        const messagesData = await messagesRes.json();

        if (Array.isArray(postsData)) {
          setRecentPosts(postsData.slice(0, 3));
        }
        if (statsData && !statsData.error) {
          setStats(statsData);
        }
        if (Array.isArray(messagesData)) {
          setRecentMessages(messagesData);
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
    { name: "Total Insights", value: stats.totalPosts, icon: <FileText className="text-blue-500" />, trend: `${stats.publishedPosts} live` },
    { name: "Draft Stories", value: stats.draftPosts, icon: <Clock className="text-purple-500" />, trend: "In progress" },
    { name: "Core Administrators", value: stats.activeAdmins, icon: <Users className="text-green-500" />, trend: "Active team" },
    { name: "Inbox Messages", value: stats.unreadMessages, icon: <MessageSquare className="text-orange-500" />, trend: `${stats.totalMessages} total` },
  ];

  const unreadMessagesList = recentMessages.filter(msg => !msg.read).slice(0, 3);

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
                  <Link href={`/admin/write?edit=${post._id}`} className="p-3 bg-light dark:bg-dark rounded-xl text-secondary hover:text-primary transition-all">
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
            {loading ? (
              <div className="flex justify-center p-8 bg-white dark:bg-dark/50 border border-border rounded-[2rem]">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : unreadMessagesList.length > 0 ? (
              unreadMessagesList.map((msg: any) => (
                <div key={msg._id} className="p-6 bg-white dark:bg-dark/50 border border-border rounded-3xl hover:border-primary/30 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs uppercase tracking-tight truncate max-w-[120px]">{msg.name}</span>
                      <span className="text-[8px] font-bold text-secondary uppercase tracking-widest">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-extrabold text-sm mb-1 text-primary line-clamp-1">{msg.subject}</h4>
                    <p className="text-secondary text-xs line-clamp-2 leading-relaxed">{msg.message}</p>
                  </div>
                  <Link href="/admin/messages" className="mt-4 text-[9px] font-black uppercase tracking-widest text-primary hover:underline self-start">
                    Go to Inbox &rarr;
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-10 bg-white dark:bg-dark/50 border border-border rounded-[2rem] text-center">
                <MessageSquare size={32} className="mx-auto mb-4 opacity-20" />
                <p className="text-secondary font-bold uppercase tracking-widest text-[10px]">No new unread messages in your pulse inbox.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
