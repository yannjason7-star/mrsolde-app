"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Wifi, WifiOff, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart } from 'lucide-react';

export default function SuiviPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Récupérer les ventes
      const { data: salesData } = await supabase
        .from('sales')
        .select('*, products(*)')
        .order('sale_date', { ascending: false })
        .limit(50);
      setSales(salesData || []);

      // Récupérer les dépenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })
        .limit(50);
      setExpenses(expensesData || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculs du jour
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.sale_date?.startsWith(today));
  const todayExpenses = expenses.filter(e => e.expense_date?.startsWith(today));
  
  const totalVentes = todaySales.reduce((sum, s) => sum + (s.final_price || 0), 0);
  const totalDepenses = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const beneficeNet = totalVentes - totalDepenses;
  const totalVentesQuantite = todaySales.reduce((sum, s) => sum + (s.quantity_sold || 1), 0);
  const totalDepensesCount = todayExpenses.length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase">Suivi <span className="text-brand-red">Boutique</span></h1>
          <p className="text-slate-400 text-sm mt-1">Ventes et dépenses du jour</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-xs font-black">{isOnline ? 'Synchro OK' : 'Hors ligne'}</span>
          </div>
          <button onClick={fetchData} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Carte Ventes */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black uppercase opacity-80">Ventes aujourd'hui</p>
              <p className="text-3xl font-black mt-2">{totalVentes.toLocaleString()} F</p>
              <p className="text-xs font-bold mt-1 opacity-80">{totalVentesQuantite} article(s) vendus</p>
            </div>
            <TrendingUp size={32} className="opacity-80" />
          </div>
        </div>

        {/* Carte Dépenses */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black uppercase opacity-80">Dépenses aujourd'hui</p>
              <p className="text-3xl font-black mt-2">{totalDepenses.toLocaleString()} F</p>
              <p className="text-xs font-bold mt-1 opacity-80">{totalDepensesCount} dépense(s)</p>
            </div>
            <TrendingDown size={32} className="opacity-80" />
          </div>
        </div>

        {/* Carte Bénéfice Net */}
        <div className={`rounded-3xl p-6 shadow-lg ${beneficeNet >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'} text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black uppercase opacity-80">Bénéfice Net</p>
              <p className="text-3xl font-black mt-2">{beneficeNet.toLocaleString()} F</p>
              <p className="text-xs font-bold mt-1 opacity-80">Ventes - Dépenses</p>
            </div>
            <DollarSign size={32} className="opacity-80" />
          </div>
        </div>

        {/* Carte Transactions */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-black uppercase opacity-80">Total transactions</p>
              <p className="text-3xl font-black mt-2">{todaySales.length + todayExpenses.length}</p>
              <p className="text-xs font-bold mt-1 opacity-80">{todaySales.length} ventes • {todayExpenses.length} dépenses</p>
            </div>
            <ShoppingCart size={32} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Tableau des ventes du jour */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b bg-slate-50">
          <h2 className="font-black uppercase text-sm flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            Ventes du {new Date().toLocaleDateString('fr-FR')}
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Chargement...</div>
        ) : todaySales.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Aucune vente aujourd'hui</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
                <tr>
                  <th className="p-4">Heure</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Produit</th>
                  <th className="p-4 text-right">Qté</th>
                  <th className="p-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todaySales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-600">{new Date(sale.sale_date).toLocaleTimeString()}</td>
                    <td className="p-4 font-medium text-slate-800">{sale.client_name || '—'}</td>
                    <td className="p-4 text-slate-600">{sale.products?.brand} {sale.products?.model}</td>
                    <td className="p-4 text-right font-medium">{sale.quantity_sold || 1}</td>
                    <td className="p-4 text-right font-black text-green-600">{sale.final_price?.toLocaleString()} F</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t">
                <tr>
                  <td colSpan={4} className="p-4 text-right font-black uppercase">Total :</td>
                  <td className="p-4 text-right font-black text-green-600">{totalVentes.toLocaleString()} F</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Tableau des dépenses du jour */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50">
          <h2 className="font-black uppercase text-sm flex items-center gap-2">
            <TrendingDown size={18} className="text-red-600" />
            Dépenses du {new Date().toLocaleDateString('fr-FR')}
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-400">Chargement...</div>
        ) : todayExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400">Aucune dépense aujourd'hui</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400">
                <tr>
                  <th className="p-4">Heure</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Catégorie</th>
                  <th className="p-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm text-slate-600">{new Date(expense.expense_date).toLocaleTimeString()}</td>
                    <td className="p-4 text-slate-800">{expense.description}</td>
                    <td className="p-4 text-slate-600">{expense.category || '—'}</td>
                    <td className="p-4 text-right font-black text-red-600">{expense.amount?.toLocaleString()} F</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t">
                <tr>
                  <td colSpan={3} className="p-4 text-right font-black uppercase">Total :</td>
                  <td className="p-4 text-right font-black text-red-600">{totalDepenses.toLocaleString()} F</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}