import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}