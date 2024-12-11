import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./context/providers";
import DataStore from "./context/dataStore";
import MetaTags from "./components/metaTags";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Snapbam",
  description: "Your Base AI Agent for trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MetaTags />
        <Providers>
          <DataStore>{children}</DataStore>
        </Providers>
      </body>
    </html>
  );
}
