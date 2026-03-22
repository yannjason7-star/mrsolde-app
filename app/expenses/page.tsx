"use client";
import { useEffect, useState } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Package, Smartphone, Laptop, Tablet, PackageSearch } from 'lucide-react';

const COLORS = ['#E11D48', '#0F172A', '#64748B', '#94A3B8'];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('userData') || '{}'));
  }, []);

  if (!user) return null;

  // DESIGN GESTIONNAIRE DE STOCK
  if (user.role === 'manager') {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-10 animate-in fade-in duration-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter">STOCKS <span className="text-brand-red">INSIGHTS</span></h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[5px] mt-2 italic">Suivi des entrées en magasin</p>
          </div>
        </div>

        {/* 4 GRAPHES PAR CATÉGORIE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['Smartphones', 'Laptops', 'Accessoires', 'Tablettes'].map((cat, i) => (
            <div key={i} className="glass-card p-6 h-64 flex flex-col">
              <div className="flex justify-between items-start mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{cat}</span>
                <span className="text-brand-red">Arrivages</span>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{v:10},{v:25},{v:15},{v:30}]}>
                    <Area type="monotone" dataKey="v" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.1} strokeWidth={3}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* PIE CHART RÉCAPITULATIF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-10 flex flex-col items-center">
            <h3 className="text-xs font-black uppercase tracking-[3px] mb-10 text-slate-400">Répartition du Stock Total</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{n:'S', v:400},{n:'L', v:300},{n:'A', v:300}]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="v">
                    {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-card p-10 flex flex-col justify-center space-y-4">
             <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <PackageSearch className="text-brand-red" size={32}/>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase">Dernier Arrivage</p>
                   <h4 className="text-xl font-black italic uppercase">iPhone 15 Pro Max</h4>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD ADMIN OU VENDEUR (Inspiré de ta capture précédente)
  return (
    <div className="p-8">
      <h1 className="text-3xl font-black italic">Dashboard {user.role}</h1>
    </div>
  );
}