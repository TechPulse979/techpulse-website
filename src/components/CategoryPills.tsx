"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CategoryPillsProps {
  onCategoryChange: (category: string) => void;
  activeCategory: string;
  categories?: string[];
}

export default function CategoryPills({ onCategoryChange, activeCategory, categories: customCategories }: CategoryPillsProps) {
  const categoriesList = customCategories || ["All", "AI", "Programming", "Tutorials", "Cloud", "DevOps"];

  return (
    <div className="flex items-center space-x-3 overflow-x-auto pb-4 no-scrollbar">
      {categoriesList.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-8 py-3.5 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all duration-300 uppercase tracking-widest",
            activeCategory === category
              ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
              : "bg-accent/50 text-primary hover:bg-accent"
          )}
        >
          <span className="opacity-50 mr-1">#</span>
          {category}
        </button>
      ))}
    </div>
  );
}
