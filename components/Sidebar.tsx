"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
// AJOUT DE "Activity" DANS LES IMPORTS CI-DESSOUS
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Receipt, 
  LogOut, 
  Activity 
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('userData');
    // Redirection si non connecté
    if (!data && pathname !== '/auth/login') {
      router.push('/auth/login');
    } else {
      setUser(JSON.parse(data || '{}'));
    }
  }, [pathname, router]);

  // Si on est sur le login ou si l'utilisateur n'est pas chargé, on n'affiche rien
  if (pathname === '/auth/login' || !user) return null;

  // Définition du menu avec permissions strictes
  const menu = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/', 
      show: true 
    },
    { 
      icon: Package, 
      label: 'Inventaire Global', 
      href: '/inventory', 
      show: true 
    },
    { 
      icon: ShoppingCart, 
      label: 'Ventes', 
      href: '/sales/new', 
      show: user.role !== 'manager' 
    },
    { 
      icon: Receipt, 
      label: 'Dépenses', 
      href: '/expenses/new', 
      show: user.can_see_expenses || user.role === 'admin' 
    },
    { 
      icon: Activity, 
      label: 'Flux & Mouvements', 
      href: '/admin/movements', 
      show: user.role === 'admin' 
    },
    { 
      icon: Users, 
      label: 'Gestion Équipe', 
      href: '/users', 
      show: user.role === 'admin' 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/auth/login');
  };

  return (
    <div className="w-72 h-screen fixed left-0 top-0 p-6 flex flex-col bg-white border-r border-slate-100 z-50">
      {/* LOGO */}
      <div className="flex items-center gap-3 px-4 mb-12">
        <div className="w-10 h-10 bg-brand-red rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg shadow-brand-red/20 text-xl">S</div>
        <span className="font-black text-xl tracking-tighter italic uppercase text-slate-900">Mr. SOLDE</span>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2">
        {menu.filter(m => m.show).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-300 ${
                isActive 
                ? 'bg-slate-900 text-white shadow-xl translate-x-1' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
              <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* PROFIL & LOGOUT */}
      <div className="p-4 bg-slate-50 rounded-[2.5rem] mt-auto border border-slate-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-2xl bg-brand-red text-white flex items-center justify-center font-black uppercase text-xs italic shadow-sm">
            {user.role?.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-black text-slate-900 uppercase truncate leading-tight">
              {user.full_name}
            </span>
            <span className="text-[9px] font-black text-brand-red uppercase italic tracking-widest">
              {user.role}
            </span>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-brand-red transition-all font-black text-[10px] uppercase py-3 rounded-2xl border border-transparent hover:border-brand-red/10"
        >
          <LogOut size={14} /> Déconnexion
        </button>
      </div>
    </div>
  );
}