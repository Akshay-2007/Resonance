import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Resonance — Experience-Aware Incident Decision Intelligence",
  description: "Resonance determines whether historical incident resolutions are safe to execute under current runtime and schema state.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="min-h-screen bg-[#f4f5f8] dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100 antialiased flex flex-col font-sans transition-colors duration-300">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
            {children}
          </main>
          <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-[#080b12] py-6 text-center text-xs text-slate-500 dark:text-slate-500 transition-colors">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-medium text-slate-600 dark:text-slate-400">Resonance · Experience-Aware Incident Decision Intelligence</span>
              <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">Powered by Hindsight Cloud Associative Memory</span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
