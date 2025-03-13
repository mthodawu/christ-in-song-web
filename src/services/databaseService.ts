
import initSqlJs, { Database } from 'sql.js';
import { Language, Hymn } from '@/types/hymn';
import { availableLanguages } from './hymnService';
import { toast } from 'sonner';

// SQLite database instance
let db: Database | null = null;

// Initialize the database
export const initDatabase = async (): Promise<void> => {
  try {
    if (db) return; // Already initialized

    const SQL = await initSqlJs({
      // Specify the path to the wasm file
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    // Create a new database
    db = new SQL.Database();
    
    // Create tables for each language
    await createTables();

    // Load initial data from JSON files
    await loadInitialData();

    toast.success('Database initialized successfully');
    return;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    toast.error('Failed to initialize database');
    throw error;
  }
};

// Create tables for hymns
const createTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  // Create a table for each language
  availableLanguages.forEach(lang => {
    db!.run(`
      CREATE TABLE IF NOT EXISTS hymns_${lang} (
        id TEXT PRIMARY KEY,
        number INTEGER NOT NULL,
        title TEXT NOT NULL,
        markdown TEXT NOT NULL
      )
    `);
  });
};

// Load initial data from JSON files
const loadInitialData = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  // Check if we already have data
  const result = db.exec(`SELECT COUNT(*) as count FROM hymns_english`);
  const count = result[0]?.values[0]?.[0] as number;
  
  if (count > 0) {
    // Data already loaded
    return;
  }

  // Load data from JSON files
  for (const language of availableLanguages) {
    try {
      const response = await fetch(`/data/${language.toLowerCase()}.json`);
      const hymns = await response.json();
      
      // Begin transaction for faster inserts
      db.exec('BEGIN TRANSACTION');
      
      hymns.forEach((hymn: any) => {
        const id = hymn.id || `${language.toLowerCase()}-${hymn.number}`;
        
        db.run(`
          INSERT INTO hymns_${language} (id, number, title, markdown)
          VALUES (?, ?, ?, ?)
        `, [id, hymn.number, hymn.title, hymn.markdown]);
      });
      
      // Commit the transaction
      db.exec('COMMIT');
      
    } catch (error) {
      console.error(`Failed to load initial data for ${language}:`, error);
      // Rollback if there was an error
      if (db) db.exec('ROLLBACK');
    }
  }
};

// Get all hymns for a language
export const getHymnsByLanguage = (language: Language): Hymn[] => {
  if (!db) throw new Error('Database not initialized');
  
  const results = db.exec(`SELECT * FROM hymns_${language} ORDER BY number`);
  
  if (!results.length || !results[0].values.length) {
    return [];
  }
  
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const hymn: Record<string, any> = {};
    columns.forEach((col, i) => {
      hymn[col] = row[i];
    });
    
    return {
      id: hymn.id,
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown,
    };
  });
};

// Get a hymn by ID
export const getHymnById = (id: string, language: Language): Hymn | null => {
  if (!db) throw new Error('Database not initialized');
  
  const results = db.exec(`
    SELECT * FROM hymns_${language} WHERE id = ?
  `, [id]);
  
  if (!results.length || !results[0].values.length) {
    return null;
  }
  
  const columns = results[0].columns;
  const row = results[0].values[0];
  
  const hymn: Record<string, any> = {};
  columns.forEach((col, i) => {
    hymn[col] = row[i];
  });
  
  return {
    id: hymn.id,
    number: hymn.number,
    title: hymn.title,
    markdown: hymn.markdown,
  };
};

// Get a hymn by number
export const getHymnByNumber = (number: number, language: Language): Hymn | null => {
  if (!db) throw new Error('Database not initialized');
  
  const results = db.exec(`
    SELECT * FROM hymns_${language} WHERE number = ?
  `, [number]);
  
  if (!results.length || !results[0].values.length) {
    return null;
  }
  
  const columns = results[0].columns;
  const row = results[0].values[0];
  
  const hymn: Record<string, any> = {};
  columns.forEach((col, i) => {
    hymn[col] = row[i];
  });
  
  return {
    id: hymn.id,
    number: hymn.number,
    title: hymn.title,
    markdown: hymn.markdown,
  };
};

// Search hymns by query
export const searchHymns = (query: string, language: Language): Hymn[] => {
  if (!db) throw new Error('Database not initialized');
  
  const results = db.exec(`
    SELECT * FROM hymns_${language}
    WHERE number LIKE ? OR title LIKE ? OR markdown LIKE ?
    ORDER BY number
  `, [`%${query}%`, `%${query}%`, `%${query}%`]);
  
  if (!results.length || !results[0].values.length) {
    return [];
  }
  
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const hymn: Record<string, any> = {};
    columns.forEach((col, i) => {
      hymn[col] = row[i];
    });
    
    return {
      id: hymn.id,
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown,
    };
  });
};

// Save or update a hymn
export const saveHymn = (hymn: Hymn, language: Language): void => {
  if (!db) throw new Error('Database not initialized');
  
  try {
    db.exec(`
      INSERT OR REPLACE INTO hymns_${language} (id, number, title, markdown)
      VALUES (?, ?, ?, ?)
    `, [hymn.id, hymn.number, hymn.title, hymn.markdown]);
    
    toast.success('Hymn saved successfully');
  } catch (error) {
    console.error('Failed to save hymn:', error);
    toast.error('Failed to save hymn');
    throw error;
  }
};

// Export the database as a Uint8Array
export const exportDatabase = (): Uint8Array => {
  if (!db) throw new Error('Database not initialized');
  return db.export();
};

// Import database from a Uint8Array
export const importDatabase = (data: Uint8Array): void => {
  if (!db) throw new Error('Database not initialized');
  db.close();
  const SQL = require('sql.js');
  db = new SQL.Database(data);
};
