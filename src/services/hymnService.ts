import { Language, Hymn, LanguageConfig } from "@/types/hymn";
import axios from "axios";
import config from '../config.json';

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

const hymnsCache: Record<Language, Hymn[]> = {} as Record<Language, Hymn[]>;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const decodeHtmlEntities = (text: string): string => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const loadHymnsForLanguage = async (language: Language): Promise<Hymn[]> => {
  if (hymnsCache[language]) {
    return hymnsCache[language];
  }

  try {
    // console.log(`Loading hymns for ${language}... ${API_BASE_URL}/hymns/${language.toLowerCase()}`);
    const response = await axios.get(`${API_BASE_URL}/hymns/${language.toLowerCase()}`);
    const hymns = response.data.map((hymn: any) => ({
      id: hymn.id || `${language.toLowerCase()}-${hymn.number}`,
      number: hymn.number,
      title: hymn.title,
      markdown: hymn.markdown,
      verses: processMarkdownToVerses(hymn.markdown),
    }));

    hymnsCache[language] = hymns;
    return hymns;
  } catch (error) {
    console.error(`Failed to load hymns for ${language}:`, error);
    return [];
  }
};

const processMarkdownToVerses = (
  markdown: string
): { number?: number; content: string }[] => {
  if (!markdown) return [];

  // Decode HTML entities in the markdown first
  const decodedMarkdown = decodeHtmlEntities(markdown);
  
  const lines = decodedMarkdown.split("\n");
  const verses = [];
  let currentVerse = "";
  let chorus = "";
  let verseNumber = 1;
  let isChorus = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine === "" && currentVerse !== "") {
      if (isChorus) {
        // Store chorus for later use
        chorus = currentVerse.trim();
        verses.push({ number: verseNumber++, content: currentVerse.trim() });
      } else {
        // Add verse
        verses.push({ number: verseNumber++, content: currentVerse.trim() });
        // Add chorus after each verse if we have one
        if (chorus) {
          verses.push({ content: chorus });
        }
      }
      currentVerse = "";
      isChorus = false;
    } else if (/\**[A-Z]{5,}\:/.test(trimmedLine) || trimmedLine.startsWith("**CHORUS:**")) {
      isChorus = true;
      currentVerse += trimmedLine.replace("**", "").replace(":**",":");
        } else if (
      !trimmedLine.startsWith("###") &&
      !trimmedLine.startsWith("**CHORUS:**") &&
      !trimmedLine.startsWith("Verse") &&
      !trimmedLine.startsWith("**") &&
      !trimmedLine.startsWith("Chorus") &&
      !(trimmedLine === "") &&
      !(/[A-Z]{2,}/.test(trimmedLine) && verseNumber === 1) &&
      !trimmedLine.startsWith("Doh is") &&
      !/^\d+\./.test(trimmedLine)
        ) {
      // Add the line with a line break
      currentVerse += (currentVerse ? "\n" : "") + trimmedLine;
    }
  }

  // Handle last verse
  if (currentVerse !== "") {
    if (!isChorus) {
      verses.push({ number: verseNumber, content: currentVerse.trim() });
      if (chorus) {
        verses.push({ content: chorus });
      }
    }
  }

  return verses;
};

export const updateHymn = async (
  id: string,
  language: Language,
  title: string,
  markdown: string
): Promise<Hymn | null> => {
  try {
    (`Updating hymn ${id} in ${language}`);
    const response = await axios.put(`${API_BASE_URL}/hymns/${language.toLowerCase()}/${id}`, {
      title,
      markdown
    });
    
    const updatedHymn = response.data;
    
    if (hymnsCache[language]) {
      const hymnIndex = hymnsCache[language].findIndex(h => h.id === id);
      if (hymnIndex !== -1) {
        hymnsCache[language][hymnIndex] = {
          ...updatedHymn,
          verses: processMarkdownToVerses(updatedHymn.markdown)
        };
      }
    }
    
    return {
      ...updatedHymn,
      verses: processMarkdownToVerses(updatedHymn.markdown)
    };
  } catch (error) {
    console.error(`Failed to update hymn with ID ${id}:`, error);
    return null;
  }
};


export const getHymnById = async (
  id: string,
  language: Language
): Promise<Hymn | null> => {
  try {
    // console.log("getHymnById called with id:", id, "and language:", language);
    const response = await axios.get(`${API_BASE_URL}/hymns/${language.toLowerCase()}/${id}`);
    const hymn = response.data;
    if (hymn) {
      hymn.verses = processMarkdownToVerses(hymn.markdown);
    }
    return hymn || null;
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
    const response = await axios.get(`${API_BASE_URL}/hymns/number/${number}`, {
      params: { language }
    });
    const hymn = response.data;
    if (hymn) {
      hymn.verses = processMarkdownToVerses(hymn.markdown);
    }
    return hymn || null;
  } catch (error) {
    console.error(`Failed to get hymn with number ${number}:`, error);
    return null;
  }
};

export const getAllHymnsForLanguage = async (
  language: Language
): Promise<Hymn[]> => {
  return loadHymnsForLanguage(language);
};

export const getAvailableLanguages = (): LanguageConfig[] => {
  return config;
};

export const isValidLanguage = (language: string): boolean => {
  return config.some(lang => lang.key === language);
};

// Search hymns by title or markdown (case-insensitive, local search)
export const searchHymns = (
  hymns: Hymn[],
  search: string
): Hymn[] => {
  if (!search.trim()) return [];
  const lower = search.toLowerCase();
  return hymns.filter(
    (hymn) =>
      hymn.title.toLowerCase().includes(lower) ||
      hymn.markdown.toLowerCase().includes(lower)
  );
};

export default {
  availableLanguages,
  getAllHymnsForLanguage,
  getHymnById,
  getHymnByNumber,
  searchHymns,
  // searchHymnsAcrossLanguages,
  updateHymn,
  getAvailableLanguages,
  isValidLanguage,
};
