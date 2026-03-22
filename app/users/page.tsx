"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Trash2, Edit3, ShieldCheck, X, Check, Loader2 } from 'lucide-react';

export default function TeamManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  const fetchUsers = async () => {
    const { data } = await supabase.from('internal_accounts').select('*').order('id', { ascending: true });
    setUsers(data || []);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const f = e.target;
    
    const payload = {
      full_name: f.full_name.value,
      login_id: f.login_id.value,
      password: f.password.value,
      role: f.role.value,
      can_edit_stock: f.edit_stock.checked,
      can_see_expenses: f.see_exp.checked
    };

    let error;
    if (editUser) {
      const { error: err } = await supabase.from('internal_accounts').update(payload).eq('id', editUser.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('internal_accounts').insert([payload]);
      error = err;
    }

    if (!error) {
      setIsModalOpen(false);
      setEditUser(null);
      fetchUsers();
    } else { alert(error.message); }
    setLoading(false);
  };

  const deleteUser = async (id: number) => {
    if (confirm("Supprimer ce compte ?")) {
      await supabase.from('internal_accounts').delete().eq('id', id);
      fetchUsers();
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase underline decoration-brand-red/10">Contrôle <span className="text-brand-red">Équipe</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[6px] mt-2 italic">Gestion des accès Mr. Solde</p>
        </div>
        <button onClick={() => { setEditUser(null); setIsModalOpen(true); }} className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-[3px] shadow-2xl">+ Créer un compte</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map(u => (
          <div key={u.id} className="glass-card p-8 flex flex-col group relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-red font-black text-xl italic border border-slate-100">{u.full_name.charAt(0)}</div>
              <div>
                <h3 className="font-black italic text-lg uppercase leading-tight">{u.full_name}</h3>
                <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">{u.role}</span>
              </div>
            </div>

            <div className="space-y-3 py-6 border-y border-slate-50 text-[10px] font-black uppercase tracking-widest">
              <div className="flex justify-between">
                <span className="text-slate-400 italic">Identifiant</span> 
                <span className="text-slate-900 font-mono">{u.login_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 italic">Gérer Stock</span> 
                {u.can_edit_stock ? <Check size={14} className="text-green-500"/> : <X size={14} className="text-brand-red"/>}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 italic">Voir Dépenses</span> 
                {u.can_see_expenses ? <Check size={14} className="text-green-500"/> : <X size={14} className="text-brand-red"/>}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => { setEditUser(u); setIsModalOpen(true); }} className="flex-1 bg-slate-50 py-3 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all flex items-center justify-center gap-2"><Edit3 size={14}/> Éditer</button>
              {u.login_id !== 'ADMIN' && (
                <button onClick={() => deleteUser(u.id)} className="p-3 bg-red-50 text-brand-red rounded-2xl hover:bg-brand-red hover:text-white transition-all"><Trash2 size={16}/></button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREATION/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-12 space-y-6 animate-in zoom-in-95">
            <h2 className="text-2xl font-black uppercase italic">{editUser ? 'Modifier' : 'Créer'} <span className="text-brand-red">Accès</span></h2>
            <div className="space-y-4">
              <input name="full_name" defaultValue={editUser?.full_name} placeholder="Nom Complet" required className="w-full bg-slate-50 p-5 rounded-2xl font-bold" />
              <div className="grid grid-cols-2 gap-4">
                <input name="login_id" defaultValue={editUser?.login_id} placeholder="ID Connexion" required className="w-full bg-slate-50 p-5 rounded-2xl font-bold" />
                <input name="password" defaultValue={editUser?.password} type="text" placeholder="Mot de passe" required className="w-full bg-slate-50 p-5 rounded-2xl font-bold" />
              </div>
              <select name="role" defaultValue={editUser?.role || "seller"} className="w-full bg-slate-50 p-5 rounded-2xl font-bold outline-none">
                <option value="seller">Vendeur</option>
                <option value="manager">Gestionnaire de Stock</option>
                <option value="admin">Administrateur</option>
              </select>
              <div className="space-y-3 px-2">
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="edit_stock" defaultChecked={editUser?.can_edit_stock} id="e_s" className="w-5 h-5 accent-brand-red" />
                  <label htmlFor="e_s" className="text-[10px] font-black uppercase text-slate-500 italic">Autoriser modification Stock</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="see_exp" defaultChecked={editUser?.can_see_expenses} id="s_e" className="w-5 h-5 accent-brand-red" />
                  <label htmlFor="s_e" className="text-[10px] font-black uppercase text-slate-500 italic">Autoriser accès Dépenses</label>
                </div>
              </div>
            </div>
            <button disabled={loading} className="w-full bg-slate-900 py-6 rounded-3xl font-black text-white uppercase text-xs tracking-[4px] shadow-xl hover:scale-[1.02] transition-all">
              {loading ? <Loader2 className="animate-spin mx-auto"/> : (editUser ? "SAUVEGARDER" : "GÉNÉRER L'ACCÈS")}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fermer</button>
          </form>
        </div>
      )}
    </div>
  );
}