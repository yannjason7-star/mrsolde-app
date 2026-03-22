"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, PackagePlus, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useRouter } from 'next/navigation';

export default function ManagerDashboard({ user }: any) {
  const router = useRouter();
  const [data, setData] = useState<any>({ stats: {}, chart: [], logs: [] });

  useEffect(() => {
    const fetchManager = async () => {
      const { data: products } = await supabase.from('products').select('*');
      // On récupère TOUT l'historique de l'utilisateur sans limite
      const { data: logs } = await supabase.from('activity_logs')
        .select('*').eq('user_name', user.full_name).eq('action_type', 'STOCK').order('created_at', {ascending: false});

      const categories = [
        { name: 'iPhone', qty: products?.filter(p => p.brand === 'Apple' && p.category === 'Smartphone').reduce((a,b)=>a+b.quantity,0) || 0, color: '#0F172A' },
        { name: 'Samsung', qty: products?.filter(p => p.brand === 'Samsung' && p.category === 'Smartphone').reduce((a,b)=>a+b.quantity,0) || 0, color: '#2563eb' },
        { name: 'Google', qty: products?.filter(p => p.brand === 'Google' && p.category === 'Smartphone').reduce((a,b)=>a+b.quantity,0) || 0, color: '#ea4335' },
        { name: 'Tablette', qty: products?.filter(p => p.category === 'Tablette').reduce((a,b)=>a+b.quantity,0) || 0, color: '#8b5cf6' },
        { name: 'Ordinateur', qty: products?.filter(p => p.category === 'Laptop').reduce((a,b)=>a+b.quantity,0) || 0, color: '#334155' },
        { name: 'Accessoire', qty: products?.filter(p => p.category === 'Accessoire').reduce((a,b)=>a+b.quantity,0) || 0, color: '#64748b' },
      ];

      setData({
        stats: { total: products?.reduce((a,b)=>a+b.quantity,0) || 0, arrivals: logs?.length || 0 },
        chart: categories,
        logs: logs || []
      });
    };
    fetchManager();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-700">
      <h1 className="text-3xl font-black italic uppercase italic">LOGISTIQUE <span className="text-brand-red">MANAGER</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => router.push('/inventory')} className="glass-card p-10 flex items-center justify-between hover:border-brand-red transition-all">
          <div><p className="text-[10px] font-black uppercase text-slate-400">Articles en Stock</p><h2 className="text-5xl font-black italic">{data.stats.total}</h2></div>
          <Package size={40} className="text-slate-200"/>
        </button>
        <div className="glass-card p-10 bg-slate-900 text-white flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase text-slate-500">Total Arrivages Faits</p><h2 className="text-5xl font-black italic">{data.stats.arrivals}</h2></div>
          <PackagePlus size={40} className="text-brand-red"/>
        </div>
      </div>

      <div className="glass-card p-10">
        <h3 className="text-xs font-black uppercase tracking-widest mb-10 text-slate-400 italic">État du stock par rayon</h3>
        <div className="h-[400px]">
          <ResponsiveContainer>
            <BarChart data={data.chart}>
              <CartesianGrid strokeDasharray="4 4" vertical={true} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '900'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
              <Bar dataKey="qty" radius={[10, 10, 0, 0]} barSize={60}>
                {data.chart.map((entry: any, index: number) => (
                  <Cell 
                    key={index} 
                    fill={entry.qty < 5 ? '#E11D48' : entry.color}
                    className={entry.qty < 5 ? 'animate-blink-red' : ''} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-10">
        <h3 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-2"><Clock size={16}/> Historique Complet des Arrivages</h3>
        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
          {data.logs.map((log: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
              <span className="text-xs font-black uppercase italic text-slate-900">{log.details}</span>
              <span className="text-[10px] font-bold text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}