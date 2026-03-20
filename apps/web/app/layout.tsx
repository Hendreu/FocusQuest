import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FocusQuest",
  description: "Gamified learning for neurodivergent minds",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6C63FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <link rel="apple-touch-icon" href="/icons/icon-512.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
