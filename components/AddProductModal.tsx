"use client";
import { useState } from 'react';
import { X, Check, Smartphone, Tablet, Laptop, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const DATA: any = {
  Smartphone: {
    Apple: ["iPhone XR", "iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16 Pro Max"],
    Samsung: ["Galaxy S10", "Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S24 Ultra"],
    Google: ["Pixel 6", "Pixel 7", "Pixel 8 Pro", "Pixel 9"]
  },
  Tablette: { Apple: ["iPad Air", "iPad Pro"], Samsung: ["Galaxy Tab S9"] },
  Laptop: { HP: ["EliteBook 840", "ProBook"], Dell: ["XPS 13", "Latitude"], Apple: ["MacBook Pro M3"] }
};

export default function AddProductModal({ isOpen, onClose, onSuccess }: any) {
  const [cat, setCat] = useState('Smartphone');
  const [brand, setBrand] = useState('Apple');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const f = e.target;
    
    // REGEX IMEI STRICT : 15 chiffres
    if (cat === 'Smartphone' || cat === 'Tablette') {
      if (!/^\d{15}$/.test(f.imei.value)) return alert("L'IMEI doit comporter 15 chiffres exactement.");
    }

    setLoading(true);
    const { error } = await supabase.from('products').insert([{
      category: cat, brand: brand, model: f.model.value,
      color: f.color?.value || 'N/A', storage: f.storage?.value || 'N/A',
      ram: f.ram?.value || null, imei: f.imei?.value || null,
      mac_address: f.mac?.value || null, 
      quantity: parseInt(f.quantity.value),
      selling_price: parseInt(f.price.value)
    }]);

    if (!error) { onSuccess(); onClose(); }
    else alert(error.message);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black italic uppercase">Nouvel <span className="text-brand-red">Arrivage</span></h2>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          <div className="col-span-2 flex bg-slate-100 p-2 rounded-3xl gap-2">
            {['Smartphone', 'Tablette', 'Laptop', 'Accessoire'].map(c => (
              <button key={c} type="button" onClick={() => {setCat(c); setBrand(Object.keys(DATA[c] || {})[0] || 'Autre')}}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${cat === c ? 'bg-white shadow text-brand-red' : 'text-slate-400'}`}>{c}</button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Marque</label>
            <select value={brand} onChange={(e)=>setBrand(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none">
              {Object.keys(DATA[cat] || {Autre:[]}).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Modèle</label>
            {cat === 'Accessoire' ? <input name="model" className="w-full bg-slate-50 p-4 rounded-2xl font-bold" /> : (
              <select name="model" className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none">
                {DATA[cat]?.[brand]?.map((m:any) => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Couleur</label>
            <input name="color" className="w-full bg-slate-50 p-4 rounded-2xl font-bold" placeholder="ex: Titane" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Stockage</label>
            <input name="storage" className="w-full bg-slate-50 p-4 rounded-2xl font-bold" placeholder="ex: 256GB" />
          </div>

          {cat === 'Laptop' ? (
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-brand-red uppercase tracking-widest px-4 italic underline">Adresse MAC</label>
              <input name="mac" required placeholder="XX:XX:XX:XX:XX:XX" className="w-full bg-slate-50 p-4 rounded-2xl font-mono text-sm outline-none" />
            </div>
          ) : cat !== 'Accessoire' && (
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-brand-red uppercase tracking-widest px-4 italic underline">IMEI (15 Chiffres)</label>
              <input name="imei" required maxLength={15} placeholder="Validation Regex Auto" className="w-full bg-slate-50 p-4 rounded-2xl font-mono text-sm outline-none" />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Quantité</label>
            <input name="quantity" type="number" required defaultValue="1" min="1" className="w-full bg-slate-50 p-4 rounded-2xl font-black text-lg outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-green-500 uppercase tracking-widest px-4 italic">Prix Vente Unitaire</label>
            <input name="price" type="number" required className="w-full bg-green-50 p-4 rounded-2xl font-black italic text-lg outline-none" />
          </div>

          <button disabled={loading} className="col-span-2 bg-slate-900 py-6 rounded-3xl font-black uppercase text-xs tracking-[4px] text-white shadow-2xl hover:scale-[1.02] transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto"/> : "VALIDER L'ARTICLES"}
          </button>
        </form>
      </div>
    </div>
  );
}