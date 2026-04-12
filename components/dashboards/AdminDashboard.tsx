"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, Wallet, Star, Activity, ChevronRight, 
  X, Loader2, AlertTriangle, UserCheck, Clock, Package, Eye, Bell
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const CAT_COLORS: any = {
  Smartphone: '#E11D48',
  Laptop: '#2563EB',
  Tablette: '#8B5CF6',
  Accessoire: '#10B981'
};

// Fonction pour obtenir le nom d'affichage d'un produit
const getProductDisplayName = (product: any) => {
  if (!product) return 'Article inconnu';
  if (product.category === 'Accessoire') {
    return `${product.brand} ${product.subcategory || 'Accessoire'}${product.compatible_with ? ` (${product.compatible_with})` : ''}`;
  }
  return `${product.brand} ${product.model || ''}`;
};

export default function AdminDashboard({ user }: any) {
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  
  const [stats, setStats] = useState<any>({
    rev: 0, exp: 0, profit: 0, stock: 0,
    vedette: { name: "Analyse...", qty: 0, rev: 0 }
  });
  const [pieData, setPieData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const { data: prod } = await supabase.from('products').select('*');
      const { data: sales } = await supabase.from('sales').select('*, products(*)');
      const { data: exp } = await supabase.from('expenses').select('*').gte('expense_date', today);
      const { data: activity } = await supabase.from('activity_logs').select('*').order('created_at', {ascending: false}).limit(12);

      const todaySales = sales?.filter(s => s.sale_date >= today) || [];
      let bestItem = { name: "Aucun article", qty: 0, rev: 0 };
      
      if (todaySales.length > 0) {
        const map: any = {};
        todaySales.forEach((s: any) => {
          const name = getProductDisplayName(s.products);
          if (!map[name]) map[name] = { name, qty: 0, rev: 0 };
          map[name].qty += (Number(s.quantity_sold) || 1);
          map[name].rev += Number(s.final_price || 0);
        });
        bestItem = Object.values(map).sort((a: any, b: any) => b.qty - a.qty)[0] as any;
      }

      const totalRev = todaySales.reduce((acc, curr) => acc + Number(curr.final_price || 0), 0);
      const totalExp = exp?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0;

      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const daySales = sales?.filter(s => s.sale_date.startsWith(dateStr)) || [];
        
        return {
          day: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
          Smartphone: daySales.filter(s => s.products?.category === 'Smartphone').reduce((a,b)=>a+Number(b.final_price), 0),
          Laptop: daySales.filter(s => s.products?.category === 'Laptop').reduce((a,b)=>a+Number(b.final_price), 0),
          Tablette: daySales.filter(s => s.products?.category === 'Tablette').reduce((a,b)=>a+Number(b.final_price), 0),
          Accessoire: daySales.filter(s => s.products?.category === 'Accessoire').reduce((a,b)=>a+Number(b.final_price), 0),
        };
      });

      setStats({
        rev: totalRev,
        exp: totalExp,
        profit: totalRev - totalExp,
        stock: prod?.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0) || 0,
        vedette: bestItem
      });

      setLineData(last7Days);
      setPieData(['Smartphone', 'Laptop', 'Tablette', 'Accessoire'].map(c => ({
        name: c, value: prod?.filter((p:any) => p.category === c).reduce((acc:any, curr:any)=>acc+Number(curr.quantity || 0), 0) || 0
      })));
      
      const stockAlerts = (prod || [])
        .filter((p: any) => p.quantity <= 10)
        .map((p: any) => ({
          name: getProductDisplayName(p),
          qty: p.quantity,
          status: p.quantity < 5 ? 'RUPTURE' : 'FAIBLE',
          color: p.quantity < 5 ? 'text-brand-red bg-red-50 border-brand-red/10' : 'text-orange-600 bg-orange-50 border-orange-100'
        }))
        .slice(0, 4);

      setAlerts(stockAlerts);
      setLogs(activity || []);

    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <div className="p-32 text-center"><Loader2 className="animate-spin text-brand-red mx-auto" size={50}/></div>;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[160px]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] italic">Encaissements</p>
          <h2 className="text-2xl xl:text-3xl font-black italic tracking-tighter text-slate-900 break-all">
            {stats.rev.toLocaleString()} <span className="text-sm">F</span>
          </h2>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden">
           <Star className="absolute -right-4 -top-4 text-brand-red/5" size={100} />
           <p className="text-[10px] font-black text-brand-red uppercase tracking-[3px] mb-2 italic">★ Vedette</p>
           <h2 className="text-lg font-black uppercase italic text-slate-900 leading-tight break-words line-clamp-2">
             {stats.vedette?.name}
           </h2>
           <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50">
              <span className="text-[9px] font-bold text-slate-400 uppercase">{stats.vedette?.qty} Vendus</span>
              <span className="text-[10px] font-black text-brand-red">{(stats.vedette?.rev || 0).toLocaleString()} F</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[160px]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] italic">Dépenses</p>
          <h2 className="text-2xl xl:text-3xl font-black italic tracking-tighter text-brand-red break-all">
            {stats.exp.toLocaleString()} <span className="text-sm">F</span>
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl flex flex-col justify-between min-h-[160px] relative border border-slate-800">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[3px] italic">Profit Net Réel</p>
            <Wallet size={16} className="text-brand-red" />
          </div>
          <h2 className="text-2xl xl:text-4xl font-black italic tracking-tighter text-green-400 break-all leading-none">
            {stats.profit.toLocaleString()} <span className="text-sm">F</span>
          </h2>
          <p className="text-[8px] font-bold uppercase text-slate-600 tracking-widest italic">Ventes - Dépenses du jour</p>
        </div>
      </div>

      {/* GRAPHIQUE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xs font-black uppercase tracking-[4px] text-slate-400 italic">Analyse Flux Ventes (7 jours)</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(CAT_COLORS).map(([name, color]: any) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
                  <span className="text-[8px] font-black uppercase text-slate-500">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[350px]">
             <ResponsiveContainer>
                <LineChart data={lineData}>
                   <CartesianGrid strokeDasharray="4 4" vertical={true} stroke="#F1F5F9" />
                   <XAxis dataKey="day" tick={{fontSize: 10, fontWeight: '900', fill: '#94A3B8'}} axisLine={false} tickLine={false} />
                   <YAxis tick={{fontSize: 9, fontWeight: '900', fill: '#94A3B8'}} axisLine={false} tickLine={false} />
                   <Tooltip contentStyle={{borderRadius:'20px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'}} />
                   <Line type="monotone" dataKey="Smartphone" stroke={CAT_COLORS.Smartphone} strokeWidth={4} dot={{r:4, fill:'white'}} />
                   <Line type="monotone" dataKey="Laptop" stroke={CAT_COLORS.Laptop} strokeWidth={4} dot={{r:4, fill:'white'}} />
                   <Line type="monotone" dataKey="Tablette" stroke={CAT_COLORS.Tablette} strokeWidth={4} dot={{r:4, fill:'white'}} />
                   <Line type="monotone" dataKey="Accessoire" stroke={CAT_COLORS.Accessoire} strokeWidth={4} dot={{r:4, fill:'white'}} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="glass-card p-10 flex flex-col items-center justify-center">
           <h3 className="text-xs font-black uppercase tracking-[3px] mb-8 italic text-slate-400">Stock en Magasin</h3>
           <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                 <Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={CAT_COLORS[e.name]} />)}
                 </Pie>
                 <Tooltip />
              </PieChart>
           </ResponsiveContainer>
           <div className="grid grid-cols-2 gap-3 w-full mt-10">
              {pieData.map((d, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CAT_COLORS[d.name] }}></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{d.name}</span>
                   </div>
                   <span className="text-slate-900 font-black italic text-xs">{d.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ALERTES STOCK */}
        <div className="glass-card p-8 flex flex-col">
           <h3 className="text-xs font-black uppercase tracking-[3px] mb-8 italic flex items-center gap-2 text-brand-red">
              <AlertTriangle size={18}/> Alertes de Gestion
           </h3>
           <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className={`p-4 rounded-2xl border flex justify-between items-center transition-all ${a.color}`}>
                   <div><p className="text-xs font-black uppercase italic">{a.name}</p><p className="text-[9px] font-bold opacity-60">Restant : {a.qty}</p></div>
                   <span className="text-[9px] font-black uppercase tracking-widest">{a.status}</span>
                </div>
              ))}
              {alerts.length === 0 && <p className="text-center text-xs font-bold text-slate-300 py-10 italic">Stock Optimal ✅</p>}
           </div>
        </div>

        {/* ACTIVITÉS */}
        <div className="glass-card p-10 lg:col-span-2">
           <h3 className="text-xs font-black uppercase tracking-[4px] italic text-slate-400 mb-8 flex items-center gap-2">
              <Activity size={18} className="text-brand-red"/> Activités de l'Équipe
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.map((log, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedLog(log)}
                  className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-brand-red/20 hover:bg-white cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs ${log.action_type === 'VENTE' ? 'bg-slate-900' : 'bg-brand-red'}`}>
                      {log.user_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase italic text-slate-900">{log.user_name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                        {log.action_type} • <span className="text-brand-red">{new Date(log.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-200 group-hover:text-brand-red" />
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* MODAL DÉTAILS AUDIT */}
      {selectedLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                 <h2 className="text-xl font-black uppercase italic tracking-tighter">Fiche <span className="text-brand-red">Audit</span></h2>
                 <button onClick={() => setSelectedLog(null)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"><X size={20}/></button>
              </div>
              <div className="space-y-6">
                 <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-3 text-[10px] font-black uppercase">
                    <div className="flex justify-between"><span>Collaborateur :</span> <span className="text-slate-900 italic">{selectedLog.user_name}</span></div>
                    <div className="flex justify-between"><span>Rôle :</span> <span className="text-brand-red uppercase">{selectedLog.user_role}</span></div>
                    <div className="flex justify-between"><span>Heure :</span> <span className="text-slate-900">{new Date(selectedLog.created_at).toLocaleTimeString()}</span></div>
                 </div>
                 <div className="px-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 underline decoration-brand-red/20">Description de l'action :</p>
                    <p className="text-sm font-bold text-slate-800 leading-snug italic">{selectedLog.details}</p>
                 </div>
                 <div className="p-8 bg-slate-900 rounded-[2.5rem] text-center shadow-xl">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1 italic">Impact Caisse</p>
                    <h3 className="text-3xl font-black italic text-white">{selectedLog.amount?.toLocaleString() || 0} F</h3>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}