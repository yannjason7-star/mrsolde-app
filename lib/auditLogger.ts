import { supabase } from './supabase';

export const logAction = async (data: any) => {
  try {
    // Récupérer les infos utilisateur depuis localStorage
    let userEmail = 'unknown';
    let userRole = 'unknown';
    
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        userEmail = parsed.email || parsed.full_name || 'unknown';
        userRole = parsed.role || 'unknown';
      }
    } catch (e) {
      console.error('Erreur lecture userData:', e);
    }
    
    const logEntry = {
      user_email: userEmail,
      user_role: userRole,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id || null,
      old_values: data.old_values || null,
      new_values: data.new_values || null,
      amount: data.amount || null,
    };
    
    console.log("📝 Insertion dans audit_logs:", logEntry);
    
    const { data: inserted, error } = await supabase
      .from('audit_logs')
      .insert([logEntry])
      .select();
    
    if (error) {
      console.error('❌ Erreur détaillée:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
    } else {
      console.log('✅ Audit réussi:', inserted);
    }
  } catch (error) {
    console.error('❌ Exception:', error);
  }
};