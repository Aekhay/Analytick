import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "QA Event Dashboard",
  description: "Validate and compare analytics event payloads",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full dark`}>
      <body className="h-full bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
