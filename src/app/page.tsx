import HomeContent from "@/components/HomeContent";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB();
    const settings = await Setting.findOne();
    if (settings) {
      return {
        title: settings.metaTitle || "TechPulse | Modern Blog for Tech Enthusiasts",
        description: settings.metaDescription || "Stay updated with the latest in AI, Programming, Cloud, and more.",
      };
    }
  } catch (error) {
    console.error("Error generating metadata in page.tsx:", error);
  }
  return {
    title: "TechPulse | Modern Blog for Tech Enthusiasts",
    description: "Stay updated with the latest in AI, Programming, Cloud, and more.",
  };
}

export default function Home() {
  return <HomeContent />;
}

