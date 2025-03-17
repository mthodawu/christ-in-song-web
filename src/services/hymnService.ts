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
): { number: number; content: string }[] => {
  if (!markdown) return [];

  const lines = markdown.split("\n");
  const verses = [];
  let currentVerse = "";
  let chorus = "";
  let verseNumber = 1;
  let isChorus = false;
  let hasChorus = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === "" && currentVerse !== "") {
      // if (hasChorus) {
      if (verseNumber == 2 && isChorus) {
        verseNumber++;
        verses.push({ content: chorus });
        console.log("VerseNumber: ", verseNumber )
        // chorus = "";
      }
      if (!isChorus && chorus !== "" && verseNumber !== 2) {
        verses.push({ number: verseNumber++, content: currentVerse.trim() });
         console.log("VerseNumber: ", verseNumber, "verse+: ", currentVerse)
        verses.push({ content: chorus });
        console.log("VerseNumber: ", verseNumber, "chorus: ", chorus)
      }
      // }
      else {
        verses.push({ number: verseNumber++, content: currentVerse.trim() });
        console.log("VerseNumber: ", verseNumber, "verse: ", currentVerse)
      }
      currentVerse = "";
      isChorus = false;
    } else if (trimmedLine.startsWith("**CHORUS:**")) {
      isChorus = true;
      currentVerse += trimmedLine.replace("**CHORUS:**", "Chorus: ");
      // if(isChorus){
      //   chorus = currentVerse.trim();
      //   hasChorus = true;
      // }
        } else if (
      !trimmedLine.startsWith("###") &&
      !trimmedLine.startsWith("**CHORUS:**") &&
      !trimmedLine.startsWith("Verse") &&
      !trimmedLine.startsWith("**") &&
      !trimmedLine.startsWith("Chorus") &&
      !/^\d+\./.test(trimmedLine) // Ignore lines starting with a number followed by a dot
        ) {
      currentVerse += trimmedLine + "\n";
      if (isChorus) {
        chorus = currentVerse.trim();
        hasChorus = true;
      }
    }
  }

  if (currentVerse !== "") {
    console.log("VerseNumber: ", verseNumber++, "verse--: ", currentVerse)
    verses.push({ number: verseNumber, content: currentVerse.trim() });
    verses.push({ content: chorus });
  }

  return verses;
};

export const searchHymnsAcrossLanguages = async (
  query: string,
  primaryLanguage: Language
): Promise<Array<Hymn & { language: Language }>> => {
  try {
    console.log('Searching hymns across languages with query:', query, 'and primary language:', primaryLanguage);
    const response = await axios.get(`${API_BASE_URL}/hymns/search/${primaryLanguage.toLowerCase()}`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search hymns:', error);
    return [];
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
  searchHymnsAcrossLanguages,
};
