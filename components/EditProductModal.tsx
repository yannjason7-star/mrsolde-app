"use client";
import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logAction } from '@/lib/auditLogger';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: any; // Le produit à modifier
}

export default function EditProductModal({ isOpen, onClose, onSuccess, product }: EditProductModalProps) {
  const [quantity, setQuantity] = useState(product?.quantity || 1);
  const [price, setPrice] = useState(product?.selling_price?.toString() || '');
  const [loading, setLoading] = useState(false);

  // Mettre à jour les valeurs quand le produit change
  useEffect(() => {
    if (product) {
      setQuantity(product.quantity || 1);
      setPrice(product.selling_price?.toString() || '');
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;
    
    setLoading(true);
    
    const oldValues = {
      quantity: product.quantity,
      selling_price: product.selling_price,
    };
    
    const newValues = {
      quantity: quantity,
      selling_price: parseInt(price),
    };
    
    const { error } = await supabase
      .from('products')
      .update({
        quantity: quantity,
        selling_price: parseInt(price),
      })
      .eq('id', product.id);
    
    if (!error) {
      await logAction({
        action: 'UPDATE',
        entity_type: 'product',
        entity_id: product.id,
        old_values: oldValues,
        new_values: newValues,
      });
      onSuccess();
      onClose();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black italic uppercase">
            Modifier <span className="text-brand-red">l'article</span>
          </h2>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Infos produit (non modifiables) */}
          <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produit</p>
            <p className="font-black text-slate-900">{product?.brand} {product?.model}</p>
            <p className="text-xs text-slate-500">{product?.color} • {product?.storage} • {product?.ram ? product.ram + ' RAM' : ''}</p>
            {product?.imei && <p className="text-xs font-mono text-slate-400">IMEI: {product.imei}</p>}
            {product?.mac_address && <p className="text-xs font-mono text-slate-400">MAC: {product.mac_address}</p>}
          </div>

          {/* Quantité - MODIFIABLE */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Quantité</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))} 
              required 
              min="1" 
              className="w-full bg-slate-50 p-4 rounded-2xl font-black text-lg outline-none focus:ring-2 ring-brand-red/20" 
            />
          </div>

          {/* Prix - MODIFIABLE */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-green-500 uppercase tracking-widest px-4 italic">Prix Vente Unitaire</label>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
              className="w-full bg-green-50 p-4 rounded-2xl font-black italic text-lg outline-none focus:ring-2 ring-brand-red/20" 
            />
          </div>

          <button disabled={loading} className="w-full bg-slate-900 py-6 rounded-3xl font-black uppercase text-xs tracking-[4px] text-white shadow-2xl hover:scale-[1.02] transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto"/> : "METTRE À JOUR"}
          </button>
        </form>
      </div>
    </div>
  );
}