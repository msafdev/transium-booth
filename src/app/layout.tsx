import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Transium Photobooth 📸",
  description: "Capture and create your custom 4-cut photobooth strips with Transium badges and stickers!",
  icons: {
    icon: "/assets/transium-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
