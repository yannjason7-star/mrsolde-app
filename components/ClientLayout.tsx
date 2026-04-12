"use client";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Mode hors ligne désactivé temporairement pour éviter les erreurs sql.js
    console.log("Application démarrée (mode en ligne uniquement)");
  }, []);

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </>
  );
}