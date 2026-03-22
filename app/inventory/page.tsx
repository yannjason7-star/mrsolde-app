"use client";
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Filter, Smartphone, Laptop, Tablet, 
  Package, Trash2, Edit3, Loader2, X, ChevronDown, 
  AlertCircle, CheckCircle2, ShoppingBag, Layers
} from 'lucide-react';
import ProductModal from '@/components/ProductModal';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // --- ÉTATS DES FILTRES DE PRÉCISION ---
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Tous");
  const [selectedBrand, setSelectedBrand] = useState("Toutes");
  const [stockStatus, setStockStatus] = useState("Tous"); // "Tous", "En Stock", "Rupture", "Faible"

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

  // --- LOGIQUE DE FILTRAGE DYNAMIQUE ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Recherche texte (Modèle, Code, IMEI)
      const matchSearch = p.model.toLowerCase().includes(search.toLowerCase()) || 
                          p.product_code.toLowerCase().includes(search.toLowerCase()) ||
                          p.imei?.includes(search);
      
      // 2. Filtre Catégorie
      const matchCat = selectedCat === "Tous" || p.category === selectedCat;

      // 3. Filtre Marque (dépend de la catégorie)
      const matchBrand = selectedBrand === "Toutes" || p.brand === selectedBrand;

      // 4. Filtre Statut Stock (Précision)
      let matchStock = true;
      if (stockStatus === "En Stock") matchStock = p.quantity > 0;
      if (stockStatus === "Rupture") matchStock = p.quantity === 0;
      if (stockStatus === "Faible") matchStock = p.quantity > 0 && p.quantity <= 5;

      return matchSearch && matchCat && matchBrand && matchStock;
    });
  }, [products, search, selectedCat, selectedBrand, stockStatus]);

  // Récupérer les marques disponibles UNIQUEMENT pour la catégorie sélectionnée
  const dynamicBrands = useMemo(() => {
    const brands = products
      .filter(p => selectedCat === "Tous" || p.category === selectedCat)
      .map(p => p.brand);
    return ["Toutes", ...Array.from(new Set(brands))];
  }, [products, selectedCat]);

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-6 animate-in fade-in duration-1000">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Inventaire <span className="text-brand-red underline decoration-brand-red/10">Global</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[5px] mt-2 italic">Gestion de précision Mr. Solde</p>
        </div>
        {user?.role === 'manager' && (
          <button onClick={() => { setEditItem(null); setIsModalOpen(true); }} className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[4px] shadow-2xl hover:scale-105 transition-all">
            + Nouvel Arrivage
          </button>
        )}
      </div>

      {/* --- SMART FILTER HUB (UX EXPERT) --- */}
      <div className="glass-card p-6 mb-10 space-y-6 bg-white/70 backdrop-blur-xl border-slate-100 sticky top-4 z-40">
        
        {/* LIGNE 1 : RECHERCHE ET CATÉGORIES */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" placeholder="Rechercher par modèle, IMEI ou code..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-100 p-5 pl-14 rounded-3xl font-bold text-sm outline-none focus:ring-2 ring-brand-red/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-3xl gap-1 w-full lg:w-auto">
            {[
              { id: 'Tous', icon: Layers },
              { id: 'Smartphone', icon: Smartphone },
              { id: 'Laptop', icon: Laptop },
              { id: 'Accessoire', icon: Package }
            ].map(c => (
              <button key={c.id} onClick={() => { setSelectedCat(c.id); setSelectedBrand("Toutes"); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${selectedCat === c.id ? 'bg-white text-brand-red shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                <c.icon size={14}/>
                {c.id}
              </button>
            ))}
          </div>
        </div>

        {/* LIGNE 2 : SOUS-FILTRES PRÉCIS (MARQUE & STATUT) */}
        <div className="flex flex-wrap gap-4 border-t border-slate-50 pt-6">
          
          {/* Sélecteur de Marque Dynamique */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase px-4 italic">Filtrer par Marque</span>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {dynamicBrands.map(b => (
                <button key={b} onClick={() => setSelectedBrand(b)}
                  className={`px-5 py-2 rounded-full text-[9px] font-black uppercase border-2 transition-all whitespace-nowrap ${selectedBrand === b ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden lg:block"></div>

          {/* Sélecteur de Statut de Stock */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase px-4 italic">État du Stock</span>
            <div className="flex gap-2">
              {[
                {id: "Tous", color: "border-slate-100 text-slate-400"},
                {id: "En Stock", color: "border-green-100 text-green-600 bg-green-50/30"},
                {id: "Faible", color: "border-orange-100 text-orange-500 bg-orange-50/30"},
                {id: "Rupture", color: "border-brand-red/10 text-brand-red bg-brand-red/5"}
              ].map(s => (
                <button key={s.id} onClick={() => setStockStatus(s.id)}
                  className={`px-5 py-2 rounded-full text-[9px] font-black uppercase border-2 transition-all ${stockStatus === s.id ? 'bg-slate-900 border-slate-900 text-white' : s.color}`}>
                  {s.id}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton Reset */}
          <button 
            onClick={() => { setSearch(""); setSelectedCat("Tous"); setSelectedBrand("Toutes"); setStockStatus("Tous"); }}
            className="ml-auto flex items-center gap-2 text-[9px] font-black uppercase text-brand-red hover:bg-brand-red/5 px-4 py-2 rounded-xl transition-all"
          >
            <X size={14}/> Réinitialiser filtres
          </button>
        </div>
      </div>

      {/* --- TABLEAU DE RÉSULTATS --- */}
      <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-6 text-center italic">Code</th>
                <th className="p-6">Article & Détails</th>
                <th className="p-6 text-center italic">Identifiant unique</th>
                <th className="p-6 text-center">Quantité</th>
                <th className="p-6 text-center">Prix Unitaire</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="p-32 text-center"><Loader2 className="animate-spin text-brand-red mx-auto" size={40}/></td></tr>
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="p-6 text-center">
                    <span className="bg-brand-red/5 text-brand-red px-3 py-1 rounded-lg font-black text-[10px] italic border border-brand-red/10">
                      {p.product_code}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${p.quantity === 0 ? 'bg-brand-red/5 text-brand-red' : 'bg-slate-100 text-slate-400'}`}>
                        {p.category === 'Smartphone' && <Smartphone size={18}/>}
                        {p.category === 'Laptop' && <Laptop size={18}/>}
                        {p.category === 'Tablette' && <Tablet size={18}/>}
                        {p.category === 'Accessoire' && <Package size={18}/>}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase italic text-xs tracking-tight">{p.brand} {p.model}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[8px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-400">{p.color}</span>
                          {p.storage && <span className="text-[8px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-brand-red">{p.storage}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center font-mono text-[10px] text-slate-400 tracking-tighter">
                    {p.imei || p.mac_address || <span className="opacity-20 italic">Stock de masse</span>}
                  </td>
                  <td className="p-6 text-center">
                    <span className={`font-black italic text-sm ${p.quantity === 0 ? 'text-brand-red' : p.quantity <= 5 ? 'text-orange-500' : 'text-slate-900'}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="p-6 text-center font-black text-slate-900 italic text-sm">
                    {p.selling_price.toLocaleString()} F
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      {(user?.can_edit_stock || user?.role === 'admin') && (
                        <button onClick={() => { setEditItem(p); setIsModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900"><Edit3 size={16}/></button>
                      )}
                      {user?.role === 'admin' && (
                        <button onClick={async () => { if(confirm('Supprimer cet article ?')) { await supabase.from('products').delete().eq('id', p.id); fetchProducts(); } }} className="p-3 bg-red-50 text-brand-red rounded-2xl hover:bg-brand-red hover:text-white transition-all"><Trash2 size={16}/></button>
                      )}
                      {user?.role === 'seller' && <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest px-4">Lecture</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && !loading && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <ShoppingBag size={48} className="text-slate-100" />
              <p className="text-[10px] font-black uppercase text-slate-300 tracking-[5px]">Aucun article ne correspond à vos filtres</p>
            </div>
          )}
        </div>
      </div>

      <ProductModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditItem(null); }} onSuccess={fetchProducts} editProduct={editItem} />
    </div>
  );
}