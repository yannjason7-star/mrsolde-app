"use client";
import { useState, useEffect } from 'react';
import { 
  Plus, Search, Smartphone, Filter, 
  MoreHorizontal, Loader2, ArrowUpRight, 
  PackageOpen, Hash 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AddProductModal from '@/components/AddProductModal';

// Interface pour le typage des produits
interface Product {
  id: number;
  product_code: string;
  name: string;
  brand: string;
  imei: string;
  selling_price: number;
  status: string;
  created_at: string;
}

export default function SmartphonesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fonction pour récupérer les smartphones en stock depuis Supabase
  const fetchSmartphones = async () => {
    if (!supabase) return; // Sécurité si le client n'est pas prêt
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Smartphone')
        .order('id', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
console.error("Détails de l'erreur :", JSON.stringify(error, null, 2));    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartphones();
  }, []);

  // Filtrage en temps réel par IMEI ou Modèle
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.imei?.includes(searchTerm) ||
    p.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-red/10 rounded-lg">
              <Smartphone className="text-brand-red" size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Stock Smartphones</h1>
          </div>
          <div className="h-1 w-32 bg-brand-red rounded-full"></div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-red hover:bg-red-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black transition-all shadow-2xl shadow-brand-red/30 active:scale-95 text-xs uppercase tracking-[2px]"
        >
          <Plus size={20} strokeWidth={3} />
          Ajouter au Stock
        </button>
      </div>

      {/* --- STATISTIQUES RAPIDES --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher IMEI, Modèle ou Code (SD1...)"
            className="w-full bg-brand-card/60 backdrop-blur-md border border-brand-border p-5 pl-14 rounded-2xl text-sm focus:outline-none focus:border-brand-red transition-all text-white font-medium placeholder:text-gray-600"
          />
        </div>
        
        <div className="bg-brand-card/60 border border-brand-border p-5 rounded-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">En Stock</span>
            <span className="text-2xl font-black text-white">{products.filter(p => p.status === 'En Stock').length}</span>
          </div>
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="text-green-500" size={20} />
          </div>
        </div>

        <div className="bg-brand-card/60 border border-brand-border p-5 rounded-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Valeur Stock</span>
            <span className="text-xl font-black text-brand-red">
              {products.reduce((acc, p) => acc + (p.status === 'En Stock' ? p.selling_price : 0), 0).toLocaleString()} F
            </span>
          </div>
        </div>
      </div>

      {/* --- TABLEAU DE STOCK --- */}
      <div className="bg-brand-card/40 backdrop-blur-xl border border-brand-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-brand-border">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Code ID</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Modèle & Marque</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Identifiant IMEI</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Prix de Vente</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Statut</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/30">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-20 text-center">
                  <Loader2 className="animate-spin text-brand-red mx-auto mb-4" size={40} />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Chargement du stock Mr. Solde...</p>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-20 text-center">
                  <PackageOpen size={48} className="text-gray-800 mx-auto mb-4 opacity-20" />
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Aucun téléphone trouvé</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <span className="bg-brand-red/10 text-brand-red px-3 py-1 rounded-lg font-black text-xs border border-brand-red/20">
                      {product.product_code || `SD${product.id}`}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{product.name}</span>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{product.brand}</span>
                    </div>
                  </td>
                  <td className="p-6 font-mono text-xs text-gray-400 group-hover:text-white transition-colors">
                    {product.imei}
                  </td>
                  <td className="p-6 font-black text-white text-sm">
                    {product.selling_price.toLocaleString()} FCFA
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[2px] border ${
                      product.status === 'En Stock' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : 'bg-brand-red/10 text-brand-red border-brand-red/20'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-600 hover:text-white">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL D'AJOUT --- */}
      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          fetchSmartphones(); // Rafraîchit la liste après un ajout réussi
        }}
      />
    </div>
  );
}