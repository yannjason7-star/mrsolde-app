"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { History, Search, Download, Calendar } from 'lucide-react';

export default function SalesHistory() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      const { data } = await supabase
        .from('sales')
        .select('*, products(name, brand, product_code, imei, mac_address)')
        .order('sale_date', { ascending: false });
      setSales(data || []);
      setLoading(false);
    };
    fetchSales();
  }, []);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Journal des <span className="text-brand-red">Ventes</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mt-2">Traçabilité complète des transactions</p>
        </div>
        <button className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
          <Download size={16}/> Exporter PDF
        </button>
      </div>

      <div className="bg-brand-card/40 backdrop-blur-xl border border-brand-border rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-brand-border text-[9px] font-black uppercase text-gray-500 tracking-widest">
            <tr>
              <th className="p-6">Date & Heure</th>
              <th className="p-6">Client</th>
              <th className="p-6">Appareil Vendu</th>
              <th className="p-6 text-center">Identifiant (IMEI/MAC)</th>
              <th className="p-6 text-right">Montant Encaissé</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/30">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-white/5 transition-all group">
                <td className="p-6 text-xs text-gray-400 font-mono">
                  {new Date(sale.sale_date).toLocaleString('fr-FR')}
                </td>
                <td className="p-6 font-black text-white uppercase text-xs italic tracking-tighter">{sale.client_name}</td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase">{sale.products?.name}</span>
                    <span className="text-[9px] text-brand-red font-bold uppercase">{sale.products?.brand}</span>
                  </div>
                </td>
                <td className="p-6 text-center text-[10px] font-mono text-gray-500 group-hover:text-white transition-colors">
                  {sale.products?.imei || sale.products?.mac_address}
                </td>
                <td className="p-6 text-right font-black text-green-500 italic">
                  {sale.final_price.toLocaleString()} F
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}