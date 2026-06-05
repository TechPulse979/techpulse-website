import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Articles Written", value: "150+" },
    { label: "Years Experience", value: "8+" },
    { label: "Projects Delivered", value: "45+" },
    { label: "Tech Stacks", value: "12" },
  ];

  const skills = ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Python", "Cloud Architecture", "UI Design"];

  return (
    <>
      <Navbar />
      <main className="pt-32 bg-light dark:bg-dark">
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
            <div className="relative flex justify-center">
              <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full overflow-hidden border-[12px] border-white dark:border-gray-800 shadow-2xl ring-1 ring-primary/20">
                <Image 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
                  alt="Alex Rivera" 
                  fill 
                  className="object-cover scale-110"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
            </div>

            <div className="lg:pr-10">
              <span className="text-primary font-black uppercase tracking-widest text-xs mb-6 block">The Story So Far</span>
              <h2 className="text-5xl md:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight text-balance">
                Building digital <span className="text-primary">legacies</span> through code.
              </h2>
              <p className="text-secondary text-xl leading-relaxed mb-10">
                I'm Alex Rivera, a Principal Developer and Content Architect. I bridge the gap between complex engineering concepts and intuitive, high-performance web experiences.
              </p>
              
              <div className="grid grid-cols-2 gap-10 mb-12">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-5xl font-black text-dark dark:text-white mb-2 tracking-tighter">{stat.value}</p>
                    <p className="text-xs font-black uppercase tracking-widest text-secondary">{stat.label}</p>
                  </div>
                ))}
              </div>

              <Link 
                href="/contact" 
                className="group inline-flex items-center bg-dark text-white dark:bg-white dark:text-dark px-10 py-5 rounded-[2rem] font-bold shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-primary dark:hover:bg-primary dark:hover:text-white"
              >
                Hire for Projects
                <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-dark/50 border border-border rounded-[4rem] p-10 md:p-24 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
               <div>
                  <h2 className="text-5xl font-extrabold mb-8 tracking-tight">Technical Toolkit</h2>
                  <p className="text-secondary text-xl mb-12 leading-relaxed">
                    I specialize in modern stacks that prioritize scale, type-safety, and exceptional UX.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.map((skill) => (
                      <div key={skill} className="flex items-center bg-light/50 dark:bg-white/5 border border-border/50 rounded-[1.5rem] p-5 group hover:border-primary/30 transition-all">
                        <CheckCircle2 className="text-primary mr-4 group-hover:scale-110 transition-transform" size={24} />
                        <span className="font-bold text-dark dark:text-white">{skill}</span>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="flex flex-col justify-center">
                  <div className="space-y-10">
                    <div>
                      <div className="flex justify-between mb-4 items-end">
                        <span className="font-black uppercase tracking-widest text-xs">Frameworks / Next.js</span>
                        <span className="text-2xl font-black text-primary">95%</span>
                      </div>
                      <div className="w-full h-4 bg-light dark:bg-white/5 rounded-full overflow-hidden border border-border/50">
                        <div className="h-full bg-primary w-[95%] rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-4 items-end">
                        <span className="font-black uppercase tracking-widest text-xs">Systems / TypeScript</span>
                        <span className="text-2xl font-black text-primary">90%</span>
                      </div>
                      <div className="w-full h-4 bg-light dark:bg-white/5 rounded-full overflow-hidden border border-border/50">
                        <div className="h-full bg-primary w-[90%] rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-4 items-end">
                        <span className="font-black uppercase tracking-widest text-xs">Design / UI Architecture</span>
                        <span className="text-2xl font-black text-primary">85%</span>
                      </div>
                      <div className="w-full h-4 bg-light dark:bg-white/5 rounded-full overflow-hidden border border-border/50">
                        <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)]" />
                      </div>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
