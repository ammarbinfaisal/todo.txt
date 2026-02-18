import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "TodoTXT",
  description: "Offline-first todo.txt PWA"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-neutral-950 antialiased">
        {children}
      </body>
    </html>
  );
}

