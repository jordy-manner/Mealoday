import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Recipe Manager", template: "%s · Recipe Manager" },
  description: "Gestion de recettes de cuisine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // lang="fr" : l'app est en français (accessibilité/SEO).
  // suppressHydrationWarning sur <html> ET <body> : des extensions
  // (traduction, ColorZilla, Grammarly…) réécrivent lang / style sur <html>
  // ou injectent des attributs sur <body> après le rendu serveur, d'où un faux
  // mismatch d'hydratation. L'option n'agit qu'au niveau de la balise où elle
  // est posée ; les enfants restent vérifiés normalement.
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
