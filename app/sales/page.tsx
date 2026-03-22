"use client";
import { useState, useEffect } from 'react';
import { Search, CreditCard, CheckCircle2, Loader2, PackageSearch, Minus, Plus, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NewSalePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [qtyToSell, setQtyToSell] = useState(1);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (searchTerm.length < 3) return;
      const { data } = await supabase.from('products').select('*').gt('quantity', 0)
        .or(`imei.eq.${searchTerm},mac_address.eq.${searchTerm},product_code.eq.${searchTerm.toUpperCase()}`).single();
      if (data) { setSelectedProduct(data); setQtyToSell(1); }
    };
    const t = setTimeout(search, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleSale = async (e: any) => {
    e.preventDefault();
    if (!selectedProduct || qtyToSell > selectedProduct.quantity) return;
    setLoading(true);

    const storedData = localStorage.getItem('userData');
    const user = storedData ? JSON.parse(storedData) : null;
    const newQuantity = selectedProduct.quantity - qtyToSell;

    try {
      // 1. Mise à jour du Stock
      await supabase.from('products').update({ 
        quantity: newQuantity, 
        status: newQuantity === 0 ? 'Rupture' : 'En Stock' 
      }).eq('id', selectedProduct.id);

      // 2. Enregistrement de la Vente
      await supabase.from('sales').insert([{
        product_id: selectedProduct.id,
        client_name: clientName,
        final_price: selectedProduct.selling_price * qtyToSell,
        quantity_sold: qtyToSell,
        seller_id: parseInt(user.id)
      }]);

      // 3. ENREGISTREMENT DU MOUVEMENT (CRUCIAL POUR LE GRAPH)
      await supabase.from('stock_movements').insert([{
        type: 'SORTIE',
        product_id: selectedProduct.id,
        product_name: `${selectedProduct.brand} ${selectedProduct.model}`,
        quantity: qtyToSell,
        user_name: user.full_name,
        reference_id: `Vente #${Date.now().toString().slice(-4)}`
      }]);

      // 4. Log Audit Admin
      await supabase.from('activity_logs').insert([{
        user_id: parseInt(user.id),
        user_name: user.full_name,
        user_role: user.role,
        action_type: 'VENTE',
        details: `Vendu ${qtyToSell}x ${selectedProduct.model}`,
        amount: selectedProduct.selling_price * qtyToSell
      }]);

      setSuccess(true);
      setTimeout(() => { setSuccess(false); setSelectedProduct(null); setSearchTerm(""); setClientName(""); }, 2000);
    } catch (err: any) { alert("Erreur : " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-in fade-in duration-700">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black italic uppercase underline decoration-brand-red/10">Point de <span className="text-brand-red">Vente</span></h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Scanner IMEI ou Code SD..." className="w-full bg-slate-50 border-none p-5 pl-14 rounded-3xl font-mono font-bold outline-none focus:ring-2 ring-brand-red/20" />
          </div>
          {selectedProduct && (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white animate-in zoom-in-95 shadow-2xl">
              <p className="text-[10px] font-black text-brand-red uppercase mb-1">{selectedProduct.brand} • Stock: {selectedProduct.quantity}</p>
              <h4 className="text-2xl font-black italic uppercase mb-6">{selectedProduct.model}</h4>
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl mb-6">
                <span className="text-[10px] font-black uppercase text-slate-500">Quantité</span>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setQtyToSell(Math.max(1, qtyToSell - 1))} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-brand-red transition-colors"><Minus size={18}/></button>
                  <span className="font-black text-2xl w-8 text-center italic">{qtyToSell}</span>
                  <button type="button" onClick={() => setQtyToSell(Math.min(selectedProduct.quantity, qtyToSell + 1))} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-brand-red transition-colors"><Plus size={18}/></button>
                </div>
              </div>
              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <p className="text-3xl font-black italic">{(selectedProduct.selling_price * qtyToSell).toLocaleString()} F</p>
                <span className="text-[10px] font-bold text-slate-500">#{selectedProduct.product_code}</span>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSale} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
                <label className="text-[10px] font-black uppercase text-slate-400 px-4">Informations Client</label>
                <input required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nom complet du client" className="w-full bg-slate-50 border-none p-5 rounded-3xl font-bold outline-none" />
                <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 italic">Total à Encaisser</p>
                    <h2 className="text-5xl font-black italic text-slate-900">{(selectedProduct ? selectedProduct.selling_price * qtyToSell : 0).toLocaleString()} F</h2>
                </div>
            </div>
            <button disabled={!selectedProduct || loading} className={`w-full mt-8 py-7 rounded-[2.5rem] font-black uppercase text-xs tracking-[5px] shadow-2xl transition-all ${success ? 'bg-green-500 text-white shadow-green-200' : 'bg-slate-900 text-white hover:scale-[1.02]'}`}>
                {loading ? <Loader2 className="animate-spin mx-auto"/> : success ? <><CheckCircle2 className="inline mr-2"/> VENDU !</> : "Valider l'achat"}
            </button>
        </form>
      </div>
    </div>
  );
}