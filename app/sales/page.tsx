"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SalesRedirect() {
  const router = useRouter();
  useEffect(() => {
    // Cela envoie l'utilisateur vers la page que nous venons de créer
    router.push('/sales/new'); 
  }, [router]);

  return null;
}