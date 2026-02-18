import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "TodoTXT",
  description: "Offline-first todo.txt PWA",
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-dvh bg-[var(--bg)] text-[var(--fg)] antialiased">
        {children}
      </body>
    </html>
  );
}
