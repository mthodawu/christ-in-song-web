
import { Language, Hymn } from "@/types/hymn";
import { apiService } from './apiService';
import { processMarkdownToVerses } from './verseService';

export const availableLanguages: Language[] = [
  "chichewa", "dholuo", "english", "ndebele", "pt",
  "sdah", "shona", "sotho", "swahili", "tonga",
  "tswana", "venda", "xhosa", "xitsonga",
];

export const getAllHymnsForLanguage = async (language: Language): Promise<Hymn[]> => {
  try {
    const response = await apiService.fetchData<Hymn[]>(`hymns/${language}`);
    if (response.error || !response.data) {
      throw new Error(response.error || 'No data received');
    }
    return response.data.map(hymn => ({
      ...hymn,
      verses: processMarkdownToVerses(hymn.markdown)
    }));
  } catch (error) {
    console.error('Error fetching hymns:', error);
    return [];
  }
};

export const getHymnByNumber = async (language: Language, number: string): Promise<Hymn | null> => {
  try {
    const response = await apiService.fetchData<Hymn>(`hymns/${language}/${number}`);
    if (response.error || !response.data) {
      return null;
    }
    return {
      ...response.data,
      verses: processMarkdownToVerses(response.data.markdown)
    };
  } catch (error) {
    console.error('Error fetching hymn:', error);
    return null;
  }
};

export const getHymnById = async (language: Language, id: string): Promise<Hymn | null> => {
  try {
    const response = await apiService.fetchData<Hymn>(`hymns/${language}/id/${id}`);
    if (response.error || !response.data) {
      return null;
    }
    return {
      ...response.data,
      verses: processMarkdownToVerses(response.data.markdown)
    };
  } catch (error) {
    console.error('Error fetching hymn by id:', error);
    return null;
  }
};

export const searchHymns = async (query: string, primaryLanguage: Language = "english"): Promise<Hymn[]> => {
  try {
    const response = await apiService.fetchData<Hymn[]>(`search?query=${encodeURIComponent(query)}&language=${primaryLanguage}`);
    if (response.error || !response.data) {
      throw new Error(response.error || 'No data received');
    }
    return response.data.map(hymn => ({
      ...hymn,
      verses: processMarkdownToVerses(hymn.markdown)
    }));
  } catch (error) {
    console.error('Error searching hymns:', error);
    return [];
  }
};

export const searchHymnsAcrossLanguages = async (query: string, primaryLanguage: Language = "english"): Promise<Array<Hymn & { language: Language }>> => {
  try {
    // For now we'll just search the primary language and add the language property
    const results = await searchHymns(query, primaryLanguage);
    return results.map(hymn => ({
      ...hymn,
      language: primaryLanguage
    }));
  } catch (error) {
    console.error('Error searching hymns across languages:', error);
    return [];
  }
};

export const saveHymn = async (hymn: Hymn, language: Language): Promise<void> => {
  try {
    const response = await fetch(`/api/hymns/${language}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hymn),
    });
    if (!response.ok) {
      throw new Error('Failed to save hymn');
    }
  } catch (error) {
    console.error('Failed to save hymn:', error);
    throw error;
  }
};

export default {
  availableLanguages,
  getAllHymnsForLanguage,
  getHymnByNumber,
  getHymnById,
  searchHymns,
  searchHymnsAcrossLanguages,
  saveHymn
};
