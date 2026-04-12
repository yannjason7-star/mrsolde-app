"use client";
import { useState, useEffect } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logAction } from '@/lib/auditLogger';

// Types
type Category = { id: number; name: string };
type Subcategory = { id: number; name: string };
type Brand = { id: number; name: string };
type Model = { id: number; name: string; brand_id: number };
type Storage = { id: number; value: string };
type Ram = { id: number; value: string };
type Color = { id: number; name: string };
type PowerOption = { id: number; value: string };
type EarphoneType = { id: number; name: string };
type Texture = { id: number; name: string };

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProduct?: any;
}

// Données initiales pour les modèles pré-définis (fallback)
const DEFAULT_MODELS_BY_BRAND: Record<string, string[]> = {
  Apple: ["iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14", "iPhone 13", "iPhone SE (3rd gen)"],
  Samsung: ["Galaxy S24 Ultra", "Galaxy S24+", "Galaxy S24", "Galaxy S23 Ultra", "Galaxy S23+", "Galaxy S23", "Galaxy A55", "Galaxy A35", "Galaxy Z Fold 6", "Galaxy Z Flip 6"],
  Google: ["Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 8 Pro", "Pixel 8", "Pixel 7a"]
};

export default function ProductModal({ isOpen, onClose, onSuccess, editProduct }: ProductModalProps) {
  const isEditMode = !!editProduct;
  
  // États principaux
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(editProduct?.category || 'Smartphone');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(editProduct?.subcategory || '');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  
  // États pour marques et modèles
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(editProduct?.brand || '');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(editProduct?.model || '');
  
  // États pour les listes déroulantes
  const [storages, setStorages] = useState<Storage[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string>(editProduct?.storage || '');
  const [rams, setRams] = useState<Ram[]>([]);
  const [selectedRam, setSelectedRam] = useState<string>(editProduct?.ram || '');
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(editProduct?.color || '');
  const [powerOptions, setPowerOptions] = useState<PowerOption[]>([]);
  const [selectedPower, setSelectedPower] = useState<string>(editProduct?.power || '');
  const [earphoneTypes, setEarphoneTypes] = useState<EarphoneType[]>([]);
  const [selectedEarphoneType, setSelectedEarphoneType] = useState<string>(editProduct?.earphone_type || '');
  const [textures, setTextures] = useState<Texture[]>([]);
  const [selectedTexture, setSelectedTexture] = useState<string>(editProduct?.texture || '');
  
  // États pour les champs texte
  const [imei, setImei] = useState(editProduct?.imei || '');
  const [macAddress, setMacAddress] = useState(editProduct?.mac_address || '');
  const [earphoneAutonomy, setEarphoneAutonomy] = useState(editProduct?.autonomy || '');
  const [cableType, setCableType] = useState(editProduct?.cable_type || '');
  const [cableLength, setCableLength] = useState(editProduct?.cable_length || '');
  const [customModel, setCustomModel] = useState(editProduct?.model || '');
  
  // Champs modifiables (les seuls actifs en mode édition)
  const [quantity, setQuantity] = useState(editProduct?.quantity || 1);
  const [price, setPrice] = useState(editProduct?.selling_price?.toString() || '');
  
  // Popup states pour l'ajout
  const [showBrandPopup, setShowBrandPopup] = useState(false);
  const [showModelPopup, setShowModelPopup] = useState(false);
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [showStoragePopup, setShowStoragePopup] = useState(false);
  const [showRamPopup, setShowRamPopup] = useState(false);
  const [showPowerPopup, setShowPowerPopup] = useState(false);
  const [showEarphoneTypePopup, setShowEarphoneTypePopup] = useState(false);
  const [showTexturePopup, setShowTexturePopup] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Charger les données initiales
  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, selectedCategory]);

  useEffect(() => {
    if (editProduct && isOpen) {
      setSelectedCategory(editProduct.category || 'Smartphone');
      setSelectedSubcategory(editProduct.subcategory || '');
      setSelectedBrand(editProduct.brand || '');
      setSelectedModel(editProduct.model || '');
      setSelectedStorage(editProduct.storage || '');
      setSelectedRam(editProduct.ram || '');
      setSelectedColor(editProduct.color || '');
      setSelectedPower(editProduct.power || '');
      setSelectedEarphoneType(editProduct.earphone_type || '');
      setSelectedTexture(editProduct.texture || '');
      setImei(editProduct.imei || '');
      setMacAddress(editProduct.mac_address || '');
      setEarphoneAutonomy(editProduct.autonomy || '');
      setCableType(editProduct.cable_type || '');
      setCableLength(editProduct.cable_length || '');
      setCustomModel(editProduct.model || '');
      setQuantity(editProduct.quantity || 1);
      setPrice(editProduct.selling_price?.toString() || '');
    }
  }, [editProduct, isOpen]);

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const { data: categoriesData } = await supabase.from('categories').select('*').order('name');
      setCategories(categoriesData || []);
      
      if (selectedCategory === 'Accessoire') {
        const { data: subData } = await supabase.from('subcategories').select('*').order('name');
        setSubcategories(subData || []);
      }
      
      const categoryObj = categoriesData?.find(c => c.name === selectedCategory);
      if (categoryObj) {
        const { data: brandsData } = await supabase
          .from('brands')
          .select('*')
          .eq('category_id', categoryObj.id)
          .order('name');
        setBrands(brandsData || []);
        if (!isEditMode && brandsData?.length && !selectedBrand) {
          setSelectedBrand(brandsData[0].name);
        }
      }
      
      const [storageData, ramData, colorData, powerData, earphoneData, textureData] = await Promise.all([
        supabase.from('storages').select('*').order('value'),
        supabase.from('rams').select('*').order('value'),
        supabase.from('colors').select('*').order('name'),
        supabase.from('power_options').select('*').order('value'),
        supabase.from('earphone_types').select('*').order('name'),
        supabase.from('textures').select('*').order('name')
      ]);
      
      setStorages(storageData.data || []);
      setRams(ramData.data || []);
      setColors(colorData.data || []);
      setPowerOptions(powerData.data || []);
      setEarphoneTypes(earphoneData.data || []);
      setTextures(textureData.data || []);
      
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Charger les modèles (uniquement en mode ajout)
  useEffect(() => {
    if (!isEditMode && selectedBrand && (selectedCategory === 'Smartphone' || selectedCategory === 'Tablette' || selectedCategory === 'Laptop')) {
      loadModels();
    }
  }, [selectedBrand, selectedCategory, isEditMode]);

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
    const categoryObj = categories.find(c => c.name === selectedCategory);
    if (!categoryObj) return;
    
    try {
      const { data: existing } = await supabase
        .from('brands')
        .select('id')
        .eq('name', newItemName.trim())
        .eq('category_id', categoryObj.id)
        .maybeSingle();
      
      if (existing) {
        alert("Cette marque existe déjà !");
        setShowBrandPopup(false);
        setNewItemName('');
        return;
      }

      const { data: newBrand, error } = await supabase
        .from('brands')
        .insert([{ name: newItemName.trim(), category_id: categoryObj.id }])
        .select()
        .single();
      if (error) throw error;
      setBrands(prev => [...prev, newBrand]);
      setSelectedBrand(newBrand.name);
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

  // Ajouter une texture
  const handleAddTexture = async () => {
    if (!newItemName.trim()) return;
    try {
      const { data: existing } = await supabase
        .from('textures')
        .select('id')
        .eq('name', newItemName.trim())
        .maybeSingle();
      
      if (existing) {
        alert("Cette texture existe déjà !");
        setShowTexturePopup(false);
        setNewItemName('');
        return;
      }

      const { data: newTexture, error } = await supabase
        .from('textures')
        .insert([{ name: newItemName.trim() }])
        .select()
        .single();
      if (error) throw error;
      setTextures(prev => [...prev, newTexture]);
      setSelectedTexture(newTexture.name);
      setShowTexturePopup(false);
      setNewItemName('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Ajouter une puissance
  const handleAddPower = async () => {
    if (!newItemName.trim()) return;
    try {
      const { data: existing } = await supabase
        .from('power_options')
        .select('id')
        .eq('value', newItemName.trim())
        .maybeSingle();
      
      if (existing) {
        alert("Cette puissance existe déjà !");
        setShowPowerPopup(false);
        setNewItemName('');
        return;
      }

      const { data: newPower, error } = await supabase
        .from('power_options')
        .insert([{ value: newItemName.trim() }])
        .select()
        .single();
      if (error) throw error;
      setPowerOptions(prev => [...prev, newPower]);
      setSelectedPower(newPower.value);
      setShowPowerPopup(false);
      setNewItemName('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Ajouter un type d'écouteur
  const handleAddEarphoneType = async () => {
    if (!newItemName.trim()) return;
    try {
      const { data: existing } = await supabase
        .from('earphone_types')
        .select('id')
        .eq('name', newItemName.trim())
        .maybeSingle();
      
      if (existing) {
        alert("Ce type d'écouteur existe déjà !");
        setShowEarphoneTypePopup(false);
        setNewItemName('');
        return;
      }

      const { data: newType, error } = await supabase
        .from('earphone_types')
        .insert([{ name: newItemName.trim() }])
        .select()
        .single();
      if (error) throw error;
      setEarphoneTypes(prev => [...prev, newType]);
      setSelectedEarphoneType(newType.name);
      setShowEarphoneTypePopup(false);
      setNewItemName('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isEditMode) {
      // ==================== MODE MODIFICATION ====================
      const oldValues = {
        quantity: editProduct?.quantity,
        selling_price: editProduct?.selling_price,
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
        .eq('id', editProduct?.id);
      
      if (!error) {
        await logAction({
          action: 'UPDATE',
          entity_type: 'product',
          entity_id: editProduct?.id,
          old_values: oldValues,
          new_values: newValues,
        });
        onSuccess();
        onClose();
      } else {
        alert(error.message);
      }
      
    } else {
      // ==================== MODE AJOUT ====================
      
      // Validation IMEI
      if ((selectedCategory === 'Smartphone' || selectedCategory === 'Tablette') && imei) {
        if (!/^\d{15}$/.test(imei)) {
          setLoading(false);
          return alert("L'IMEI doit comporter 15 chiffres exactement.");
        }
        const exists = await checkImeiExists(imei);
        if (exists) {
          setLoading(false);
          return alert("Cet IMEI existe déjà dans la base.");
        }
      }

      // Validation MAC
      if (selectedCategory === 'Laptop' && macAddress) {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(macAddress)) {
          setLoading(false);
          return alert("Adresse MAC invalide (ex: XX:XX:XX:XX:XX:XX)");
        }
      }
      
      const productData: any = {
        category: selectedCategory,
        brand: selectedBrand,
        quantity: quantity,
        selling_price: parseInt(price),
      };

      // Smartphone / Tablette / Laptop
      if (selectedCategory !== 'Accessoire') {
        productData.model = selectedModel;
        productData.color = selectedColor || 'N/A';
        productData.storage = selectedStorage || 'N/A';
        productData.ram = selectedRam || null;
        if (selectedCategory === 'Smartphone' || selectedCategory === 'Tablette') productData.imei = imei;
        if (selectedCategory === 'Laptop') productData.mac_address = macAddress;
      }
      
      // Accessoires
      if (selectedCategory === 'Accessoire') {
        productData.subcategory = selectedSubcategory;
        productData.model = customModel;
        
        if (selectedSubcategory === 'Chargeur') {
          productData.power = selectedPower;
          productData.color = selectedColor;
        } else if (selectedSubcategory === 'Pochette') {
          productData.texture = selectedTexture;
          productData.compatible_with = selectedModel;
          productData.color = selectedColor;
        } else if (selectedSubcategory === 'Écouteurs') {
          productData.earphone_type = selectedEarphoneType;
          productData.autonomy = earphoneAutonomy;
          productData.color = selectedColor;
        } else if (selectedSubcategory === 'Câble') {
          productData.cable_type = cableType;
          productData.cable_length = cableLength;
        }
      }

      const { data: inserted, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (!error && inserted) {
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
        setSelectedStorage('');
        setSelectedRam('');
        setSelectedColor('');
        setImei('');
        setMacAddress('');
        setQuantity(1);
        setPrice('');
        setSelectedSubcategory('');
        setCustomModel('');
        setSelectedPower('');
        setSelectedEarphoneType('');
        setEarphoneAutonomy('');
        setCableType('');
        setCableLength('');
        setSelectedTexture('');
      } else if (error) {
        alert(error.message);
      }
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
        <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black italic uppercase">
              {isEditMode ? "Modifier" : "Nouvel"} <span className="text-brand-red">{isEditMode ? "l'article" : "Arrivage"}</span>
            </h2>
            <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl"><X size={20}/></button>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-red" size={40}/></div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              
              {/* Catégories */}
              <div className="col-span-2 flex bg-slate-100 p-2 rounded-3xl gap-2">
                {categories.map(c => (
                  <button 
                    key={c.id} 
                    type="button" 
                    onClick={() => {
                      if (!isEditMode) {
                        setSelectedCategory(c.name);
                        setSelectedBrand('');
                        setSelectedModel('');
                        setSelectedSubcategory('');
                      }
                    }}
                    className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''} ${selectedCategory === c.name ? 'bg-white shadow text-brand-red' : 'text-slate-400'}`}
                    disabled={isEditMode}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Sous-catégories pour Accessoire */}
              {selectedCategory === 'Accessoire' && subcategories.length > 0 && (
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Type d'accessoire</label>
                  <select 
                    value={selectedSubcategory} 
                    onChange={(e) => !isEditMode && setSelectedSubcategory(e.target.value)}
                    disabled={isEditMode}
                    className={`w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ${isEditMode ? 'opacity-70' : ''}`}
                  >
                    <option value="">Sélectionner un type</option>
                    {subcategories.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {/* Marque */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Marque</label>
                {isEditMode ? (
                  <input type="text" value={selectedBrand} disabled className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none opacity-70" />
                ) : (
                  <div className="flex gap-2 items-center">
                    <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none" required>
                      <option value="">Sélectionner une marque</option>
                      {brands.map(b => <option key={b.id || `brand-${b.name}`} value={b.name}>{b.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowBrandPopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                      <Plus size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Modèle pour smartphones/tablettes/laptops */}
              {(selectedCategory === 'Smartphone' || selectedCategory === 'Tablette' || selectedCategory === 'Laptop') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Modèle</label>
                  {isEditMode ? (
                    <input type="text" value={selectedModel} disabled className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none opacity-70" />
                  ) : (
                    <div className="flex gap-2 items-center">
                      <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none" required>
                        <option value="">Sélectionner un modèle</option>
                        {models.map(m => <option key={m.id || `model-${m.name}`} value={m.name}>{m.name}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowModelPopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Modèle personnalisé pour accessoires */}
              {selectedCategory === 'Accessoire' && selectedSubcategory && selectedSubcategory !== 'Pochette' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Modèle / Référence</label>
                  <input 
                    type="text" 
                    value={customModel} 
                    onChange={(e) => !isEditMode && setCustomModel(e.target.value)} 
                    disabled={isEditMode}
                    className={`w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ${isEditMode ? 'opacity-70' : ''}`}
                    placeholder="Ex: Chargeur 20W, Câble USB-C..." 
                  />
                </div>
              )}

              {/* Texture pour pochettes */}
              {selectedCategory === 'Accessoire' && selectedSubcategory === 'Pochette' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Texture</label>
                  {isEditMode ? (
                    <input type="text" value={selectedTexture} disabled className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none opacity-70" />
                  ) : (
                    <div className="flex gap-2 items-center">
                      <select value={selectedTexture} onChange={(e) => setSelectedTexture(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none">
                        <option value="">Sélectionner une texture</option>
                        {textures.map(t => <option key={t.id || `texture-${t.name}`} value={t.name}>{t.name}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowTexturePopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Compatible avec (pochette) */}
              {selectedCategory === 'Accessoire' && selectedSubcategory === 'Pochette' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Compatible avec</label>
                  {isEditMode ? (
                    <input type="text" value={selectedModel} disabled className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none opacity-70" />
                  ) : (
                    <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none" required>
                      <option value="">Sélectionner un modèle</option>
                      {models.map(m => <option key={m.id || `compatible-${m.name}`} value={m.name}>{m.name}</option>)}
                    </select>
                  )}
                </div>
              )}

              {/* Stockage */}
              {(selectedCategory === 'Smartphone' || selectedCategory === 'Tablette' || selectedCategory === 'Laptop') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Stockage</label>
                  {isEditMode ? (
                    <input type="text" value={selectedStorage} disabled className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none opacity-70" />
                  ) : (
                    <div className="flex gap-2 items-center">
                      <select value={selectedStorage} onChange={(e) => setSelectedStorage(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none">
                        <option value="">Sélectionner un stockage</option>
                        {storages.map(s => <option key={s.id || `storage-${s.value}`} value={s.value}>{s.value}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowStoragePopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* RAM */}
              {(selectedCategory === 'Smartphone' || selectedCategory === 'Tablette' || selectedCategory === 'Laptop') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">RAM</label>
                  {isEditMode ? (
                    <input type="text" value={selectedRam} disabled className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none opacity-70" />
                  ) : (
                    <div className="flex gap-2 items-center">
                      <select value={selectedRam} onChange={(e) => setSelectedRam(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none">
                        <option value="">Sélectionner la RAM</option>
                        {rams.map(r => <option key={r.id || `ram-${r.value}`} value={r.value}>{r.value}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowRamPopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Couleur */}
              {(selectedCategory !== 'Accessoire' || (selectedCategory === 'Accessoire' && (selectedSubcategory === 'Chargeur' || selectedSubcategory === 'Pochette' || selectedSubcategory === 'Écouteurs'))) && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Couleur</label>
                  {isEditMode ? (
                    <input type="text" value={selectedColor} disabled className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none opacity-70" />
                  ) : (
                    <div className="flex gap-2 items-center">
                      <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none">
                        <option value="">Sélectionner une couleur</option>
                        {colors.map(c => <option key={c.id || `color-${c.name}`} value={c.name}>{c.name}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowColorPopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Puissance pour chargeurs */}
              {selectedCategory === 'Accessoire' && selectedSubcategory === 'Chargeur' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Puissance</label>
                  {isEditMode ? (
                    <input type="text" value={selectedPower} disabled className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none opacity-70" />
                  ) : (
                    <div className="flex gap-2 items-center">
                      <select value={selectedPower} onChange={(e) => setSelectedPower(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none" required>
                        <option value="">Sélectionner une puissance</option>
                        {powerOptions.map(p => <option key={p.id || `power-${p.value}`} value={p.value}>{p.value}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowPowerPopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Type d'écouteurs */}
              {selectedCategory === 'Accessoire' && selectedSubcategory === 'Écouteurs' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Type d'écouteurs</label>
                  {isEditMode ? (
                    <input type="text" value={selectedEarphoneType} disabled className="w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none opacity-70" />
                  ) : (
                    <div className="flex gap-2 items-center">
                      <select value={selectedEarphoneType} onChange={(e) => setSelectedEarphoneType(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold outline-none" required>
                        <option value="">Sélectionner un type</option>
                        {earphoneTypes.map(e => <option key={e.id || `earphone-${e.name}`} value={e.name}>{e.name}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowEarphoneTypePopup(true)} className="p-4 bg-slate-100 rounded-2xl text-brand-red hover:bg-slate-200 transition-all">
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Autonomie pour écouteurs */}
              {selectedCategory === 'Accessoire' && selectedSubcategory === 'Écouteurs' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Autonomie (heures)</label>
                  <input 
                    type="text" 
                    value={earphoneAutonomy} 
                    onChange={(e) => !isEditMode && setEarphoneAutonomy(e.target.value)} 
                    disabled={isEditMode}
                    className={`w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ${isEditMode ? 'opacity-70' : ''}`}
                    placeholder="Ex: 8h, 24h avec boîtier" 
                  />
                </div>
              )}

              {/* Type de câble */}
              {selectedCategory === 'Accessoire' && selectedSubcategory === 'Câble' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Type de câble</label>
                  <input 
                    type="text" 
                    value={cableType} 
                    onChange={(e) => !isEditMode && setCableType(e.target.value)} 
                    disabled={isEditMode}
                    className={`w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ${isEditMode ? 'opacity-70' : ''}`}
                    placeholder="Ex: USB-C, Lightning" 
                    required 
                  />
                </div>
              )}

              {/* Longueur pour câble */}
              {selectedCategory === 'Accessoire' && selectedSubcategory === 'Câble' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Longueur</label>
                  <input 
                    type="text" 
                    value={cableLength} 
                    onChange={(e) => !isEditMode && setCableLength(e.target.value)} 
                    disabled={isEditMode}
                    className={`w-full bg-slate-50 p-4 rounded-2xl font-bold outline-none ${isEditMode ? 'opacity-70' : ''}`}
                    placeholder="Ex: 1m, 2m" 
                  />
                </div>
              )}

              {/* IMEI */}
              {(selectedCategory === 'Smartphone' || selectedCategory === 'Tablette') && (
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-brand-red uppercase tracking-widest px-4 italic underline">IMEI (15 Chiffres)</label>
                  <input 
                    type="text" 
                    value={imei} 
                    onChange={(e) => !isEditMode && setImei(e.target.value)} 
                    disabled={isEditMode}
                    maxLength={15} 
                    placeholder="15 chiffres uniques" 
                    className={`w-full bg-slate-50 p-4 rounded-2xl font-mono text-sm outline-none ${isEditMode ? 'opacity-70' : ''}`}
                  />
                </div>
              )}

              {/* MAC */}
              {selectedCategory === 'Laptop' && (
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-brand-red uppercase tracking-widest px-4 italic underline">Adresse MAC</label>
                  <input 
                    type="text" 
                    value={macAddress} 
                    onChange={(e) => !isEditMode && setMacAddress(e.target.value)} 
                    disabled={isEditMode}
                    placeholder="XX:XX:XX:XX:XX:XX" 
                    className={`w-full bg-slate-50 p-4 rounded-2xl font-mono text-sm outline-none ${isEditMode ? 'opacity-70' : ''}`}
                  />
                </div>
              )}

              {/* Quantité - MODIFIABLE DANS LES DEUX MODES */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Quantité</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} required min="1" className="w-full bg-slate-50 p-4 rounded-2xl font-black text-lg outline-none focus:ring-2 ring-brand-red/20" />
              </div>

              {/* Prix - MODIFIABLE DANS LES DEUX MODES */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-green-500 uppercase tracking-widest px-4 italic">Prix Vente Unitaire</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full bg-green-50 p-4 rounded-2xl font-black italic text-lg outline-none focus:ring-2 ring-brand-red/20" />
              </div>

              <button disabled={loading} className="col-span-2 bg-slate-900 py-6 rounded-3xl font-black uppercase text-xs tracking-[4px] text-white shadow-2xl hover:scale-[1.02] transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto"/> : (isEditMode ? "METTRE À JOUR" : "VALIDER L'ARTICLE")}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Popups d'ajout rapide (uniquement en mode ajout) */}
      {!isEditMode && (
        <>
          <Popup isOpen={showBrandPopup} onClose={() => setShowBrandPopup(false)} onConfirm={handleAddBrand} title="Nouvelle marque" />
          <Popup isOpen={showModelPopup} onClose={() => setShowModelPopup(false)} onConfirm={handleAddModel} title="Nouveau modèle" />
          <Popup isOpen={showColorPopup} onClose={() => setShowColorPopup(false)} onConfirm={handleAddColor} title="Nouvelle couleur" />
          <Popup isOpen={showStoragePopup} onClose={() => setShowStoragePopup(false)} onConfirm={handleAddStorage} title="Nouveau stockage" />
          <Popup isOpen={showRamPopup} onClose={() => setShowRamPopup(false)} onConfirm={handleAddRam} title="Nouvelle RAM" />
          <Popup isOpen={showPowerPopup} onClose={() => setShowPowerPopup(false)} onConfirm={handleAddPower} title="Nouvelle puissance" />
          <Popup isOpen={showEarphoneTypePopup} onClose={() => setShowEarphoneTypePopup(false)} onConfirm={handleAddEarphoneType} title="Nouveau type d'écouteur" />
          <Popup isOpen={showTexturePopup} onClose={() => setShowTexturePopup(false)} onConfirm={handleAddTexture} title="Nouvelle texture" />
        </>
      )}
    </>
  );
}