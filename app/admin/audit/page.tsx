"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  History, Search, Filter, User, 
  ArrowRight, Download, RefreshCw, 
  TrendingUp, Package, Receipt 
} from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("Tous");

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });
    setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    if (user.role === 'admin') fetchLogs();
  }, []);

  // Filtrage intelligent
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "Tous" || log.user_role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-[1400px] mx-auto py-8 animate-in fade-in duration-700">
      
      {/* HEADER PREMIUM */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Audit <span className="text-brand-red">&</span> Traçabilité</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[5px] mt-2 italic">Surveillance des actions Vendeurs & Gestionnaires</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="p-4 bg-slate-900 text-white rounded-2xl hover:scale-105 transition-all shadow-xl"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* BARRE DE FILTRES "SaaS Light" */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 p-5 pl-14 rounded-3xl font-bold text-sm outline-none focus:ring-2 ring-brand-red/10"
          />
        </div>
        
        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-white border border-slate-100 p-5 rounded-3xl font-black uppercase text-[10px] tracking-widest outline-none cursor-pointer"
        >
          <option value="Tous">Tous les rôles</option>
          <option value="manager">Gestionnaires uniquement</option>
          <option value="seller">Vendeurs uniquement</option>
        </select>

        <button className="bg-white border border-slate-100 p-5 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 text-slate-400 hover:text-slate-900 transition-all">
           <Download size={16}/> Exporter Log
        </button>
      </div>

      {/* LISTE CHRONOLOGIQUE */}
      <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="p-6">Heure</th>
              <th className="p-6">Collaborateur</th>
              <th className="p-6">Type d'action</th>
              <th className="p-6">Détails de l'opération</th>
              <th className="p-6 text-right">Impact Financier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="p-6 text-[11px] font-bold text-slate-400 font-mono italic">
                  {new Date(log.created_at).toLocaleTimeString('fr-FR')}
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white ${log.user_role === 'seller' ? 'bg-slate-900' : 'bg-brand-red'}`}>
                      {log.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase italic tracking-tight">{log.user_name}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.user_role}</span>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    log.action_type === 'VENTE' ? 'bg-green-50 text-green-500 border-green-100' :
                    log.action_type === 'STOCK' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                    'bg-brand-red/5 text-brand-red border-brand-red/10'
                  }`}>
                    {log.action_type}
                  </span>
                </td>
                <td className="p-6">
                   <p className="text-xs font-bold text-slate-600 italic leading-snug">{log.details}</p>
                </td>
                <td className="p-6 text-right font-black italic text-slate-900">
                  {log.amount > 0 ? `${log.amount.toLocaleString()} F` : '---'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLogs.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center">
            <History size={48} className="text-slate-100 mb-4" />
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[5px]">Aucune activité enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
}