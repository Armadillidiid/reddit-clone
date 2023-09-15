import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { TailwindIndicator } from "@/components/TailwindIndicator";
import Navbar from "@/components/ui/Navbar";

export const metadata = {
  title: "Breadit",
  description: "A Reddit clone built with Next.js and TypeScript.",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-white text-slate-900 antialiased font-light",
        inter.className,
      )}
    >
      <body className="min-h-screen pt-12 bg-slate-50 antialiased">
        <Navbar />
        <div className="container max-w-7xl mx-auto h-full p-12">
          {children}
        </div>
        <TailwindIndicator />
      </body>
    </html>
  );
}
