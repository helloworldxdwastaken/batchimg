import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BatchImg — Country Image Generator",
  description: "Batch generate cartoonish marketing images for every country",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
