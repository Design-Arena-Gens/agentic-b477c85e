import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intellect Design Arena Share Insights",
  description: "Live analytics and insights for Intellect Design Arena Ltd."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
