import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/editor.css";
import "react-quill-new/dist/quill.snow.css";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const FALLBACK_TITLE = "Mind Rovia Blog – Expert Articles, Guides & Latest Insights";
const FALLBACK_DESCRIPTION = "Explore informative blogs on technology, business, health, lifestyle, finance, travel, education, and much more at Mind Rovia.";

// Read the SEO title/description from Settings so the browser tab reflects what
// the admin configures. Pages with their own generateMetadata (home, blog post)
// still override this for their route.
export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB();
    const settings = await Setting.findOne();
    if (settings) {
      return {
        title: settings.metaTitle || FALLBACK_TITLE,
        description: settings.metaDescription || FALLBACK_DESCRIPTION,
      };
    }
  } catch (error) {
    console.error("Error generating metadata in layout.tsx:", error);
  }
  return { title: FALLBACK_TITLE, description: FALLBACK_DESCRIPTION };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
