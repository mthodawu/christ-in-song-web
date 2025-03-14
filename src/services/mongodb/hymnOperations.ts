
import { Hymn, Language } from '@/types/hymn';
import { getHymnsCollection } from './collections';
import { toast } from 'sonner';

/**
 * Get all hymns for a language
 */
export const getHymnsByLanguage = async (language: Language): Promise<Hymn[]> => {
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

/**
 * Get a hymn by ID
 */
export const getHymnById = async (id: string, language: Language): Promise<Hymn | null> => {
  try {
    const collection = getHymnsCollection(language);
    // Use string ID directly since we store string IDs, not ObjectIds
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

/**
 * Get a hymn by number
 */
export const getHymnByNumber = async (number: number, language: Language): Promise<Hymn | null> => {
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

/**
 * Search hymns by query
 */
export const searchHymns = async (query: string, language: Language): Promise<Hymn[]> => {
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

/**
 * Save or update a hymn
 */
export const saveHymn = async (hymn: Hymn, language: Language): Promise<void> => {
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
