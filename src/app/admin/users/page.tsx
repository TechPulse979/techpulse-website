"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  KeyRound
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CreatedUser = { name: string; email: string; password: string; role: string };

export default function UserManagementPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Editor' });
  const [adding, setAdding] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Copy failed");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        // Capture credentials BEFORE clearing the form — the password is hashed
        // on the server and can never be retrieved again after this point.
        setCreatedUser({ ...formData });
        setFormData({ name: '', email: '', password: '', role: 'Editor' });
        setShowAddForm(false);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add user");
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to revoke access?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter((u: any) => u._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete user");
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password: pass });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Core Team</h1>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-[10px]">Manage administrative access</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-3 bg-white dark:bg-dark border border-border text-dark dark:text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-light dark:hover:bg-white/5 transition-all shadow-sm"
        >
          {showAddForm ? <XCircle size={20} /> : <UserPlus size={20} />}
          {showAddForm ? "Cancel" : "Add New Admin"}
        </button>
      </div>

      {/* Credentials card — shown once, right after a user is created */}
      <AnimatePresence>
        {createdUser && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-green-500/5 border border-green-500/30 rounded-[2.5rem] p-8 md:p-10 overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/15 rounded-2xl flex items-center justify-center text-green-500">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight">Access Granted</h3>
                  <p className="text-secondary text-xs font-bold uppercase tracking-widest mt-1">
                    Copy & share these credentials now — the password won&apos;t be shown again
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedUser(null)}
                className="text-secondary hover:text-dark dark:hover:text-white transition-colors shrink-0"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Email", value: createdUser.email, field: "c-email" },
                { label: "Password", value: createdUser.password, field: "c-password", mono: true },
              ].map((item) => (
                <div key={item.field} className="bg-white dark:bg-dark border border-border rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">{item.label}</p>
                    <p className={`font-bold truncate ${item.mono ? "font-mono tracking-tight" : ""}`}>{item.value}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.value, item.field)}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                  >
                    {copiedField === item.field ? <Check size={14} /> : <Copy size={14} />}
                    {copiedField === item.field ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => copyToClipboard(`Email: ${createdUser.email}\nPassword: ${createdUser.password}`, "c-both")}
              className="mt-6 w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
            >
              {copiedField === "c-both" ? <Check size={18} /> : <Copy size={18} />}
              {copiedField === "c-both" ? "Credentials Copied" : "Copy Email & Password"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 md:p-12"
        >
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Full Name</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-white dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold transition-all" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Email Address</label>
              <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 bg-white dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold transition-all" placeholder="john@techpulse.com" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Password</label>
              <div className="relative">
                <input required type="text" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-6 pr-32 py-4 bg-white dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold font-mono transition-all" placeholder="••••••••" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={generatePassword}
                    title="Generate a strong password"
                    className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => formData.password && copyToClipboard(formData.password, "form-password")}
                    title="Copy password"
                    disabled={!formData.password}
                    className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-40"
                  >
                    {copiedField === "form-password" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Role</label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-6 py-4 bg-white dark:bg-dark border border-border rounded-2xl focus:outline-none focus:border-primary font-bold transition-all appearance-none">
                <option value="Editor">Editor</option>
                <option value="Admin">Admin</option>
                <option value="Super-Admin">Super Admin</option>
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end mt-4">
              <button disabled={adding} type="submit" className="bg-primary text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center gap-3">
                {adding ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                {adding ? "Adding..." : "Grant Access"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map((user: any, i) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-white dark:bg-dark/50 border border-border rounded-[2.5rem] shadow-sm relative group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl uppercase">
                  {user.name[0]}
                </div>
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight">{user.name}</h3>
                  <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Active
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-secondary">
                  <Mail size={16} />
                  <span className="text-xs font-bold">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-secondary">
                  <Shield size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">{user.role || 'editor'}</span>
                </div>
              </div>

              <button onClick={() => handleDeleteUser(user._id)} className="w-full py-4 border border-border text-red-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                <Trash2 size={16} /> Revoke Access
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
