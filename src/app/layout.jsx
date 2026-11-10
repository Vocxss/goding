import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Goding",
  description: "Platform kursus online untuk belajar programming",
  icons: {
    icon: "/logo.ico",
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", fontSans.variable, "font-sans",)}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
