import Analytics from "@/components/Analytics";
import "./globals.css";
import { Metadata } from "next";
import localFont from "next/font/local";

const font = localFont({
  src: [
    {
      path: "../fonts/sans.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/sans-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});
export const metadata: Metadata = {
  title: "Paris de tête",
  description:
    "Quel pourcentage des stations de métro de Paris connaissez-vous de tête ?",
  openGraph: {
    title: "Paris de tête",
    description:
      "Quel pourcentage des stations de métro de Paris connaissez-vous de tête ?",
    type: "website",
    locale: "fr_FR",
    url: "https://memory.pour.paris",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={font.className} lang="fr">
      <body className={font.className}>{children}</body>
      <Analytics />
    </html>
  );
}
