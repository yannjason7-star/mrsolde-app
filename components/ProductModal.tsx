"use client";
import { useState, useEffect } from 'react';
import { X, Check, Loader2, Info, Cpu, Palette, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// --- CATALOGUE EXHAUSTIF MR. SOLDE ---
const CATALOG: any = {
  Smartphone: {
    Apple: {
      "iPhone 16 Pro Max": { specs: ["256GB/8GB", "512GB/8GB", "1TB/8GB"], colors: ["Titane Désert", "Titane Naturel", "Titane Blanc", "Titane Noir"] },
      "iPhone 16 Pro": { specs: ["128GB/8GB", "256GB/8GB", "512GB/8GB", "1TB/8GB"], colors: ["Titane Désert", "Titane Naturel", "Titane Blanc", "Titane Noir"] },
      "iPhone 15 Pro Max": { specs: ["256GB/8GB", "512GB/8GB", "1TB/8GB"], colors: ["Titane Naturel", "Titane Bleu", "Titane Blanc", "Titane Noir"] },
      "iPhone 15": { specs: ["128GB/6GB", "256GB/6GB", "512GB/6GB"], colors: ["Noir", "Bleu", "Vert", "Jaune", "Rose"] },
      "iPhone 14 Pro Max": { specs: ["128GB/6GB", "256GB/6GB", "512GB/6GB", "1TB/6GB"], colors: ["Violet Intense", "Or", "Argent", "Noir Sidéral"] },
      "iPhone 13": { specs: ["128GB/4GB", "256GB/4GB", "512GB/4GB"], colors: ["Minuit", "Lumière Stellaire", "Bleu", "Rose", "Vert"] },
      "iPhone 12": { specs: ["64GB/4GB", "128GB/4GB", "256GB/4GB"], colors: ["Noir", "Blanc", "Bleu", "Vert", "Mauve"] },
      "iPhone 11": { specs: ["64GB/4GB", "128GB/4GB", "256GB/4GB"], colors: ["Noir", "Blanc", "Jaune", "Mauve", "Rouge", "Vert"] },
      "iPhone XR": { specs: ["64GB/3GB", "128GB/3GB"], colors: ["Noir", "Blanc", "Bleu", "Jaune", "Corail", "Rouge"] },
    },
    Samsung: {
      "Galaxy S24 Ultra": { specs: ["256GB/12GB", "512GB/12GB", "1TB/12GB"], colors: ["Titane Gris", "Titane Noir", "Titane Violet", "Titane Jaune"] },
      "Galaxy S23 Ultra": { specs: ["256GB/8GB", "512GB/12GB", "1TB/12GB"], colors: ["Phantom Black", "Cream", "Green", "Lavender"] },
      "Galaxy S22 Ultra": { specs: ["128GB/8GB", "256GB/12GB", "512GB/12GB"], colors: ["Burgundy", "Phantom Black", "White", "Green"] },
      "Galaxy S21 FE": { specs: ["128GB/6GB", "256GB/8GB"], colors: ["Graphite", "Olive", "Lavender", "White"] },
      "Galaxy Z Fold 6": { specs: ["256GB/12GB", "512GB/12GB", "1TB/12GB"], colors: ["Silver Shadow", "Pink", "Navy"] },
      "Galaxy Z Flip 6": { specs: ["256GB/12GB", "512GB/12GB"], colors: ["Blue", "Yellow", "Mint", "Silver Shadow"] },
      "Galaxy A55 5G": { specs: ["128GB/8GB", "256GB/8GB"], colors: ["Awesome Iceblue", "Awesome Navy", "Awesome Lilac"] },
      "Galaxy A35": { specs: ["128GB/6GB", "256GB/8GB"], colors: ["Awesome Navy", "Awesome Lemon"] },
    },
    Google: {
      "Pixel 9 Pro XL": { specs: ["128GB/16GB", "256GB/16GB", "512GB/16GB", "1TB/16GB"], colors: ["Porcelaine", "Quartz Rose", "Noisette", "Obsidienne"] },
      "Pixel 9": { specs: ["128GB/12GB", "256GB/12GB"], colors: ["Obsidienne", "Porcelaine", "Vert Hiver", "Rose Pivoine"] },
      "Pixel 8 Pro": { specs: ["128GB/12GB", "256GB/12GB", "512GB/12GB"], colors: ["Bleu Azur", "Porcelaine", "Noir Volcanique"] },
      "Pixel 7 Pro": { specs: ["128GB/8GB", "256GB/12GB", "512GB/12GB"], colors: ["Vert Sauge", "Neige", "Noir"] },
      "Pixel 6": { specs: ["128GB/8GB", "256GB/8GB"], colors: ["Noir Carbone", "Gris Océan", "Corail"] },
    }
  },
  Tablette: {
    Apple: {
      "iPad Pro 13 (M4)": { specs: ["256GB/8GB", "512GB/8GB", "1TB/16GB", "2TB/16GB"], colors: ["Noir Sidéral", "Argent"] },
      "iPad Air 11 (M2)": { specs: ["128GB", "256GB", "512GB", "1TB"], colors: ["Gris Sidéral", "Bleu", "Mauve", "Lumière Stellaire"] },
      "iPad 10th Gen": { specs: ["64GB", "256GB"], colors: ["Bleu", "Rose", "Jaune", "Argent"] },
      "iPad Mini 6": { specs: ["64GB", "256GB"], colors: ["Gris Sidéral", "Rose", "Mauve", "Lumière Stellaire"] },
    },
    Samsung: {
      "Galaxy Tab S9 Ultra": { specs: ["256GB/12GB", "512GB/12GB", "1TB/16GB"], colors: ["Anthracite", "Crème"] },
      "Galaxy Tab S9 FE": { specs: ["128GB/6GB", "256GB/8GB"], colors: ["Gris", "Menthe", "Argent", "Lavande"] },
      "Galaxy Tab A9+": { specs: ["64GB/4GB", "128GB/8GB"], colors: ["Graphite", "Argent", "Marine"] },
    }
  },
  Laptop: {
    HP: {
      "EliteBook 840 G10": { specs: ["512GB/16GB", "1TB/32GB"], colors: ["Argent", "Noir"] },
      "Spectre x360 14": { specs: ["512GB/16GB", "1TB/16GB", "2TB/32GB"], colors: ["Noir Nocturne", "Bleu Poséidon"] },
      "Pavilion 15": { specs: ["256GB/8GB", "512GB/16GB"], colors: ["Noir", "Blanc"] },
      "ProBook 450 G9": { specs: ["512GB/8GB", "512GB/16GB"], colors: ["Argent"] },
      "Envy x360": { specs: ["512GB/16GB"], colors: ["Noir"] },
      "Victus 16": { specs: ["512GB/16GB", "1TB/16GB"], colors: ["Noir Performance"] },
      "OMEN 17": { specs: ["1TB/32GB"], colors: ["Noir"] },
      "ZBook Firefly": { specs: ["512GB/32GB"], colors: ["Gris"] },
      "HP 250 G9": { specs: ["256GB/8GB"], colors: ["Noir"] },
      "HP Laptop 17": { specs: ["512GB/16GB"], colors: ["Blanc"] },
    },
    DELL: {
      "XPS 13 Plus": { specs: ["512GB/16GB", "1TB/32GB"], colors: ["Graphite", "Platine"] },
      "Latitude 5440": { specs: ["256GB/8GB", "512GB/16GB"], colors: ["Gris Titan"] },
      "Inspiron 16": { specs: ["512GB/16GB", "1TB/16GB"], colors: ["Noir", "Argent"] },
      "Precision 3581": { specs: ["512GB/16GB", "1TB/32GB"], colors: ["Gris"] },
      "Alienware m18": { specs: ["1TB/32GB", "2TB/64GB"], colors: ["Dark Metallic Moon"] },
      "Vostro 3520": { specs: ["256GB/8GB", "512GB/16GB"], colors: ["Noir"] },
      "G15 Gaming": { specs: ["512GB/16GB"], colors: ["Gris Fantôme"] },
      "OptiPlex Micro": { specs: ["512GB/16GB"], colors: ["Noir"] },
      "Latitude 7440": { specs: ["512GB/16GB"], colors: ["Aluminium"] },
      "DELL XPS 15": { specs: ["1TB/32GB"], colors: ["Noir"] },
    },
    Apple: {
      "MacBook Pro 16 (M3 Max)": { specs: ["1TB/36GB", "2TB/64GB", "4TB/128GB"], colors: ["Noir Sidéral", "Argent"] },
      "MacBook Pro 14 (M3 Pro)": { specs: ["512GB/18GB", "1TB/18GB"], colors: ["Noir Sidéral", "Argent"] },
      "MacBook Air 15 (M3)": { specs: ["256GB/8GB", "512GB/16GB", "1TB/16GB"], colors: ["Minuit", "Lumière Stellaire", "Gris Sidéral", "Argent"] },
      "MacBook Air 13 (M2)": { specs: ["256GB/8GB", "512GB/8GB"], colors: ["Minuit", "Lumière Stellaire", "Gris Sidéral", "Argent"] },
      "MacBook Air 13 (M1)": { specs: ["256GB/8GB"], colors: ["Gris Sidéral", "Argent", "Or"] },
      "iMac 24 (M3)": { specs: ["256GB/8GB", "512GB/16GB"], colors: ["Bleu", "Vert", "Rose", "Argent"] },
      "Mac Mini (M2)": { specs: ["256GB/8GB", "512GB/16GB"], colors: ["Argent"] },
      "Mac Studio": { specs: ["1TB/64GB"], colors: ["Argent"] },
      "MacBook Pro 13 (M2)": { specs: ["256GB/8GB"], colors: ["Gris Sidéral"] },
      "iPad Pro 12.9 (M2)": { specs: ["128GB/8GB"], colors: ["Argent"] },
    }
  },
  Accessoire: {
    Chargeur: {
      brands: ["Apple", "Samsung", "Huawei", "Autre"],
      models: ["Chargeur 20W USB-C", "Chargeur 25W Super Fast", "Chargeur 45W PD", "Chargeur 67W Turbo", "Chargeur 96W MacBook"],
    },
    Ecouteur: {
      brands: ["Apple", "Samsung", "Google", "Sony"],
      models: ["AirPods Pro (2nd Gen)", "AirPods 3rd Gen", "AirPods 4th Gen", "Galaxy Buds 3 Pro", "Pixel Buds Pro 2"],
    },
    Pochette: {
      brands: ["Apple", "Samsung", "Tablette"],
      models: ["Silicone Case", "Leather Case", "Rugged Armor", "Smart Folio"],
      colors: ["Marron", "Blanc", "Bleu", "Vert", "Jaune", "Stylé"]
    }
  }
};

export default function ProductModal({ isOpen, onClose, onSuccess, editProduct = null }: any) {
  const [loading, setLoading] = useState(false);
  const [cat, setCat] = useState('Smartphone');
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [accType, setAccType] = useState('Chargeur');

  const isEdit = !!editProduct;

  useEffect(() => {
    if (editProduct) {
      setCat(editProduct.category);
      setBrand(editProduct.brand);
      setModel(editProduct.model);
    } else {
      const firstBrand = Object.keys(CATALOG[cat] || {})[0];
      setBrand(firstBrand || '');
      const firstModel = CATALOG[cat]?.[firstBrand] ? Object.keys(CATALOG[cat][firstBrand])[0] : (cat === 'Accessoire' ? CATALOG.Accessoire[accType].models[0] : '');
      setModel(firstModel);
    }
  }, [cat, accType, isOpen, editProduct]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const f = e.target;

    // VALIDATION MAC STRICTE
    if (cat === 'Laptop' && !isEdit) {
      const macRegex = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;
      if (!macRegex.test(f.mac.value)) return alert("ERREUR : L'adresse MAC doit être au format XX:XX:XX:XX:XX:XX (Ex: 00:1A:2B:3C:4D:5E)");
    }

    // VALIDATION IMEI
    if ((cat === 'Smartphone' || cat === 'Tablette') && !isEdit) {
      if (!/^\d{15}$/.test(f.imei.value)) return alert("ERREUR : L'IMEI doit comporter exactement 15 chiffres.");
    }

    setLoading(true);
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    const newQty = parseInt(f.quantity.value);
    const addedQty = isEdit ? (newQty - editProduct.quantity) : newQty;

    const payload = {
      category: cat,
      brand: cat === 'Accessoire' ? brand : brand,
      model: cat === 'Accessoire' ? f.model_acc.value : model,
      color: f.color?.value || 'N/A',
      storage: f.storage?.value || 'N/A',
      imei: isEdit ? editProduct.imei : (f.imei?.value || null),
      mac_address: isEdit ? editProduct.mac_address : (f.mac?.value || null),
      quantity: newQty,
      selling_price: parseInt(f.price.value),
      status: newQty > 0 ? 'En Stock' : 'Rupture'
    };

    try {
      const { error } = isEdit 
        ? await supabase.from('products').update({ quantity: payload.quantity, selling_price: payload.selling_price }).eq('id', editProduct.id)
        : await supabase.from('products').insert([payload]);

      if (!error) {
        // Enregistrer les logs pour le graph
        if (addedQty > 0) {
            await supabase.from('stock_movements').insert([{
              type: 'ENTREE',
              product_name: payload.model,
              quantity: addedQty,
              user_name: user.full_name
            }]);
        }
        
        await supabase.from('activity_logs').insert([{
          user_id: parseInt(user.id),
          user_name: user.full_name,
          action_type: isEdit ? 'MODIFICATION' : 'STOCK',
          details: `${isEdit ? 'Ajusté' : 'Ajouté'} ${addedQty}x ${payload.model}`,
          amount: 0
        }]);

        onSuccess();
        onClose();
      } else {
        alert(error.message);
      }
    } catch (e:any) { alert(e.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-8 lg:p-12 max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        <div className="flex justify-between items-center mb-8 italic">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">
            {isEdit ? 'Ajuster' : 'Nouvelle Entrée'} <span className="text-brand-red">Stock</span>
          </h2>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl hover:bg-brand-red hover:text-white transition-all"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. CATÉGORIE (Bloqué en modif) */}
          <div className={`col-span-2 flex bg-slate-100 p-2 rounded-3xl gap-2 ${isEdit ? 'opacity-40 pointer-events-none' : ''}`}>
            {['Smartphone', 'Tablette', 'Laptop', 'Accessoire'].map(c => (
              <button key={c} type="button" onClick={() => setCat(c)}
                className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase transition-all ${cat === c ? 'bg-white shadow-xl text-brand-red scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>{c}</button>
            ))}
          </div>

          {/* --- LOGIQUE PRODUITS (PHONE / TABLET / LAPTOP) --- */}
          {cat !== 'Accessoire' ? (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 px-4">Marque</label>
                <select disabled={isEdit} value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-slate-50 p-5 rounded-3xl font-bold outline-none appearance-none disabled:bg-slate-100 disabled:text-slate-400">
                  {Object.keys(CATALOG[cat] || {}).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 px-4">Modèle exact</label>
                <select disabled={isEdit} value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-slate-50 p-5 rounded-3xl font-bold outline-none appearance-none disabled:bg-slate-100 disabled:text-slate-400">
                  {Object.keys(CATALOG[cat]?.[brand] || {}).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {!isEdit && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4 flex items-center gap-2"><Cpu size={12}/> RAM & Stockage</label>
                    <select name="storage" className="w-full bg-slate-50 p-5 rounded-3xl font-bold outline-none">
                      {CATALOG[cat]?.[brand]?.[model]?.specs.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 px-4 flex items-center gap-2"><Palette size={12}/> Couleur d'origine</label>
                    <select name="color" className="w-full bg-slate-50 p-5 rounded-3xl font-bold outline-none">
                      {CATALOG[cat]?.[brand]?.[model]?.colors.map((c: string) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}
            </>
          ) : (
            /* --- LOGIQUE ACCESSOIRES --- */
            <>
              <div className={`col-span-2 flex bg-slate-900 p-2 rounded-3xl gap-2 ${isEdit ? 'opacity-40 pointer-events-none' : ''}`}>
                {['Chargeur', 'Ecouteur', 'Pochette'].map(t => (
                  <button key={t} type="button" onClick={() => setAccType(t)}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${accType === t ? 'bg-brand-red text-white' : 'text-slate-500'}`}>{t}</button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 px-4 italic">Type de {accType}</label>
                <select disabled={isEdit} name="model_acc" className="w-full bg-slate-50 p-5 rounded-3xl font-bold outline-none disabled:bg-slate-100">
                  {CATALOG.Accessoire[accType].models?.map((m:any) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 px-4 italic">Marque / Compatibilité</label>
                <select disabled={isEdit} value={brand} onChange={(e)=>setBrand(e.target.value)} className="w-full bg-slate-50 p-5 rounded-3xl font-bold outline-none disabled:bg-slate-100">
                  {CATALOG.Accessoire[accType].brands.map((b:any) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {accType === 'Pochette' && !isEdit && (
                <div className="col-span-2 space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-4 italic">Couleur Pochette</label>
                   <select name="color" className="w-full bg-slate-50 p-5 rounded-3xl font-bold">
                      {CATALOG.Accessoire.Pochette.colors.map((c:any) => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
              )}
            </>
          )}

          {/* --- IDENTIFIANTS TECHNIQUES (Cachés en modif) --- */}
          {!isEdit && (
            <div className="col-span-2 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
               {cat === 'Laptop' ? (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-red uppercase px-4 italic flex items-center gap-2"><Info size={12}/> Adresse MAC (Requis)</label>
                    <input name="mac" required placeholder="XX:XX:XX:XX:XX:XX" className="w-full bg-white p-5 rounded-2xl font-mono text-sm border-2 border-transparent focus:border-brand-red/20 outline-none" />
                    <p className="text-[9px] text-slate-400 px-4 font-bold uppercase italic tracking-widest">Utilisez obligatoirement les deux-points (:)</p>
                 </div>
               ) : cat !== 'Accessoire' ? (
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-brand-red uppercase px-4 italic flex items-center gap-2"><Info size={12}/> Numéro IMEI (Requis)</label>
                    <input name="imei" required maxLength={15} placeholder="Entrez les 15 chiffres" className="w-full bg-white p-5 rounded-2xl font-mono text-sm border-2 border-transparent focus:border-brand-red/20 outline-none" />
                 </div>
               ) : (
                 <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-4">Informations techniques simplifiées pour accessoires</p>
               )}
            </div>
          )}

          {/* --- PRIX ET QUANTITÉ (Toujours modifiable) --- */}
          <div className="space-y-1 bg-brand-red/5 p-4 rounded-3xl border border-brand-red/10">
            <label className="text-[10px] font-black uppercase text-brand-red px-4 italic underline">Quantité en Stock</label>
            <input name="quantity" type="number" required defaultValue={editProduct?.quantity || "1"} min="0" className="w-full bg-white p-5 rounded-2xl font-black text-2xl italic outline-none text-slate-900 border-2 border-transparent focus:border-slate-200 shadow-sm" />
          </div>

          <div className="space-y-1 bg-green-50 p-4 rounded-3xl border border-green-100">
            <label className="text-[10px] font-black uppercase text-green-600 px-4 italic underline">Prix Vente Unitaire (F)</label>
            <input name="price" type="number" required defaultValue={editProduct?.selling_price} className="w-full bg-white p-5 rounded-2xl font-black text-2xl italic outline-none border-2 border-transparent focus:border-green-200 shadow-sm" />
          </div>

          <button disabled={loading} className="col-span-2 bg-slate-900 hover:bg-black text-white py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-[6px] shadow-2xl transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 mt-4">
            {loading ? <Loader2 className="animate-spin" /> : isEdit ? "Valider les changements" : "Finaliser l'Arrivage"}
          </button>
        </form>
      </div>
    </div>
  );
}