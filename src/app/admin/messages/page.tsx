"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Mail, 
  Clock, 
  Trash2, 
  CheckCircle2,
  Reply,
  Search,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("Unread");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "PATCH" });
      if (res.ok) {
        setMessages(messages.map((m: any) => m._id === id ? { ...m, read: true } : m));
      }
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages(messages.filter((m: any) => m._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete message");
    }
  };

  const filteredMessages = messages.filter((msg: any) => {
    if (activeTab === "Unread") return !msg.read;
    if (activeTab === "Archived") return msg.read;
    return true; // All
  });

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Inbox</h1>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-[10px]">Reader feedback and inquiries</p>
        </div>
        <div className="flex bg-white dark:bg-dark p-1.5 rounded-2xl border border-border">
          {["Unread", "All", "Archived"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                activeTab === tab ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-secondary hover:text-dark dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-20 text-secondary font-bold uppercase tracking-widest">
          No {activeTab.toLowerCase()} messages found.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMessages.map((msg: any, i) => (
            <motion.div 
              key={msg._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-[2.5rem] border transition-all ${
                !msg.read 
                  ? "bg-primary/[0.03] border-primary/20 shadow-sm" 
                  : "bg-white dark:bg-dark/50 border-border"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black uppercase ${
                    !msg.read ? "bg-primary text-white" : "bg-light dark:bg-dark text-secondary"
                  }`}>
                    {msg.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight uppercase">{msg.name}</h3>
                    <p className="text-secondary text-[10px] font-bold uppercase tracking-widest">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-secondary text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Clock size={14} /> {new Date(msg.createdAt).toLocaleDateString()}</span>
                  {!msg.read && <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-black text-sm uppercase mb-2">Subject: {msg.subject}</h4>
                <p className="text-secondary font-medium leading-relaxed italic">
                  "{msg.message}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-border">
                <a
                  href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}&body=${encodeURIComponent(`Hi ${msg.name},\n\n\n\n———\nIn reply to your message:\n"${msg.message}"`)}`}
                  onClick={() => !msg.read && handleMarkRead(msg._id)}
                  className="flex items-center gap-2 px-6 py-3 bg-dark dark:bg-white text-white dark:text-dark rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                >
                  <Reply size={14} /> Reply
                </a>
                {!msg.read && (
                  <button onClick={() => handleMarkRead(msg._id)} className="p-3 text-secondary hover:text-green-500 transition-colors">
                    <CheckCircle2 size={20} />
                  </button>
                )}
                <button onClick={() => handleDelete(msg._id)} className="p-3 text-secondary hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
