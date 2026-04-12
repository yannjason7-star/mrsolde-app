"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Filter, Smartphone, Laptop, Tablet, 
  Package, Trash2, Edit3, Loader2, X, ChevronDown, 
  AlertCircle, CheckCircle2, ShoppingBag, Layers
} from 'lucide-react';
import ProductModal from '@/components/ProductModal';
import EditProductModal from '@/components/EditProductModal';
import { logAction } from '@/lib/auditLogger';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Tous");
  const [selectedBrand, setSelectedBrand] = useState("Toutes");
  const [stockStatus, setStockStatus] = useState("Tous");

  useEffect(() => {
    const data = localStorage.getItem('userData');
    if (data) setUser(JSON.parse(data));
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  // Fonction pour obtenir le nom d'affichage d'un produit
  const getProductDisplayName = (p: any) => {
    if (p.category === 'Accessoire') {
      return `${p.brand} ${p.subcategory || 'Accessoire'}${p.compatible_with ? ` (${p.compatible_with})` : ''}`;
    }
    return `${p.brand} ${p.model || ''}`;
  };

  // Fonction pour obtenir les détails d'affichage d'un produit
  const getProductDetails = (p: any) => {
    if (p.category === 'Accessoire') {
      const details = [];
      if (p.texture) details.push(p.texture);
      if (p.power) details.push(p.power);
      if (p.earphone_type) details.push(p.earphone_type);
      if (p.cable_type) details.push(`${p.cable_type} ${p.cable_length || ''}`);
      if (p.color && details.length === 0) details.push(p.color);
      return details.join(' • ') || '---';
    }
    return `${p.color || '---'} • ${p.storage || '---'}`;
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const displayName = getProductDisplayName(p);
      const matchSearch = displayName.toLowerCase().includes(search.toLowerCase()) || 
                          (p.product_code?.toLowerCase() || "").includes(search.toLowerCase()) ||
                          (p.imei || "").includes(search);
      const matchCat = selectedCat === "Tous" || p.category === selectedCat;
      const matchBrand = selectedBrand === "Toutes" || p.brand === selectedBrand;
      let matchStock = true;
      if (stockStatus === "En Stock") matchStock = p.quantity > 0;
      if (stockStatus === "Rupture") matchStock = p.quantity === 0;
      if (stockStatus === "Faible") matchStock = p.quantity > 0 && p.quantity <= 5;

      return matchSearch && matchCat && matchBrand && matchStock;
    });
  }, [products, search, selectedCat, selectedBrand, stockStatus]);

  const dynamicBrands = useMemo(() => {
    const brands = products
      .filter(p => selectedCat === "Tous" || p.category === selectedCat)
      .map(p => p.brand);
    return ["Toutes", ...Array.from(new Set(brands))];
  }, [products, selectedCat]);

  const handleDelete = async (product: any) => {
    if (!confirm(`Supprimer ${getProductDisplayName(product)} ?`)) return;
    
    await logAction({
      action: 'DELETE',
      entity_type: 'product',
      entity_id: product.id,
      old_values: {
        brand: product.brand,
        model: product.model || product.subcategory,
        quantity: product.quantity,
        price: product.selling_price,
        imei: product.imei || null
      }
    });
    
    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (!error) {
      fetchProducts();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto py-4 md:py-8 px-4 md:px-6 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Inventaire <span className="text-brand-red underline decoration-brand-red/10">Global</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[4px] mt-2 italic">Mr. Solde Stock Management</p>
        </div>
        {user?.role === 'manager' && (
          <button onClick={() => { setEditItem(null); setIsModalOpen(true); }} className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-[3px] shadow-xl hover:scale-105 transition-all">+ Nouvel Arrivage</button>
        )}
      </div>

      {/* FILTRES */}
      <div className="glass-card p-4 md:p-6 mb-8 space-y-4 md:space-y-6 bg-white/70 backdrop-blur-xl border-slate-100 lg:sticky lg:top-4 z-40">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" placeholder="Rechercher modèle, IMEI..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-100 p-4 pl-14 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-brand-red/10"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 w-full lg:w-auto overflow-x-auto custom-scrollbar">
            {['Tous', 'Smartphone', 'Laptop', 'Accessoire'].map(c => (
              <button key={c} onClick={() => { setSelectedCat(c); setSelectedBrand("Toutes"); }}
                className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all whitespace-nowrap ${selectedCat === c ? 'bg-white text-brand-red shadow-sm' : 'text-slate-400'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 border-t border-slate-50 pt-4 md:pt-6">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <span className="text-[8px] font-black text-slate-400 uppercase px-2">Marque</span>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {dynamicBrands.map(b => (
                <button key={b} onClick={() => setSelectedBrand(b)}
                  className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase border-2 transition-all whitespace-nowrap ${selectedBrand === b ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{b}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black text-slate-400 uppercase px-2">Stock</span>
            <div className="flex gap-2">
              {['Tous', 'En Stock', 'Rupture'].map(s => (
                <button key={s} onClick={() => setStockStatus(s)}
                  className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase border-2 transition-all ${stockStatus === s ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white border border-slate-100 rounded-[2rem] md:rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-6 text-center italic">Code</th>
                <th className="p-6">Article</th>
                <th className="p-6 text-center italic">ID Unique</th>
                <th className="p-6 text-center">Stock</th>
                <th className="p-6 text-center">Prix</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="p-32 text-center"><Loader2 className="animate-spin text-brand-red mx-auto" size={40}/></td></tr>
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="p-6 text-center"><span className="bg-brand-red/5 text-brand-red px-3 py-1 rounded-lg font-black text-[10px] italic">{p.product_code}</span></td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.quantity === 0 ? 'bg-red-50 text-red-300' : 'bg-slate-100 text-slate-400'}`}>
                        {p.category === 'Smartphone' ? <Smartphone size={16}/> : p.category === 'Laptop' ? <Laptop size={16}/> : <Package size={16}/>}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase italic text-xs tracking-tight">{getProductDisplayName(p)}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase italic">{getProductDetails(p)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center font-mono text-[10px] text-slate-400">{p.imei || p.mac_address || '---'}</td>
                  <td className="p-6 text-center font-black italic">{p.quantity}</td>
                  <td className="p-6 text-center font-black text-slate-900 italic text-sm">{p.selling_price.toLocaleString()} F</td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      {(user?.can_edit_stock || user?.role === 'admin') && (
                        <button onClick={() => { setEditItem(p); setIsModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
                          <Edit3 size={16}/>
                        </button>
                      )}
                      {user?.role === 'admin' && (
                        <button onClick={() => handleDelete(p)} className="p-3 bg-red-50 text-brand-red rounded-2xl hover:bg-brand-red hover:text-white transition-all">
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal isOpen={isModalOpen && !editItem} onClose={() => { setIsModalOpen(false); setEditItem(null); }} onSuccess={fetchProducts} />
      <EditProductModal isOpen={isModalOpen && !!editItem} onClose={() => { setIsModalOpen(false); setEditItem(null); }} onSuccess={fetchProducts} product={editItem} />
    </div>
  );
}