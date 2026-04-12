"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  History, Search, Filter, User, 
  ArrowRight, Download, RefreshCw, 
  TrendingUp, Package, Receipt, Eye, Loader2 , Trash2
} from 'lucide-react';

interface AuditLog {
  id: number;
  user_email: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: number;
  old_values: any;
  new_values: any;
  amount: number;
  created_at: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("Tous");
  const [filterAction, setFilterAction] = useState("Tous");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data } = await query;
      setLogs(data || []);
    } catch (error) {
      console.error("Erreur chargement logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    if (user.role === 'admin') fetchLogs();
  }, []);

  // Générer un texte descriptif à partir des valeurs
  const getActionDetails = (log: AuditLog): string => {
    switch (log.action) {
      case 'CREATE':
        if (log.entity_type === 'product') {
          const brand = log.new_values?.brand || '';
          const model = log.new_values?.model || '';
          const price = log.new_values?.selling_price || log.new_values?.price || '';
          return `Ajout de ${brand} ${model}${price ? ` (${price.toLocaleString()} F)` : ''}`;
        }
        if (log.entity_type === 'sale') return `Nouvelle vente enregistrée`;
        return `Création d'un(e) ${log.entity_type}`;
        
      case 'UPDATE':
        if (log.entity_type === 'product') {
          const oldPrice = log.old_values?.selling_price;
          const newPrice = log.new_values?.selling_price;
          if (oldPrice && newPrice && oldPrice !== newPrice) {
            return `Modification du prix : ${oldPrice.toLocaleString()} F → ${newPrice.toLocaleString()} F`;
          }
          return `Modification du produit #${log.entity_id}`;
        }
        return `Modification d'un(e) ${log.entity_type}`;
        
      case 'DELETE':
        return `Suppression d'un(e) ${log.entity_type} #${log.entity_id}`;
        
      case 'SALE':
        const amount = log.amount || log.new_values?.total || 0;
        return `Vente réalisée${amount ? ` (${amount.toLocaleString()} F)` : ''}`;
        
      case 'LOGIN':
        return `Connexion à l'application`;
        
      case 'LOGOUT':
        return `Déconnexion de l'application`;
        
      case 'EXPORT':
        return `Export de données (${log.entity_type})`;
        
      default:
        return log.action || 'Action inconnue';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Package size={14} />;
      case 'UPDATE': return <RefreshCw size={14} />;
      case 'DELETE': return <Trash2 size={14} />;
      case 'SALE': return <Receipt size={14} />;
      default: return <History size={14} />;
    }
  };

  // Filtrage
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getActionDetails(log).toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "Tous" || log.user_role === filterRole;
    const matchesAction = filterAction === "Tous" || log.action === filterAction;
    
    return matchesSearch && matchesRole && matchesAction;
  });

  // Export CSV
  const exportCSV = () => {
    const headers = ['Date', 'Utilisateur', 'Rôle', 'Action', 'Type', 'ID', 'Détails', 'Montant'];
    const rows = filteredLogs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.user_email,
      log.user_role,
      log.action,
      log.entity_type,
      log.entity_id,
      getActionDetails(log),
      log.amount || log.new_values?.selling_price || log.new_values?.total || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0,19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadgeClass = (action: string) => {
    const styles: Record<string, string> = {
      CREATE: 'bg-green-50 text-green-500 border-green-100',
      UPDATE: 'bg-blue-50 text-blue-500 border-blue-100',
      DELETE: 'bg-red-50 text-red-500 border-red-100',
      SALE: 'bg-amber-50 text-amber-500 border-amber-100',
      LOGIN: 'bg-purple-50 text-purple-500 border-purple-100',
      LOGOUT: 'bg-gray-50 text-gray-500 border-gray-100',
      EXPORT: 'bg-indigo-50 text-indigo-500 border-indigo-100',
    };
    return styles[action] || 'bg-slate-50 text-slate-500 border-slate-100';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE: 'CRÉATION',
      UPDATE: 'MODIFICATION',
      DELETE: 'SUPPRESSION',
      SALE: 'VENTE',
      LOGIN: 'CONNEXION',
      LOGOUT: 'DÉCONNEXION',
      EXPORT: 'EXPORT',
    };
    return labels[action] || action;
  };

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

      {/* BARRE DE FILTRES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher par email, action, type..."
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
          <option value="admin">Admin</option>
          <option value="manager">Gestionnaires</option>
          <option value="seller">Vendeurs</option>
        </select>

        <select 
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-white border border-slate-100 p-5 rounded-3xl font-black uppercase text-[10px] tracking-widest outline-none cursor-pointer"
        >
          <option value="Tous">Toutes actions</option>
          <option value="CREATE">Créations</option>
          <option value="UPDATE">Modifications</option>
          <option value="DELETE">Suppressions</option>
          <option value="SALE">Ventes</option>
          <option value="LOGIN">Connexions</option>
          <option value="EXPORT">Exports</option>
        </select>

        <button 
          onClick={exportCSV}
          className="bg-white border border-slate-100 p-5 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 text-slate-400 hover:text-slate-900 transition-all"
        >
          <Download size={16}/> Exporter CSV
        </button>
      </div>

      {/* LISTE CHRONOLOGIQUE */}
      <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="p-6">Date & Heure</th>
                <th className="p-6">Collaborateur</th>
                <th className="p-6">Action</th>
                <th className="p-6">Type</th>
                <th className="p-6">Détails</th>
                <th className="p-6 text-right">Montant</th>
                <th className="p-6 text-center">Voir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <Loader2 className="animate-spin text-brand-red mx-auto" size={40} />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center flex flex-col items-center">
                    <History size={48} className="text-slate-100 mb-4" />
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[5px]">Aucune activité enregistrée</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="p-6 text-[11px] font-bold text-slate-400 font-mono italic">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white ${log.user_role === 'seller' ? 'bg-slate-900' : log.user_role === 'manager' ? 'bg-blue-600' : 'bg-brand-red'}`}>
                          {log.user_email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase italic tracking-tight">{log.user_email.split('@')[0]}</p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.user_role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getActionBadgeClass(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-slate-600 italic leading-snug">
                        {getActionDetails(log)}
                      </p>
                    </td>
                    <td className="p-6 text-right font-black italic text-slate-900">
                      {log.amount || log.new_values?.selling_price || log.new_values?.total ? 
                        `${(log.amount || log.new_values?.selling_price || log.new_values?.total).toLocaleString()} F` : '---'}
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => setSelectedLog(log)} 
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                      >
                        <Eye size={16} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DÉTAILS */}
      {selectedLog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md" onClick={() => setSelectedLog(null)}>
          <div className="bg-slate-900 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-white">Détails de l'action</h3>
              <button onClick={() => setSelectedLog(null)} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">Date :</span>
                  <p className="text-white font-mono text-sm">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Utilisateur :</span>
                  <p className="text-white">{selectedLog.user_email} <span className="text-slate-400 text-xs">({selectedLog.user_role})</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">Action :</span>
                  <p className="text-brand-red font-black">{getActionLabel(selectedLog.action)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Type :</span>
                  <p className="text-white">{selectedLog.entity_type} #{selectedLog.entity_id}</p>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-sm">Description :</span>
                <p className="text-white text-sm bg-slate-800 p-4 rounded-2xl mt-1">{getActionDetails(selectedLog)}</p>
              </div>
              {selectedLog.old_values && (
                <div>
                  <span className="text-slate-400 text-sm">Anciennes valeurs :</span>
                  <pre className="bg-slate-800 p-4 rounded-2xl text-xs text-slate-300 overflow-x-auto mt-1">{JSON.stringify(selectedLog.old_values, null, 2)}</pre>
                </div>
              )}
              {selectedLog.new_values && (
                <div>
                  <span className="text-slate-400 text-sm">Nouvelles valeurs :</span>
                  <pre className="bg-slate-800 p-4 rounded-2xl text-xs text-slate-300 overflow-x-auto mt-1">{JSON.stringify(selectedLog.new_values, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}