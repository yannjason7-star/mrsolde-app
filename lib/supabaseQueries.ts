// lib/supabaseQueries.ts
import { supabase } from './supabase';

// ========== MARQUES ==========
export async function getBrands(category?: string) {
  let query = supabase.from('brands').select('*').order('name');
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function addBrand(name: string, category?: string) {
  const { data, error } = await supabase
    .from('brands')
    .insert([{ name, category }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ========== MODÈLES ==========
export async function getModels(brandId: number) {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('brand_id', brandId)
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function addModel(name: string, brandId: number, category?: string) {
  const { data, error } = await supabase
    .from('models')
    .insert([{ name, brand_id: brandId, category, is_custom: true }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ========== COULEURS ==========
export async function getColors() {
  const { data, error } = await supabase
    .from('colors')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function addColor(name: string) {
  const { data, error } = await supabase
    .from('colors')
    .insert([{ name }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ========== STOCKAGES ==========
export async function getStorages() {
  const { data, error } = await supabase
    .from('storages')
    .select('*')
    .order('value');
  if (error) throw error;
  return data || [];
}

export async function addStorage(value: string) {
  const { data, error } = await supabase
    .from('storages')
    .insert([{ value }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ========== RAM ==========
export async function getRams() {
  const { data, error } = await supabase
    .from('rams')
    .select('*')
    .order('value');
  if (error) throw error;
  return data || [];
}

export async function addRam(value: string) {
  const { data, error } = await supabase
    .from('rams')
    .insert([{ value }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ========== AJOUT PRODUIT FINAL ==========
export async function addProduct(productData: any) {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select();
  if (error) throw error;
  return data;
}