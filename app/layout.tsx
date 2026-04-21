import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ad Concept Generator (mock)",
  description: "Generate 3 ad concepts from a creative + product URL (mock data)."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

