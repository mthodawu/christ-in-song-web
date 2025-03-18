
import { Language, Hymn, HymnData } from "@/types/hymn";
import axios from "axios";

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

const loadHymnsForLanguage = async (language: Language): Promise<Hymn[]> => {
  if (hymnsCache[language]) {
    return hymnsCache[language];
  }

  try {
    console.log(`Loading hymns for ${language}... ${API_BASE_URL}/hymns/${language.toLowerCase()}`);
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

  const lines = markdown.split("\n");
  const verses = [];
  let currentVerse = "";
  let chorus = "";
  let verseNumber = 1;
  let isChorus = false;

  for (const line of lines) {
    const trimmedLine = line;
    
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
    } else if (trimmedLine.startsWith("  **CHORUS:**")) {
      isChorus = true;
      currentVerse += trimmedLine.replace("  **CHORUS:**", "Chorus: ");
    } else if (
      !trimmedLine.startsWith("###") &&
      !trimmedLine.startsWith("**CHORUS:**") &&
      !trimmedLine.startsWith("Verse") &&
      !trimmedLine.startsWith("**") &&
      !trimmedLine.startsWith("Chorus") &&
      !(trimmedLine === "") &&
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
    console.log(`Updating hymn ${id} in ${language}`);
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
    console.log("getHymnById called with id:", id, "and language:", language);
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

export default {
  availableLanguages,
  getAllHymnsForLanguage,
  getHymnById,
  getHymnByNumber,
  // searchHymnsAcrossLanguages,
  updateHymn,
};
