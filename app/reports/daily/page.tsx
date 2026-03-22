"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function DailyReport() {
  const [data, setData] = useState({ sales: 0, expenses: 0 });

  useEffect(() => {
    const fetch = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: s } = await supabase.from('sales').select('final_price').gte('sale_date', today);
      const { data: e } = await supabase.from('expenses').select('amount').eq('expense_date', today);
      
      const sumS = s?.reduce((acc, x) => acc + x.final_price, 0) || 0;
      const sumE = e?.reduce((acc, x) => acc + x.amount, 0) || 0;
      setData({ sales: sumS, expenses: sumE });
    };
    fetch();
  }, []);

  const profit = data.sales - data.expenses;

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10">
      <div className="text-center">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase">Bilan <span className="text-brand-red">Journalier</span></h1>
        <p className="text-slate-400 font-bold uppercase tracking-[8px] text-[10px] mt-4">Point automatique Mr. Solde</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <TrendingUp className="text-green-500 mb-4" size={32}/>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrées (Ventes)</p>
            <h2 className="text-4xl font-black italic">{data.sales.toLocaleString()} F</h2>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <TrendingDown className="text-brand-red mb-4" size={32}/>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sorties (Dépenses)</p>
            <h2 className="text-4xl font-black italic">{data.expenses.toLocaleString()} F</h2>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white flex flex-col justify-between">
          <Wallet className="text-brand-red mb-4" size={32}/>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bénéfice Net</p>
            <h2 className={`text-4xl font-black italic ${profit >= 0 ? 'text-white' : 'text-brand-red'}`}>
              {profit.toLocaleString()} F
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}