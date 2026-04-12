import initSqlJs from 'sql.js';
import { supabase } from './supabase';

let db = null;
let dbInitialized = false;
let initPromise = null;

// Initialisation asynchrone
export async function initLocalDB() {
  if (dbInitialized) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      const saved = localStorage.getItem('mrsolde_db');
      if (saved) {
        const uint8Array = new Uint8Array(JSON.parse(saved));
        db = new SQL.Database(uint8Array);
      } else {
        db = new SQL.Database();
        // Créer les tables
        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            brand TEXT, model TEXT, color TEXT,
            storage TEXT, ram TEXT, quantity INTEGER,
            selling_price INTEGER, imei TEXT, mac_address TEXT,
            category TEXT, subcategory TEXT, compatible_with TEXT,
            synced INTEGER DEFAULT 0
          )
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY,
            product_id INTEGER, client_name TEXT,
            final_price INTEGER, quantity_sold INTEGER,
            sale_date TEXT, seller_id INTEGER, synced INTEGER DEFAULT 0
          )
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS pending_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT, table_name TEXT, data TEXT, timestamp INTEGER
          )
        `);
      }
      dbInitialized = true;
      return db;
    } catch (err) {
      console.error('Erreur initialisation SQL.js:', err);
      throw err;
    }
  })();

  return initPromise;
}

// Sauvegarder la base dans localStorage
async function saveDB() {
  if (!db) return;
  const data = db.export();
  const uint8Array = new Uint8Array(data);
  localStorage.setItem('mrsolde_db', JSON.stringify(Array.from(uint8Array)));
}

// Exécuter une requête et sauvegarder
async function exec(sql, params = []) {
  await initLocalDB();
  db.run(sql, params);
  await saveDB();
}

// Récupérer des données
async function query(sql, params = []) {
  await initLocalDB();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

// Synchronisation vers le cloud
async function syncToCloud() {
  await initLocalDB();
  console.log('🔄 Synchronisation...');
  const pending = await query(`SELECT * FROM pending_actions ORDER BY timestamp`);
  for (const action of pending) {
    try {
      const data = JSON.parse(action.data);
      if (action.action === 'CREATE_SALE') {
        await supabase.from('sales').insert([data]);
      } else if (action.action === 'CREATE_PRODUCT') {
        await supabase.from('products').insert([data]);
      }
      await exec(`DELETE FROM pending_actions WHERE id = ?`, [action.id]);
    } catch (err) {
      console.error('Erreur sync:', err);
    }
  }
}

// Enregistrer une vente (avec mode hors ligne)
export async function saveSaleOffline(saleData) {
  await initLocalDB();
  if (navigator.onLine) {
    const { data, error } = await supabase.from('sales').insert([saleData]).select();
    if (!error) return { data, error };
  }
  // Hors ligne : stocker dans pending_actions
  await exec(`
    INSERT INTO pending_actions (action, table_name, data, timestamp)
    VALUES (?, ?, ?, ?)
  `, ['CREATE_SALE', 'sales', JSON.stringify(saleData), Date.now()]);
  console.log('💾 Vente enregistrée localement');
  return { data: [{ ...saleData, id: 'local_' + Date.now() }], error: null };
}

// Démarrer la synchronisation périodique
let syncInterval;
export function startSync(intervalMs = 30000) {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(() => {
    if (navigator.onLine) {
      syncToCloud().catch(err => console.error('Sync error:', err));
    }
  }, intervalMs);
  // Initialiser la base au démarrage
  initLocalDB().catch(err => console.error('Init error:', err));
}