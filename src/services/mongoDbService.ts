
import { MongoClient, Db, Collection } from 'mongodb';
import { Hymn, Language } from '@/types/hymn';
import { toast } from 'sonner';

// MongoDB connection instance
let client: MongoClient | null = null;
let db: Db | null = null;
const HYMNS_COLLECTION_PREFIX = 'hymns_';

// Initialize MongoDB connection
export const initMongoDB = async (connectionString: string): Promise<void> => {
  try {
    if (client) return; // Already connected

    // Create a MongoDB client
    client = new MongoClient(connectionString);
    
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database (we'll use 'hymns_db')
    db = client.db('hymns_db');
    
    toast.success('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    toast.error('Failed to connect to MongoDB');
    throw error;
  }
};

// Get collection for a specific language
const getHymnsCollection = (language: Language): Collection => {
  if (!db) throw new Error('MongoDB not initialized');
  return db.collection(`${HYMNS_COLLECTION_PREFIX}${language}`);
};

// Create collections for each language and load initial data
export const setupCollections = async (languages: Language[]): Promise<void> => {
  if (!db) throw new Error('MongoDB not initialized');
  
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

// Get all hymns for a language
export const getHymnsByLanguage = async (language: Language): Promise<Hymn[]> => {
  if (!db) throw new Error('MongoDB not initialized');
  
  try {
    const collection = getHymnsCollection(language);
    const hymns = await collection.find({}).sort({ number: 1 }).toArray();
    
    return hymns.map(hymn => ({
      id: hymn.id,
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown
    }));
  } catch (error) {
    console.error(`Failed to get hymns for ${language}:`, error);
    return [];
  }
};

// Get a hymn by ID
export const getHymnById = async (id: string, language: Language): Promise<Hymn | null> => {
  if (!db) throw new Error('MongoDB not initialized');
  
  try {
    const collection = getHymnsCollection(language);
    const hymn = await collection.findOne({ _id: id });
    
    if (!hymn) return null;
    
    return {
      id: hymn.id,
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown
    };
  } catch (error) {
    console.error(`Failed to get hymn with ID ${id}:`, error);
    return null;
  }
};

// Get a hymn by number
export const getHymnByNumber = async (number: number, language: Language): Promise<Hymn | null> => {
  if (!db) throw new Error('MongoDB not initialized');
  
  try {
    const collection = getHymnsCollection(language);
    const hymn = await collection.findOne({ number: number });
    
    if (!hymn) return null;
    
    return {
      id: hymn.id,
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown
    };
  } catch (error) {
    console.error(`Failed to get hymn with number ${number}:`, error);
    return null;
  }
};

// Search hymns by query
export const searchHymns = async (query: string, language: Language): Promise<Hymn[]> => {
  if (!db) throw new Error('MongoDB not initialized');
  
  try {
    const collection = getHymnsCollection(language);
    
    // Create a text search query
    const hymns = await collection.find({
      $or: [
        { number: isNaN(parseInt(query)) ? null : parseInt(query) },
        { title: { $regex: query, $options: 'i' } },
        { markdown: { $regex: query, $options: 'i' } }
      ]
    }).sort({ number: 1 }).toArray();
    
    return hymns.map(hymn => ({
      id: hymn.id,
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown
    }));
  } catch (error) {
    console.error(`Failed to search hymns:`, error);
    return [];
  }
};

// Save or update a hymn
export const saveHymn = async (hymn: Hymn, language: Language): Promise<void> => {
  if (!db) throw new Error('MongoDB not initialized');
  
  try {
    const collection = getHymnsCollection(language);
    const id = hymn.id || `${language.toLowerCase()}-${hymn.number}`;
    
    await collection.updateOne(
      { _id: id },
      { 
        $set: {
          id: id, 
          number: hymn.number,
          title: hymn.title,
          markdown: hymn.markdown
        }
      },
      { upsert: true }
    );
    
    toast.success('Hymn saved successfully');
  } catch (error) {
    console.error('Failed to save hymn:', error);
    toast.error('Failed to save hymn');
    throw error;
  }
};

// Close MongoDB connection
export const closeMongoDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};
