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
        title: settings.metaTitle || "Mind Rovia Blog – Expert Articles, Guides & Latest Insights",
        description: settings.metaDescription || "Explore informative blogs on technology, business, health, lifestyle, finance, travel, education, and much more at Mind Rovia.",
      };
    }
  } catch (error) {
    console.error("Error generating metadata in page.tsx:", error);
  }
  return {
    title: "Mind Rovia Blog – Expert Articles, Guides & Latest Insights",
    description: "Explore informative blogs on technology, business, health, lifestyle, finance, travel, education, and much more at Mind Rovia.",
  };
}

export default function Home() {
  return <HomeContent />;
}

