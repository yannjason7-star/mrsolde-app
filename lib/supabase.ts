import { createClient } from '@supabase/supabase-js';

// VÉRIFIE QU'IL N'Y A PAS D'ESPACE AVANT OU APRÈS
const supabaseUrl = "https://rixtblppufokhfxmzhvn.supabase.co".trim(); 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHRibHBwdWZva2hmeG16aHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTQ1MjUsImV4cCI6MjA4OTU5MDUyNX0.wJ1OG5h6oYq9WwF1RXYQhEgnjNInqu6CMS496XVGXAk".trim();

console.log("Tentative de connexion à :", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const recordAudit = async (action: string, details: string, amount: number = 0) => {
  const user = JSON.parse(localStorage.getItem('userData') || '{}');
  
  await supabase.from('activity_logs').insert([{
    user_id: user.id,
    user_name: user.full_name,
    user_role: user.role,
    action_type: action, // 'VENTE', 'STOCK', 'DEPENSE'
    details: details,
    amount: amount
  }]);
};