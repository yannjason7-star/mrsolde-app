"use client";
import { useState, useEffect } from 'react';
import { X, Smartphone, Tablet, Laptop, Package, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logAction } from '@/lib/auditLogger';

// Types
type Brand = { id: number; name: string };
type Model = { id: number; name: string; brand_id: number };
type Color = { id: number; name: string };
type Storage = { id: number; value: string };
type Ram = { id: number; value: string };
type Category = { id: number; name: string };

// Données initiales pour les modèles pré-définis (fallback)
const DEFAULT_MODELS_BY_BRAND: Record<string, string[]> = {
  Apple: ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14", "iPhone 13", "iPhone SE (3rd gen)"],
  Samsung: ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S23 Ultra", "Galaxy S23+", "Galaxy S23", "Galaxy A55", "Galaxy A35", "Galaxy Z Fold 6", "Galaxy Z Flip 6"],
  Google: ["Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 8 Pro", "Pixel 8", "Pixel 7a"]
};

export default function AddProductModal({ isOpen, onClose, onSuccess }: any) {
  const [cat, setCat] = useState('Smartphone');
  const [brand, setBrand] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [storages, setStorages] = useState<Storage[]>([]);
  const [rams, setRams] = useState<Ram[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // États pour les selects
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedRam, setSelectedRam] = useState('');
  const [imei, setImei] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [customModel, setCustomModel] = useState(''); // pour accessoire

  // Popup states
  const [showBrandPopup, setShowBrandPopup] = useState(false);
  const [showModelPopup, setShowModelPopup] = useState(false);
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [showStoragePopup, setShowStoragePopup] = useState(false);
  const [showRamPopup, setShowRamPopup] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  // Charger les données
  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, cat]);

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      // Marques selon catégorie
      const { data: brandsData } = await supabase
        .from('brands')
        .select('*')
        .eq('category', cat)
        .order('name');
      setBrands(brandsData || []);
      if (brandsData?.length && !selectedBrand) {
        setSelectedBrand(brandsData[0].name);
        setBrand(brandsData[0].name);
      }

      // Couleurs
      const { data: colorsData } = await supabase.from('colors').select('*').order('name');
      setColors(colorsData || []);

      // Stockages
      const { data: storagesData } = await supabase.from('storages').select('*').order('value');
      setStorages(storagesData || []);

      // RAM
      const { data: ramsData } = await supabase.from('rams').select('*').order('value');
      setRams(ramsData || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Charger les modèles quand la marque change
  useEffect(() => {
    if (selectedBrand && cat !== 'Accessoire') {
      loadModels();
    }
  }, [selectedBrand]);

  const loadModels = async () => {
    const brandObj = brands.find(b => b.name === selectedBrand);
    if (!brandObj) return;
    
    try {
      const { data: modelsData } = await supabase
        .from('models')
        .select('*')
        .eq('brand_id', brandObj.id)
        .order('name');
      if (modelsData && modelsData.length > 0) {
        setModels(modelsData);
      } else {
        const defaultModels = DEFAULT_MODELS_BY_BRAND[selectedBrand] || [];
        setModels(defaultModels.map(m => ({ id: 0, name: m, brand_id: brandObj.id, is_custom: false })));
      }
      if (modelsData?.length && !selectedModel) setSelectedModel(modelsData[0].name);
    } catch (error) {
      console.error("Erreur chargement modèles:", error);
    }
  };

  // Vérifier IMEI unique
  const checkImeiExists = async (imeiValue: string) => {
    const { data } = await supabase
      .from('products')
      .select('imei')
      .eq('imei', imeiValue)
      .maybeSingle();
    return !!data;
  };

  // Ajouter une marque
  const handleAddBrand = async () => {
    if (!newItemName.trim()) return;
    try {
      const { data: existing } = await supabase
        .from('brands')
        .select('id')
        .eq('name', newItemName.trim())
        .eq('category', cat)
        .maybeSingle();
      
      if (existing) {
        alert("Cette marque existe déjà !");
        setShowBrandPopup(false);
        setNewItemName('');
        return;
      }

      const { data: newBrand, error } = await supabase
        .from('brands')
        .insert([{ name: newItemName.trim(), category: cat }])
        .select()
        .single();
      if (error) throw error;
      setBrands(prev => [...prev, newBrand]);
      setSelectedBrand(newBrand.name);
      setBrand(newBrand.name);
      setShowBrandPopup(false);
      setNewItemName('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Ajouter un modèle
  const handleAddModel = async () => {
    if (!newItemName.trim() || !selectedBrand) return;
    const brandObj = brands.find(b => b.name === selectedBrand);
    if (!brandObj) return;
    
    try {
      const { data: existing } = await supabase
        .from('models')
        .select('id')
        .eq('brand_id', brandObj.id)
        .eq('name', newItemName.trim())
        .maybeSingle();
      
      if (existing) {
        alert("Ce modèle existe déjà !");
        setShowModelPopup(false);
        setNewItemName('');
        return;
      }

      const { data: newModel, error } = await supabase
        .from('models')
        .insert([{ name: newItemName.trim(), brand_id: brandObj.id }])
        .select()
        .single();
      if (error) throw error;
      setModels(prev => [...prev, newModel]);
      setSelectedModel(newModel.name);
      setShowModelPopup(false);
      setNewItemName('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Ajouter une couleur
  const handleAddColor = async () => {
    if (!newItemName.trim()) return;
    try {
      const { data: existing } = await supabase
        .from('colors')
        .select('id')
        .eq('name', newItemName.trim())
        .maybeSingle();
      
      if (existing) {
        alert("Cette couleur existe déjà !");
        setShowColorPopup(false);
        setNewItemName('');
        return;
      }

      const { data: newColor, error } = await supabase
        .from('colors')
        .insert([{ name: newItemName.trim() }])
        .select()
        .single();
      if (error) throw error;
      setColors(prev => [...prev, newColor]);
      setSelectedColor(newColor.name);
      setShowColorPopup(false);
      setNewItemName('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Ajouter un stockage
  const handleAddStorage = async () => {
    if (!newItemName.trim()) return;
    try {
      const { data: existing } = await supabase
        .from('storages')
        .select('id')
        .eq('value', newItemName.trim())
        .maybeSingle();
      
      if (existing) {
        alert("Ce stockage existe déjà !");
        setShowStoragePopup(false);
        setNewItemName('');
        return;
      }

      const { data: newStorage, error } = await supabase
        .from('storages')
        .insert([{ value: newItemName.trim() }])
        .select()
        .single();
      if (error) throw error;
      setStorages(prev => [...prev, newStorage]);
      setSelectedStorage(newStorage.value);
      setShowStoragePopup(false);
      setNewItemName('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Ajouter une RAM
  const handleAddRam = async () => {
    if (!newItemName.trim()) return;
    try {
      const { data: existing } = await supabase
        .from('rams')
        .select('id')
        .eq('value', newItemName.trim())
        .maybeSingle();
      
      if (existing) {
        alert("Cette RAM existe déjà !");
        setShowRamPopup(false);
        setNewItemName('');
        return;
      }

      const { data: newRam, error } = await supabase
        .from('rams')
        .insert([{ value: newItemName.trim() }])
        .select()
        .single();
      if (error) throw error;
      setRams(prev => [...prev, newRam]);
      setSelectedRam(newRam.value);
      setShowRamPopup(false);
      setNewItemName('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation IMEI
    if ((cat === 'Smartphone' || cat === 'Tablette') && imei) {
      if (!/^\d{15}$/.test(imei)) {
        return alert("L'IMEI doit comporter 15 chiffres exactement.");
      }
      const exists = await checkImeiExists(imei);
      if (exists) return alert("Cet IMEI existe déjà dans la base.");
    }

    // Validation MAC
    if (cat === 'Laptop' && macAddress) {
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macRegex.test(macAddress)) {
        return alert("Adresse MAC invalide (ex: XX:XX:XX:XX:XX:XX)");
      }
    }

    setLoading(true);
    
    const productData: any = {
      category: cat,
      brand: selectedBrand,
      model: cat === 'Accessoire' ? customModel : selectedModel,
      color: selectedColor || 'N/A',
      storage: selectedStorage || 'N/A',
      ram: selectedRam || null,
      quantity: quantity,
      selling_price: parseInt(price),
    };

    if (cat === 'Smartphone' || cat === 'Tablette') productData.imei = imei;
    if (cat === 'Laptop') productData.mac_address = macAddress;

    const { data: inserted, error } = await supabase
      .from('products')
      .insert([productData])
      .select();

    if (!error && inserted) {
      // ENREGISTRER DANS L'AUDIT
      await logAction({
        action: 'CREATE',
        entity_type: 'product',
        entity_id: inserted[0]?.id,
        new_values: productData,
      });
      
      onSuccess();
      onClose();
      
      // Réinitialisation
      setSelectedBrand('');
      setSelectedModel('');
      setSelectedColor('');
      setSelectedStorage('');
      setSelectedRam('');
      setImei('');
      setMacAddress('');
      setQuantity(1);
      setPrice('');
      setCustomModel('');
    } else if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const Popup = ({ isOpen, onClose, onConfirm, title }: any) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-6 w-96 max-w-[90%]">
          <h3 className="font-black text-lg mb-4">{title}</h3>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none mb-4"
            placeholder="Nom..."
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
          />
          <div className="flex gap-3">
            <button onClick={onConfirm} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black text-sm">Ajouter</button>
            <button onClick={onClose} className="flex-1 bg-slate-100 py-3 rounded-2xl font-black text-sm">Annuler</button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
        <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black italic uppercase">Nouvel <span className="text-brand-red">Arrivage</span></h2>
            <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl"><X size={20}/></button>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-red" size={40}/></div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              
              {/* Catégories */}
              <div className="col-span-2 flex bg-slate-100 p-2 rounded-3xl gap-2">
                {['Smartphone', 'Tablette', 'Laptop', 'Accessoire'].map(c => (
                  <button key={c} type="button" onClick={() => { setCat(c); setSelectedBrand(''); }}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${cat === c ? 'bg-white shadow text-brand-red' : 'text-slate-400'}`}>
                    {c}
                  </button>
                ))}
              </div>

              {/* Marque */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Marque</label>
                <div className="flex gap-2 items-center">
                  <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none" required>
                    <option value="">Sélectionner une marque</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                  <button type="button" onClick={() => setShowBrandPopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Modèle */}
              {cat !== 'Accessoire' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Modèle</label>
                  <div className="flex gap-2 items-center">
                    <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none" required>
                      <option value="">Sélectionner un modèle</option>
                      {models.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowModelPopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Modèle / Référence</label>
                  <input type="text" value={customModel} onChange={(e) => setCustomModel(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none" placeholder="Nom du modèle" />
                </div>
              )}

              {/* Couleur */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Couleur</label>
                <div className="flex gap-2 items-center">
                  <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none">
                    <option value="">Sélectionner une couleur</option>
                    {colors.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <button type="button" onClick={() => setShowColorPopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Stockage */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Stockage</label>
                <div className="flex gap-2 items-center">
                  <select value={selectedStorage} onChange={(e) => setSelectedStorage(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none">
                    <option value="">Sélectionner un stockage</option>
                    {storages.map(s => <option key={s.id} value={s.value}>{s.value}</option>)}
                  </select>
                  <button type="button" onClick={() => setShowStoragePopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* RAM (uniquement pour smartphones/tablettes/laptops) */}
              {(cat === 'Smartphone' || cat === 'Tablette' || cat === 'Laptop') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">RAM</label>
                  <div className="flex gap-2 items-center">
                    <select value={selectedRam} onChange={(e) => setSelectedRam(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none">
                      <option value="">Sélectionner la RAM</option>
                      {rams.map(r => <option key={r.id} value={r.value}>{r.value}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowRamPopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* IMEI / MAC */}
              {cat === 'Laptop' ? (
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-brand-red uppercase tracking-widest px-4 italic underline">Adresse MAC</label>
                  <input type="text" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} placeholder="XX:XX:XX:XX:XX:XX" className="w-full bg-slate-50 p-4 rounded-2xl font-mono text-sm outline-none" />
                </div>
              ) : (cat === 'Smartphone' || cat === 'Tablette') && (
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-brand-red uppercase tracking-widest px-4 italic underline">IMEI (15 Chiffres)</label>
                  <input type="text" value={imei} onChange={(e) => setImei(e.target.value)} maxLength={15} placeholder="15 chiffres uniques" className="w-full bg-slate-50 p-4 rounded-2xl font-mono text-sm outline-none" />
                </div>
              )}

              {/* Quantité */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Quantité</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} required min="1" className="w-full bg-slate-50 p-4 rounded-2xl font-black text-lg outline-none" />
              </div>

              {/* Prix */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-green-500 uppercase tracking-widest px-4 italic">Prix Vente Unitaire</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full bg-green-50 p-4 rounded-2xl font-black italic text-lg outline-none" />
              </div>

              <button disabled={loading} className="col-span-2 bg-slate-900 py-6 rounded-3xl font-black uppercase text-xs tracking-[4px] text-white shadow-2xl hover:scale-[1.02] transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto"/> : "VALIDER L'ARTICLE"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Popups */}
      <Popup isOpen={showBrandPopup} onClose={() => setShowBrandPopup(false)} onConfirm={handleAddBrand} title="Nouvelle marque" />
      <Popup isOpen={showModelPopup} onClose={() => setShowModelPopup(false)} onConfirm={handleAddModel} title="Nouveau modèle" />
      <Popup isOpen={showColorPopup} onClose={() => setShowColorPopup(false)} onConfirm={handleAddColor} title="Nouvelle couleur" />
      <Popup isOpen={showStoragePopup} onClose={() => setShowStoragePopup(false)} onConfirm={handleAddStorage} title="Nouveau stockage" />
      <Popup isOpen={showRamPopup} onClose={() => setShowRamPopup(false)} onConfirm={handleAddRam} title="Nouvelle RAM" />
    </>
  );
}