
import { Language, Hymn } from "@/types/hymn";
import * as mongoDbService from './mongoDbService';
import { processMarkdownToVerses } from './verseService';

export const availableLanguages: Language[] = [
  "chichewa",
  "dholuo",
  "english",
  "ndebele",
  "pt",
  "sdah",
  "shona",
  "sotho",
  "swahili",
  "tonga",
  "tswana",
  "venda",
  "xhosa",
  "xitsonga",
];

// Initialize the database when the app starts
export const initializeHymnService = async (mongoDbUri: string): Promise<void> => {
  await mongoDbService.initMongoDB(mongoDbUri);
  await mongoDbService.setupCollections(availableLanguages);
};

export const getAllHymnsForLanguage = async (
  language: Language
): Promise<Hymn[]> => {
  try {
    const hymns = await mongoDbService.getHymnsByLanguage(language);
    return hymns.map(hymn => ({
      ...hymn,
      verses: processMarkdownToVerses(hymn.markdown),
    }));
  } catch (error) {
    console.error(`Failed to load hymns for ${language}:`, error);
    return [];
  }
};

export const getHymnById = async (
  id: string,
  language: Language
): Promise<Hymn | null> => {
  try {
    const hymn = await mongoDbService.getHymnById(id, language);
    
    if (!hymn) {
      // If not found and the ID might contain a hymn number, try to find by number
      if (id.includes("-")) {
        const hymnNumberStr = id.split("-")[1];
        if (hymnNumberStr) {
          const hymnNumber = parseInt(hymnNumberStr, 10);
          if (!isNaN(hymnNumber)) {
            const hymnByNumber = await mongoDbService.getHymnByNumber(hymnNumber, language);
            if (hymnByNumber) {
              return {
                ...hymnByNumber,
                verses: processMarkdownToVerses(hymnByNumber.markdown),
              };
            }
          }
        }
      }
      return null;
    }
    
    return {
      ...hymn,
      verses: processMarkdownToVerses(hymn.markdown),
    };
  } catch (error) {
    console.error(`Failed to get hymn with ID ${id}:`, error);
    return null;
  }
};

export const getHymnByNumber = async (
  number: number,
  language: Language
): Promise<Hymn | null> => {
  try {
    const hymn = await mongoDbService.getHymnByNumber(number, language);
    if (!hymn) return null;
    
    return {
      ...hymn,
      verses: processMarkdownToVerses(hymn.markdown),
    };
  } catch (error) {
    console.error(`Failed to get hymn with number ${number}:`, error);
    return null;
  }
};

export const searchHymnsAcrossLanguages = async (
  query: string,
  primaryLanguage: Language
): Promise<Array<Hymn & { language: Language }>> => {
  const results: Array<Hymn & { language: Language }> = [];

  try {
    // Search in primary language first
    const primaryResults = await mongoDbService.searchHymns(query, primaryLanguage);
    const processedPrimaryResults = primaryResults.map(hymn => ({
      ...hymn,
      verses: processMarkdownToVerses(hymn.markdown),
      language: primaryLanguage
    }));
    
    results.push(...processedPrimaryResults);

    // Then search in other languages
    for (const language of availableLanguages) {
      if (language === primaryLanguage) continue;

      const languageResults = await mongoDbService.searchHymns(query, language);
      const processedLanguageResults = languageResults.map(hymn => ({
        ...hymn,
        verses: processMarkdownToVerses(hymn.markdown),
        language
      }));

      results.push(...processedLanguageResults);
    }
  } catch (error) {
    console.error('Error searching hymns:', error);
  }

  return results;
};

export const saveHymn = async (hymn: Hymn, language: Language): Promise<void> => {
  try {
    await mongoDbService.saveHymn(hymn, language);
  } catch (error) {
    console.error('Failed to save hymn:', error);
    throw error;
  }
};

export default {
  availableLanguages,
  initializeHymnService,
  getAllHymnsForLanguage,
  getHymnById,
  getHymnByNumber,
  searchHymnsAcrossLanguages,
  saveHymn,
};
