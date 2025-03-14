import { Language, Hymn } from "@/types/hymn";
import * as mongoDBService from '../server/mongoService';
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
  await mongoDBService.initMongoDB(mongoDbUri);
  await mongoDBService.setupCollections(availableLanguages);
};

export const getAllHymnsForLanguage = async (
  language: Language
): Promise<Hymn[]> => {
  try {
    const hymns = await mongoDBService.getHymnsByLanguage(language);
    return hymns.map(hymn => ({
      ...hymn,
      verses: processMarkdownToVerses(hymn.markdown),
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown
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
    const hymn = await mongoDBService.getHymnById(language, id);
    
    if (!hymn) {
      // If not found and the ID might contain a hymn number, try to find by number
      if (id.includes("-")) {
        const hymnNumberStr = id.split("-")[1];
        if (hymnNumberStr) {
          const hymnNumber = hymnNumberStr;
          const hymnByNumber = await mongoDBService.getHymnByNumber(language, hymnNumber);
          if (hymnByNumber) {
            return {
              ...hymnByNumber,
              verses: processMarkdownToVerses(hymnByNumber.markdown),
              number: hymnByNumber.number,
              title: hymnByNumber.title,
              markdown: hymnByNumber.markdown
            };
          }
        }
      }
      return null;
    }
    
    return {
      ...hymn,
      verses: processMarkdownToVerses(hymn.markdown),
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown
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
    const hymn = await mongoDBService.getHymnByNumber(language, number.toString());
    if (!hymn) return null;
    
    return {
      ...hymn,
      verses: processMarkdownToVerses(hymn.markdown),
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown
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
    const primaryResults = await mongoDBService.searchHymns(primaryLanguage, query);
    const processedPrimaryResults = primaryResults.map(hymn => ({
      ...hymn,
      verses: processMarkdownToVerses(hymn.markdown),
      language: primaryLanguage,
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown
    }));
    
    results.push(...processedPrimaryResults);

    // Then search in other languages
    for (const language of availableLanguages) {
      if (language === primaryLanguage) continue;

      const languageResults = await mongoDBService.searchHymns(language, query);
      const processedLanguageResults = languageResults.map(hymn => ({
        ...hymn,
        verses: processMarkdownToVerses(hymn.markdown),
        language,
        number: hymn.number,
        title: hymn.title,
        markdown: hymn.markdown
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
    await mongoDBService.saveHymn(language, hymn);
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
