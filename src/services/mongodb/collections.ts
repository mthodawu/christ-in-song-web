
import { Collection } from 'mongodb';
import { Language } from '@/types/hymn';
import { getDb } from './connection';

export const HYMNS_COLLECTION_PREFIX = 'hymns_';

/**
 * Get collection for a specific language
 */
export const getHymnsCollection = (language: Language): Collection => {
  return getDb().collection(`${HYMNS_COLLECTION_PREFIX}${language}`);
};

/**
 * Create collections for each language and load initial data
 */
export const setupCollections = async (languages: Language[]): Promise<void> => {
  const db = getDb();
  
  // Check if collections already exist
  const collections = await db.listCollections().toArray();
  const existingCollections = collections.map(c => c.name);
  
  for (const language of languages) {
    const collectionName = `${HYMNS_COLLECTION_PREFIX}${language}`;
    
    // Skip if collection already exists
    if (existingCollections.includes(collectionName)) {
      continue;
    }
    
    // Create collection for this language
    await db.createCollection(collectionName);
    
    // Load initial data from JSON
    try {
      const response = await fetch(`/data/${language.toLowerCase()}.json`);
      const hymns = await response.json();
      
      // Insert initial data with proper MongoDB _id
      const formattedHymns = hymns.map((hymn: any) => {
        const id = hymn.id || `${language.toLowerCase()}-${hymn.number}`;
        return {
          _id: id,
          id: id,
          number: hymn.number,
          title: hymn.title,
          markdown: hymn.markdown
        };
      });
      
      // Insert data if there are hymns
      if (formattedHymns.length > 0) {
        await getHymnsCollection(language).insertMany(formattedHymns);
        console.log(`Loaded ${formattedHymns.length} hymns for ${language}`);
      }
    } catch (error) {
      console.error(`Failed to load initial data for ${language}:`, error);
    }
  }
};
