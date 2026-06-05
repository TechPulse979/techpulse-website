// Estimates reading time from post content. Posts created via the editor store
// HTML (React Quill) and have no explicit readTime field, so we derive it.
export function getReadingTime(content?: string, fallback = "5 min read"): string {
  if (!content) return fallback;
  const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  const words = text.split(" ").length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
