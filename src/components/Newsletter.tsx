import { Mail } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="bg-dark py-20 px-6 rounded-[2rem] mx-6 my-20 overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
          <Mail className="text-primary" size={32} />
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Stay ahead of the tech curve
        </h2>
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          Get the latest insights, tutorials, and news delivered straight to your inbox. No fluff, just high-quality tech content.
        </p>
        
        <form className="flex flex-col md:flex-row gap-4 p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 bg-transparent px-6 py-4 text-white focus:outline-none placeholder:text-gray-500"
            required
          />
          <button
            type="submit"
            className="bg-primary hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            Subscribe Now
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-500">
          Join 10,000+ tech enthusiasts. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
