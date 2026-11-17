import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Rescue Pup Passport",
  description: "A warm, detailed tracker for rescue dogs — health, weight, milestones, journal, and a printable passport for adopters.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rescue Pup Passport",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
