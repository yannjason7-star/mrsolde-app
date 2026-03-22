"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  TrendingUp, Clock, CreditCard, User, 
  ChevronRight, X, Loader2, Award, 
  Calendar, ShoppingBag, Star
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SellerDashboard({ user }: any) {
  const [loading, setLoading] = useState(true);
  const [allSales, setAllSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [selectedDaySales, setSelectedDaySales] = useState<any[] | null>(null);

  useEffect(() => {
    if (user?.id) fetchSellerData();
  }, [user]);

  const fetchSellerData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*, products(*)')
      .eq('seller_id', parseInt(user.id))
      .order('sale_date', { ascending: false });

    if (!error) setAllSales(data || []);
    setLoading(false);
  };

  // --- LOGIQUE DE CALCULS ---
  const today = new Date().toISOString().split('T')[0];

  // 1. Chiffre du jour (Reset quotidien automatique)
  const todayRevenue = useMemo(() => {
    return allSales
      .filter(s => s.sale_date.startsWith(today))
      .reduce((acc, s) => acc + Number(s.final_price), 0);
  }, [allSales, today]);

  // 2. Meilleur Article (Best Seller)
  const bestSeller = useMemo(() => {
    if (allSales.length === 0) return null;
    const counts = allSales.reduce((acc: any, s: any) => {
      const name = s.products?.model || 'Article';
      if (!acc[name]) acc[name] = { name, qty: 0, rev: 0 };
      acc[name].qty += (s.quantity_sold || 1);
      acc[name].rev += Number(s.final_price);
      return acc;
    }, {});
    return Object.values(counts).sort((a: any, b: any) => b.qty - a.qty)[0] as any;
  }, [allSales]);

  // 3. Historique par jour
  const dailyHistory = useMemo(() => {
    const groups = allSales.reduce((acc: any, s: any) => {
      const date = s.sale_date.split('T')[0];
      if (!acc[date]) acc[date] = { date, total: 0, count: 0, items: [] };
      acc[date].total += Number(s.final_price);
      acc[date].count += 1;
      acc[date].items.push(s);
      return acc;
    }, {});
    return Object.values(groups).sort((a: any, b: any) => b.date.localeCompare(a.date));
  }, [allSales]);

  // 4. DATA GRAPHIQUE : SOMME DES QUANTITÉS VENDUES (Axe Vertical)
  const chartData = useMemo(() => {
    const getQty = (filterFn: (s: any) => boolean) => 
      allSales.filter(filterFn).reduce((acc, s) => acc + (s.quantity_sold || 1), 0);

    return [
      { name: 'iPhone', qty: getQty(s => s.products?.brand === 'Apple'), color: '#E11D48' },
      { name: 'Samsung', qty: getQty(s => s.products?.brand === 'Samsung'), color: '#2563eb' },
      { name: 'Pixel', qty: getQty(s => s.products?.brand === 'Google'), color: '#ea4335' },
      { name: 'Laptops', qty: getQty(s => s.products?.category === 'Laptop'), color: '#0f172a' },
      { name: 'Access.', qty: getQty(s => s.products?.category === 'Accessoire'), color: '#64748b' },
    ];
  }, [allSales]);

  if (loading) return <div className="p-32 text-center"><Loader2 className="animate-spin text-brand-red mx-auto" size={40}/></div>;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      
      <div className="flex justify-between items-center italic">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">PERFORMANCE <span className="text-brand-red">VENTE</span></h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[4px]">Session: {user.full_name}</p>
      </div>

      {/* --- KPIs PRINCIPAUX --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-10 flex items-center justify-between border-l-8 border-l-green-500">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2 italic">Mon Chiffre (Aujourd'hui)</p>
            <h2 className="text-5xl font-black italic text-slate-900">{todayRevenue.toLocaleString()} F</h2>
            <p className="mt-4 text-[9px] font-bold text-green-600 uppercase underline decoration-green-200 italic">Comptabilisé en direct</p>
          </div>
          <div className="w-16 h-16 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 shadow-sm"><TrendingUp size={32}/></div>
        </div>

        {/* CARTE BEST-SELLER (Remplace transactions faites) */}
        <div className="glass-card p-10 bg-slate-900 text-white relative overflow-hidden group">
          <Award className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" size={120} />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-brand-red uppercase mb-2 tracking-widest italic flex items-center gap-2">
              <Star size={12} fill="#E11D48"/> Votre Meilleure Vente
            </p>
            {bestSeller ? (
              <>
                <h2 className="text-3xl font-black italic uppercase leading-tight">{bestSeller.name}</h2>
                <div className="flex gap-10 mt-6 border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase">Unités</p>
                    <p className="text-xl font-black text-white italic">{bestSeller.qty}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase">Total Cash</p>
                    <p className="text-xl font-black text-brand-red italic">{bestSeller.rev.toLocaleString()} F</p>
                  </div>
                </div>
              </>
            ) : <p className="text-slate-500 font-bold italic py-6">Aucune donnée pour l'instant</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GRAPH BARRE : QUANTITÉS RÉELLES (AXE VERTICAL) */}
        <div className="lg:col-span-2 glass-card p-10">
          <div className="flex justify-between items-center mb-10">
             <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 italic">Volume de sortie (Quantités cumulées)</h3>
             <span className="text-[9px] font-black uppercase bg-slate-50 px-3 py-1 rounded-full text-slate-400 italic">Axe Y = Unités vendues</span>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="4 4" vertical={true} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: '900'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 9, fontWeight: '900'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius:'20px', border:'none', boxShadow:'0 10px 40px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="qty" radius={[10, 10, 10, 10]} barSize={50}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HISTORIQUE JOURNALIER CLICABLE */}
        <div className="glass-card p-8 flex flex-col">
          <h3 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-8 italic flex items-center gap-2">
            <Calendar size={14}/> Archives par Journée
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {dailyHistory.map((day: any) => (
              <div 
                key={day.date} 
                onClick={() => setSelectedDaySales(day)}
                className="p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-brand-red/20 hover:bg-white cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center">
                   <span className="text-[11px] font-black text-slate-900 uppercase italic">{new Date(day.date).toLocaleDateString('fr-FR', {day:'numeric', month:'short'})}</span>
                   <span className="text-xs font-black text-brand-red italic">{day.total.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{day.count} Clients servis</span>
                   <ChevronRight size={12} className="text-slate-300 group-hover:text-brand-red" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION VENTES RÉCENTES */}
      <div className="glass-card p-10">
         <h3 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400 mb-8 italic flex items-center gap-2"><Clock size={16}/> Dernières factures</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allSales.slice(0, 6).map((sale, i) => (
              <div key={i} onClick={() => setSelectedSale(sale)} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-brand-red/10 hover:bg-white transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-red shadow-sm group-hover:bg-brand-red group-hover:text-white transition-colors"><CreditCard size={18}/></div>
                  <div>
                    <p className="text-xs font-black uppercase italic text-slate-900">{sale.products?.model}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{sale.client_name}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                   <p className="text-xs font-black italic text-slate-900">{sale.final_price.toLocaleString()} F</p>
                   <ChevronRight size={14} className="text-slate-200 group-hover:text-brand-red" />
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* --- MODAL DÉTAILS VENTE ULTRA-PRÉCIS --- */}
      {selectedSale && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black uppercase italic tracking-tighter">Facture <span className="text-brand-red">#MS-{selectedSale.id}</span></h2>
                <button onClick={() => setSelectedSale(null)} className="p-2 bg-slate-50 rounded-xl"><X size={20}/></button>
             </div>
             
             <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white">
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Produit</p>
                   <h3 className="text-xl font-black italic uppercase leading-tight">{selectedSale.products?.brand} {selectedSale.products?.model}</h3>
                   <div className="flex gap-4 mt-3 text-[9px] font-bold uppercase text-brand-red">
                      <span>{selectedSale.products?.color}</span>
                      <span>{selectedSale.products?.storage}</span>
                   </div>
                </div>

                <div className="space-y-3 px-2">
                   <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Client</span>
                      <span className="text-[11px] font-black text-slate-900 uppercase italic">{selectedSale.client_name}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase">ID Unique</span>
                      <span className="text-[10px] font-mono text-slate-900 font-bold tracking-tighter">{selectedSale.products?.imei || selectedSale.products?.mac_address || '---'}</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Quantité</span>
                      <span className="text-[11px] font-black text-slate-900 italic">{selectedSale.quantity_sold || 1} unité(s)</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Date & Heure</span>
                      <span className="text-[10px] font-bold text-slate-900">{new Date(selectedSale.sale_date).toLocaleString()}</span>
                   </div>
                </div>

                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-center shadow-sm">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-2 italic underline decoration-brand-red/20">Montant Total Payé</p>
                   <h3 className="text-4xl font-black italic text-slate-900">{selectedSale.final_price.toLocaleString()} F</h3>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- MODAL RÉCAPITULATIF JOURNÉE --- */}
      {selectedDaySales && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 animate-in slide-in-from-bottom-10">
             <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <div>
                   <h2 className="text-2xl font-black uppercase italic tracking-tighter">Bilan du <span className="text-brand-red">{new Date(selectedDaySales.date).toLocaleDateString()}</span></h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 italic">{selectedDaySales.count} transactions enregistrées</p>
                </div>
                <button onClick={() => setSelectedDaySales(null)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100"><X size={20}/></button>
             </div>

             <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                {selectedDaySales.items.map((sale: any, idx: number) => (
                  <div key={idx} onClick={() => { setSelectedSale(sale); setSelectedDaySales(null); }} className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl hover:bg-slate-100 cursor-pointer transition-all border border-transparent hover:border-slate-200">
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-300">#{(selectedDaySales.items.length - idx)}</span>
                        <div>
                           <p className="text-[11px] font-black uppercase italic text-slate-900">{sale.products?.model}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">Client : {sale.client_name}</p>
                        </div>
                     </div>
                     <span className="font-black italic text-slate-900 text-sm">{sale.final_price.toLocaleString()} F</span>
                  </div>
                ))}
             </div>

             <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-end">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic underline decoration-brand-red/20">Clôture Financière</span>
                   <span className="text-[9px] font-bold text-slate-300 uppercase italic">Somme brute des encaissements</span>
                </div>
                <span className="text-4xl font-black italic text-brand-red tracking-tighter">{selectedDaySales.total.toLocaleString()} F</span>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}