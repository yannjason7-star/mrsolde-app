"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Package, ShoppingCart, Loader2, ArrowLeft, Lock, User } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const id = e.target.login.value;
    const pass = e.target.pass.value;

    const { data, error } = await supabase
      .from('internal_accounts')
      .select('*')
      .eq('login_id', id)
      .eq('password', pass)
      .eq('role', selectedRole)
      .single();

    if (data) {
      localStorage.setItem('userData', JSON.stringify(data));
      router.push('/');
    } else {
      alert("Accès refusé. Vérifiez vos identifiants pour ce poste.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      {!selectedRole ? (
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-700">
          {/* PORTE GESTIONNAIRE */}
          <div onClick={() => setSelectedRole('manager')} className="glass-card p-12 flex flex-col items-center justify-center cursor-pointer hover:scale-105 hover:border-brand-red/30 transition-all group">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-brand-red transition-colors mb-6">
              <Package size={40} />
            </div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Gestionnaire</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest text-center">Entrées & Stocks</p>
          </div>

          {/* PORTE ADMIN */}
          <div onClick={() => setSelectedRole('admin')} className="glass-card p-12 flex flex-col items-center justify-center cursor-pointer border-2 border-brand-red/10 hover:scale-105 hover:border-brand-red transition-all group shadow-2xl shadow-brand-red/5">
            <div className="w-20 h-20 bg-brand-red rounded-3xl flex items-center justify-center text-white mb-6">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Propriétaire</h2>
            <p className="text-[10px] text-brand-red font-bold uppercase mt-2 tracking-widest text-center">Contrôle Total</p>
          </div>

          {/* PORTE VENDEUR */}
          <div onClick={() => setSelectedRole('seller')} className="glass-card p-12 flex flex-col items-center justify-center cursor-pointer hover:scale-105 hover:border-brand-red/30 transition-all group">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-brand-red transition-colors mb-6">
              <ShoppingCart size={40} />
            </div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Vendeur</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest text-center">Sorties & Ventes</p>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 w-full max-w-md animate-in slide-in-from-bottom-10 duration-500">
          <button onClick={() => setSelectedRole(null)} className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mb-8 hover:text-brand-red">
            <ArrowLeft size={14}/> Retour au choix
          </button>
          
          <div className="mb-10 text-center">
             <Image src="/logo.png" alt="Logo" width={100} height={60} className="mx-auto mb-4" />
             <h3 className="text-2xl font-black italic uppercase italic tracking-tighter">Accès <span className="text-brand-red">{selectedRole}</span></h3>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
              <input name="login" required placeholder="Identifiant unique" className="w-full bg-slate-50 p-5 pl-14 rounded-3xl font-bold text-sm outline-none focus:ring-2 ring-brand-red/20" />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
              <input name="pass" type="password" required placeholder="Mot de passe" className="w-full bg-slate-50 p-5 pl-14 rounded-3xl font-bold text-sm outline-none focus:ring-2 ring-brand-red/20" />
            </div>
            <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[5px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto"/> : "Ouvrir la session"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}