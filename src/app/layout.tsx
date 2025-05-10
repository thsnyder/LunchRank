import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LunchRank",
  description: "Rate your lunch and help us find the best spots!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="lunchrank">
      <body>{children}</body>
    </html>
  );
}
