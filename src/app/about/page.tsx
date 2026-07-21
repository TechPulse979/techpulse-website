import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { mergeAbout } from "@/lib/pageDefaults";

async function getAbout() {
  try {
    await connectDB();
    const settings: any = await Setting.findOne().lean();
    return mergeAbout(settings?.about);
  } catch (err) {
    console.error("Failed to load About content:", err);
    return mergeAbout(null);
  }
}

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <>
      <Navbar />
      <main className="pt-32 bg-light dark:bg-dark">
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
            <div className="relative flex justify-center">
              <div className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full overflow-hidden border-[12px] border-white dark:border-gray-800 shadow-2xl ring-1 ring-primary/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={about.profileImage}
                  alt={about.profileName}
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
            </div>

            <div className="lg:pr-10">
              <span className="text-primary font-black uppercase tracking-widest text-xs mb-6 block">{about.storyLabel}</span>
              <h2 className="text-5xl md:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight text-balance">
                {about.headingPrefix} <span className="text-primary">{about.headingHighlight}</span> {about.headingSuffix}
              </h2>
              <p className="text-secondary text-xl leading-relaxed mb-10">
                {about.bio}
              </p>

              {about.stats.length > 0 && (
                <div className="grid grid-cols-2 gap-10 mb-12">
                  {about.stats.map((stat, i) => (
                    <div key={`${stat.label}-${i}`}>
                      <p className="text-5xl font-black text-dark dark:text-white mb-2 tracking-tighter">{stat.value}</p>
                      <p className="text-xs font-black uppercase tracking-widest text-secondary">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <Link
                href={about.ctaLink || "/contact"}
                className="group inline-flex items-center bg-dark text-white dark:bg-white dark:text-dark px-10 py-5 rounded-[2rem] font-bold shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-primary dark:hover:bg-primary dark:hover:text-white"
              >
                {about.ctaText}
                <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-dark/50 border border-border rounded-[4rem] p-10 md:p-24 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
               <div>
                  <h2 className="text-5xl font-extrabold mb-8 tracking-tight">{about.toolkitHeading}</h2>
                  <p className="text-secondary text-xl mb-12 leading-relaxed">
                    {about.toolkitDescription}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {about.skills.map((skill, i) => (
                      <div key={`${skill}-${i}`} className="flex items-center bg-light/50 dark:bg-white/5 border border-border/50 rounded-[1.5rem] p-5 group hover:border-primary/30 transition-all">
                        <CheckCircle2 className="text-primary mr-4 group-hover:scale-110 transition-transform" size={24} />
                        <span className="font-bold text-dark dark:text-white">{skill}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="flex flex-col justify-center">
                  <div className="space-y-10">
                    {about.skillBars.map((bar, i) => (
                      <div key={`${bar.label}-${i}`}>
                        <div className="flex justify-between mb-4 items-end">
                          <span className="font-black uppercase tracking-widest text-xs">{bar.label}</span>
                          <span className="text-2xl font-black text-primary">{bar.percent}%</span>
                        </div>
                        <div className="w-full h-4 bg-light dark:bg-white/5 rounded-full overflow-hidden border border-border/50">
                          <div
                            className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                            style={{ width: `${bar.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
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
