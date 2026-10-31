import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RadMap | Environmental Intelligence",
  description: "Environmental monitoring and intelligence platform."
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