import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "SFC Portal", template: "%s | SFC Portal" },
  description: "慶應義塾大学湘南藤沢キャンパス ポータルサービス",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 antialiased">
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
