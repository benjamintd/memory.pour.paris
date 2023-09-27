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
  title: "Les rues de Paris",
  description:
    "Quel pourcentage des rues et stations de métro de Paris connaissez-vous de tête ?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={font.className}>{children}</body>
    </html>
  );
}
