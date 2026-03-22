"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Correction des imports avec chemins relatifs
import AdminDashboard from '../components/dashboards/AdminDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import SellerDashboard from '../components/dashboards/SellerDashboard';

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('userData');
    if (!data) {
      router.push('/auth/login');
    } else {
      setUser(JSON.parse(data));
      setIsReady(true);
    }
  }, [router]);

  if (!isReady || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-brand-red" size={40} />
      </div>
    );
  }

  return (
    <>
      {user.role === 'admin' && <AdminDashboard user={user} />}
      {user.role === 'manager' && <ManagerDashboard user={user} />}
      {user.role === 'seller' && <SellerDashboard user={user} />}
    </>
  );
}