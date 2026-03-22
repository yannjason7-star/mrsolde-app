"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ArrowUpCircle, ArrowDownCircle, Search, Filter, 
  RefreshCw, Loader2, Activity, Clock, Package
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function StockMovements() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Tous");

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setMovements(data || []);
    setLoading(false);
  };

  // --- 1. SYNCHRONISATION DU GRAPHIQUE (7 DERNIERS JOURS RÉELS) ---
  const chartData = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      const isoStr = d.toISOString().split('T')[0];

      // Filtrer les mouvements pour ce jour précis
      const dayMovs = movements.filter(m => m.created_at.startsWith(isoStr));
      
      return {
        name: dateStr,
        entrees: dayMovs.filter(m => m.type === 'ENTREE').reduce((acc, m) => acc + (m.quantity || 0), 0),
        sorties: dayMovs.filter(m => m.type === 'SORTIE').reduce((acc, m) => acc + (m.quantity || 0), 0),
      };
    });
    return days;
  }, [movements]);

  // --- 2. CALCULS DES RÉSUMÉS DU JOUR ---
  const summary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysMovs = movements.filter(m => m.created_at.startsWith(today));
    
    const entries = todaysMovs.filter(m => m.type === 'ENTREE').reduce((acc, m) => acc + m.quantity, 0);
    const sorties = todaysMovs.filter(m => m.type === 'SORTIE').reduce((acc, m) => acc + m.quantity, 0);
    
    return { entries, sorties, net: entries - sorties };
  }, [movements]);

  // --- 3. FILTRAGE DU TABLEAU ---
  const filteredData = movements.filter(m => {
    const matchSearch = (m.product_name || "").toLowerCase().includes(search.toLowerCase()) || 
                        (m.user_name || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "Tous" || m.type === filterType;
    return matchSearch && matchType;
  });

  if (loading) return <div className="p-32 text-center"><Loader2 className="animate-spin text-brand-red mx-auto" size={40}/></div>;

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 md:px-8 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER & KPIs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase underline decoration-brand-red/10">FLUX <span className="text-brand-red">&</span> MOUVEMENTS</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[5px] mt-2 italic">Analyse des flux réels Mr. Solde</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
          <div className="glass-card p-4 border-l-4 border-l-green-500 shadow-sm">
             <p className="text-[9px] font-black text-slate-400 uppercase italic">Entrées Jour</p>
             <p className="text-xl font-black text-slate-900">+{summary.entries}</p>
          </div>
          <div className="glass-card p-4 border-l-4 border-l-brand-red shadow-sm">
             <p className="text-[9px] font-black text-slate-400 uppercase italic">Sorties Jour</p>
             <p className="text-xl font-black text-brand-red">-{summary.sorties}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-xl">
             <p className="text-[9px] font-black text-slate-500 uppercase italic">Balance</p>
             <p className="text-xl font-black italic text-green-400">{summary.net > 0 ? `+${summary.net}` : summary.net}</p>
          </div>
        </div>
      </div>

      {/* LE GRAPHIQUE SYNCHRONISÉ (FocusFlow Style) */}
      <div className="glass-card p-8 md:p-10">
        <div className="flex justify-between items-center mb-10">
           <h3 className="text-xs font-black uppercase tracking-[3px] text-slate-400 italic">Dynamique Entrées vs Sorties (7j)</h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                 <span className="text-[9px] font-black uppercase text-slate-500">Arrivages</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-brand-red"></div>
                 <span className="text-[9px] font-black uppercase text-slate-500">Ventes</span>
              </div>
           </div>
        </div>
        <div className="h-[350px] w-full">
           <ResponsiveContainer>
              <AreaChart data={chartData}>
                 <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#E11D48" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#E11D48" stopOpacity={0}/>
                    </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="4 4" vertical={true} stroke="#F1F5F9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '900', fill: '#94A3B8'}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: '900', fill: '#94A3B8'}} />
                 <Tooltip contentStyle={{borderRadius:'20px', border:'none', boxShadow:'0 10px 40px rgba(0,0,0,0.05)', fontSize: '10px'}} />
                 <Area type="monotone" dataKey="entrees" stroke="#22C55E" fill="url(#colorIn)" strokeWidth={3} />
                 <Area type="monotone" dataKey="sorties" stroke="#E11D48" fill="url(#colorOut)" strokeWidth={3} />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* FILTRES DU TABLEAU */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            placeholder="Rechercher produit, utilisateur..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-100 p-4 pl-14 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-brand-red/10"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
          {['Tous', 'ENTREE', 'SORTIE'].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${filterType === t ? 'bg-white text-brand-red shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
          ))}
        </div>
        <button onClick={fetchMovements} className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-brand-red hover:border-brand-red/20 transition-all shadow-sm">
           <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* TABLEAU DES MOUVEMENTS RÉELS */}
      <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest italic">
            <tr>
              <th className="p-6">Instant</th>
              <th className="p-6 text-center">Opération</th>
              <th className="p-6">Article concerné</th>
              <th className="p-6 text-center">Quantité</th>
              <th className="p-6">Utilisateur</th>
              <th className="p-6 text-right">Réf.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-900">
            {filteredData.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="p-6">
                   <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] font-bold italic">
                      <Clock size={10}/> {new Date(m.created_at).toLocaleString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                   </div>
                </td>
                <td className="p-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    m.type === 'ENTREE' ? 'bg-green-50 text-green-500 border-green-100' : 'bg-red-50 text-brand-red border-red-100'
                  }`}>
                    {m.type === 'ENTREE' ? '+ Entrée' : '- Sortie'}
                  </span>
                </td>
                <td className="p-6 text-xs font-black uppercase italic tracking-tighter">{m.product_name}</td>
                <td className="p-6 text-center">
                   <span className="text-sm font-black italic">{m.quantity}</span>
                </td>
                <td className="p-6 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500 uppercase">{m.user_name?.charAt(0)}</div>
                   <span className="text-[10px] font-black uppercase text-slate-500 italic">{m.user_name}</span>
                </td>
                <td className="p-6 text-right font-mono text-[9px] text-slate-300">
                  {m.reference_id || `#${m.id}`}
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><td colSpan={6} className="p-20 text-center text-[10px] font-black text-slate-300 uppercase italic tracking-[5px]">Aucune donnée trouvée</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}