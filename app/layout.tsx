import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; // On importe la barre latérale

export const metadata: Metadata = {
  title: "Mr. Solde - Gestion de Stock",
  description: "Application professionnelle pour Mr. Solde",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}