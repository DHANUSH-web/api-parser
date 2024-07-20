import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@radix-ui/themes/styles.css';
import { Theme, ThemePanel } from "@radix-ui/themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "API Parser",
  description: "A free API testing and exploring web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta httpEquiv="Permission-Policy" content="clipboard-write=(self)" />
      <body className={inter.className}>
        <Theme>
        {children}
          <ThemePanel />
        </Theme>
      </body>
    </html>
  );
}
