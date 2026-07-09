import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chargeback Autopilot",
  description: "AI Agent for resolving chargeback disputes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
