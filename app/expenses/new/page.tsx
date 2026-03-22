"use client";
import { useState } from 'react';
import { Receipt, Check, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ExpensesPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    await supabase.from('expenses').insert([{
      amount: parseInt(form.amount.value),
      description: form.desc.value,
      category: form.cat.value
    }]);
    alert("Dépense enregistrée !");
    form.reset();
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in slide-in-from-bottom-10 duration-700">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-brand-red mb-4">
            <Receipt size={32}/>
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Sortie de <span className="text-brand-red">Caisse</span></h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[4px] mt-2">Justificatif de dépense journalière</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Motif / Description</label>
            <input name="desc" required placeholder="ex: Facture boutique, Déjeuner..." className="w-full bg-slate-50 border-none p-5 rounded-3xl font-bold text-sm outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Montant (F)</label>
              <input name="amount" type="number" required className="w-full bg-slate-50 border-none p-5 rounded-3xl font-black italic text-lg outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Catégorie</label>
              <select name="cat" className="w-full bg-slate-50 border-none p-5 rounded-3xl font-bold text-sm outline-none appearance-none">
                {['Boutique', 'Personnel', 'Transport', 'Logistique'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-brand-red hover:bg-red-700 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[5px] shadow-xl shadow-brand-red/20 transition-all flex items-center justify-center gap-3">
            {loading ? "ENCOURS..." : <><Check size={20}/> Confirmer la dépense</>}
          </button>
        </form>
      </div>
    </div>
  );
}