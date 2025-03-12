
import { Language, Hymn, HymnData } from '@/types/hymn';

// Mock data - in a real app, this would be replaced with actual imports or API calls
const mockLanguageMapping: Record<string, Language> = {
  'english': 'English',
  'spanish': 'Spanish',
  'french': 'French',
  'german': 'German',
  'swahili': 'Swahili',
  'portuguese': 'Portuguese',
  'chinese': 'Chinese',
  'korean': 'Korean',
  // Add mappings for all the available languages
};

// This is a placeholder - in a real application, you would dynamically import these files
// or fetch them from an API
export const availableLanguages: Language[] = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Korean',
  'Swahili', 'Abagusii', 'Chichewa', 'Kinyarwanda', 'Kirundi'
];

const hymnsCache: Record<Language, Hymn[]> = {} as Record<Language, Hymn[]>;

// This would be replaced with actual file loading logic in a real app
const loadHymnsForLanguage = async (language: Language): Promise<Hymn[]> => {
  if (hymnsCache[language]) {
    return hymnsCache[language];
  }

  try {
    // In a real app, this would be a dynamic import or API call
    // For now we'll use the sample data from the existing hymnsData.json
    const response = await fetch(`/data/${language.toLowerCase()}.json`);
    const data = await response.json();
    
    // Process the data - add IDs if not present and process markdown to verses
    const processedHymns = data.map((hymn: any, index: number) => {
      const processedHymn: Hymn = {
        id: hymn.id || `${language.toLowerCase()}-${hymn.number}`,
        number: hymn.number,
        title: hymn.title,
        markdown: hymn.markdown,
        verses: processMarkdownToVerses(hymn.markdown)
      };
      return processedHymn;
    });
    
    hymnsCache[language] = processedHymns;
    return processedHymns;
  } catch (error) {
    console.error(`Failed to load hymns for ${language}:`, error);
    return [];
  }
};

// Helper function to process markdown into verses
const processMarkdownToVerses = (markdown: string): { number: number; content: string }[] => {
  if (!markdown) return [];
  
  // This is a simple parser - you might need a more sophisticated one depending on your markdown format
  const lines = markdown.split('\n');
  const verses = [];
  let currentVerse = '';
  let verseNumber = 1;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '' && currentVerse !== '') {
      verses.push({ number: verseNumber++, content: currentVerse.trim() });
      currentVerse = '';
    } else if (!trimmedLine.startsWith('###') && !trimmedLine.startsWith('**CHORUS:**')) {
      currentVerse += trimmedLine + ' ';
    }
  }
  
  // Add the last verse if there is one
  if (currentVerse !== '') {
    verses.push({ number: verseNumber, content: currentVerse.trim() });
  }
  
  return verses;
};

// Function to search hymns across all languages
export const searchHymnsAcrossLanguages = async (
  query: string,
  primaryLanguage: Language
): Promise<Array<Hymn & { language: Language }>> => {
  const results: Array<Hymn & { language: Language }> = [];
  
  // First search in the primary language
  const primaryHymns = await loadHymnsForLanguage(primaryLanguage);
  const primaryResults = primaryHymns
    .filter(hymn => 
      hymn.number.toString().includes(query.toLowerCase()) ||
      hymn.title.toLowerCase().includes(query.toLowerCase()) ||
      hymn.markdown.toLowerCase().includes(query.toLowerCase())
    )
    .map(hymn => ({ ...hymn, language: primaryLanguage }));
  
  results.push(...primaryResults);
  
  // Then search in other languages
  for (const language of availableLanguages) {
    if (language === primaryLanguage) continue;
    
    const hymns = await loadHymnsForLanguage(language);
    const languageResults = hymns
      .filter(hymn => 
        hymn.number.toString().includes(query.toLowerCase()) ||
        hymn.title.toLowerCase().includes(query.toLowerCase()) ||
        hymn.markdown.toLowerCase().includes(query.toLowerCase())
      )
      .map(hymn => ({ ...hymn, language }));
    
    results.push(...languageResults);
  }
  
  return results;
};

export const getHymnById = async (id: string, language: Language): Promise<Hymn | null> => {
  try {
    const hymns = await loadHymnsForLanguage(language);
    return hymns.find(h => h.id === id) || null;
  } catch (error) {
    console.error(`Failed to get hymn with ID ${id}:`, error);
    return null;
  }
};

export const getAllHymnsForLanguage = async (language: Language): Promise<Hymn[]> => {
  return loadHymnsForLanguage(language);
};

export default {
  availableLanguages,
  getAllHymnsForLanguage,
  getHymnById,
  searchHymnsAcrossLanguages
};
