import type { Metadata } from "next";
import "@/styles/globals.css";
import NavBar from "@/components/NavBar";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "GroovyDruvy — Morning Market Briefing",
  description: "Personal daily finance & tech news dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
