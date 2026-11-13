import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Provider } from "@/components/hoc/provider";

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Goding",
  description: "Platform kursus online untuk belajar programming",
  icons: {
    icon: "/logo.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", fontSans.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
