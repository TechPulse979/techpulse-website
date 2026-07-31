"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Eye, MessageSquare, Send, User, Calendar, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Comment {
  _id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface InteractiveDetailsProps {
  postId: string;
  postSlug: string;
  initialLikes: number;
  initialViews: number;
}

export default function InteractiveDetails({
  postId,
  postSlug,
  initialLikes,
  initialViews,
}: InteractiveDetailsProps) {
  // --- Comments toggle state ---
  const [showComments, setShowComments] = useState(false);

  // --- Reading Progress ---
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Views Counter ---
  const [views, setViews] = useState(initialViews);
  const viewTriggered = useRef(false);

  useEffect(() => {
    if (viewTriggered.current) return;
    viewTriggered.current = true;

    const incrementView = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/view`, {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.views === "number") {
            setViews(data.views);
          }
        }
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
    };

    incrementView();
  }, [postId]);

  // --- Likes Button ---
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const likedState = localStorage.getItem(`liked_${postId}`);
      setHasLiked(!!likedState);
    }
  }, [postId]);

  const handleLikeToggle = async () => {
    if (liking) return;
    setLiking(true);

    const nextLikedState = !hasLiked;
    
    // Optimistic UI update
    setLikes((prev) => prev + (nextLikedState ? 1 : -1));
    setHasLiked(nextLikedState);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: nextLikedState }),
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.likes === "number") {
          setLikes(data.likes);
        }
        if (nextLikedState) {
          localStorage.setItem(`liked_${postId}`, "true");
        } else {
          localStorage.removeItem(`liked_${postId}`);
        }
      } else {
        // Rollback optimistic update on error
        setLikes((prev) => prev - (nextLikedState ? 1 : -1));
        setHasLiked(!nextLikedState);
      }
    } catch (err) {
      console.error("Failed to update likes:", err);
      // Rollback optimistic update
      setLikes((prev) => prev - (nextLikedState ? 1 : -1));
      setHasLiked(!nextLikedState);
    } finally {
      setLiking(false);
    }
  };

  // --- Comments ---
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postSlug=${encodeURIComponent(postSlug)}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) {
      setCommentError("Please fill out all fields.");
      return;
    }

    setSubmittingComment(true);
    setCommentError("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug,
          authorName: authorName.trim(),
          content: content.trim(),
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [newComment, ...prev]);
        setContent("");
      } else {
        const data = await res.json();
        setCommentError(data.error || "Failed to submit comment. Please try again.");
      }
    } catch (err) {
      setCommentError("Network error. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="w-full mt-12 space-y-16">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1.5 bg-primary z-50 transition-all duration-700 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Engagement Actions Section (Likes & Views) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-y border-border">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-secondary text-sm font-bold uppercase tracking-widest">
            <Eye size={18} className="text-primary" />
            <span>{views} Reads</span>
          </div>
          <button
            onClick={handleLikeToggle}
            disabled={liking}
            className={`flex items-center gap-2.5 px-6 py-3 border border-border rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
              hasLiked
                ? "bg-red-500/10 border-red-500/30 text-red-500"
                : "bg-white dark:bg-white/5 hover:border-primary text-secondary hover:text-primary"
            }`}
          >
            <Heart
              size={18}
              className={`transition-transform duration-300 ${
                hasLiked ? "fill-red-500 text-red-500 scale-110 animate-pulse" : "text-gray-400"
              }`}
            />
            <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
          </button>
        </div>

        <div className="text-secondary text-xs font-bold uppercase tracking-widest">
          Loved this article? Let us know!
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-8">
        {/* Toggle Button / Tab */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="w-full flex items-center justify-between p-6 bg-white dark:bg-dark/30 border border-border rounded-3xl hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-light dark:bg-dark rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-dark dark:text-white">Discussion</h3>
              <p className="text-secondary text-xs font-bold uppercase tracking-widest">
                {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
              </p>
            </div>
          </div>
          <span className="px-5 py-2.5 bg-light dark:bg-dark border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary group-hover:border-primary/30 transition-all duration-300 flex items-center gap-2">
            {showComments ? "Hide Comments" : "Show Comments"}
            {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </button>

        {/* Comment Content (Only shown if showComments is true) */}
        {showComments && (
          <div className="space-y-8 transition-all duration-500 ease-in-out">
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="bg-white dark:bg-dark/30 border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-secondary block">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-light dark:bg-dark/50 border border-border rounded-2xl focus:outline-none focus:border-primary font-bold text-sm transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-secondary block">
                  Comment Details
                </label>
                <textarea
                  placeholder="What are your thoughts on this story?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-6 py-4 bg-light dark:bg-dark/50 border border-border rounded-2xl focus:outline-none focus:border-primary font-bold text-sm transition-all resize-none"
                  required
                />
              </div>

              {commentError && (
                <p className="text-red-500 font-bold text-xs uppercase tracking-wide">
                  {commentError}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingComment}
                className="flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 w-full md:w-auto disabled:opacity-50"
              >
                {submittingComment ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Comment</span>
                  </>
                )}
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {commentsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-primary gap-3">
                  <Loader2 className="animate-spin" size={32} />
                  <p className="font-bold text-xs uppercase tracking-widest">Loading discussion thread...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl">
                  <p className="text-secondary font-bold text-sm">No comments yet. Share your voice to start the conversation!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="bg-white dark:bg-dark/20 border border-border rounded-3xl p-6 shadow-sm hover:border-primary/20 transition-all flex gap-4 animate-in fade-in slide-in-from-top-4 duration-300"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-border relative bg-light dark:bg-dark flex items-center justify-center font-black text-primary text-sm uppercase">
                      {comment.authorName.slice(0, 2)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-black text-sm uppercase tracking-tight text-dark dark:text-white">
                          {comment.authorName}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-secondary text-sm leading-relaxed font-medium whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
