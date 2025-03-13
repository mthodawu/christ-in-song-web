import { Language, Hymn, HymnData } from "@/types/hymn";

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

const loadHymnsForLanguage = async (language: Language): Promise<Hymn[]> => {
  if (hymnsCache[language]) {
    return hymnsCache[language];
  }

  try {
    // console.log(`Loading hymns for ${language}...`);
    const response = await fetch(`/data/${language.toLowerCase()}.json`);
    const data = await response.json();

    const processedHymns = data.map((hymn: any, index: number) => {
      const processedHymn: Hymn = {
        id: hymn.id || `${language.toLowerCase()}-${hymn.number}`,
        number: hymn.number,
        title: hymn.title,
        markdown: hymn.markdown,
        verses: processMarkdownToVerses(hymn.markdown),
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
      !trimmedLine.startsWith("**CHORUS:**")
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
  const results: Array<Hymn & { language: Language }> = [];

  const primaryHymns = await loadHymnsForLanguage(primaryLanguage);
  const primaryResults = primaryHymns
    .filter(
      (hymn) =>
        hymn.number.toString().includes(query.toLowerCase()) ||
        hymn.title.toLowerCase().includes(query.toLowerCase()) ||
        hymn.markdown.toLowerCase().includes(query.toLowerCase())
    )
    .map((hymn) => ({ ...hymn, language: primaryLanguage }));

  results.push(...primaryResults);

  for (const language of availableLanguages) {
    if (language === primaryLanguage) continue;

    const hymns = await loadHymnsForLanguage(language);
    const languageResults = hymns
      .filter(
        (hymn) =>
          hymn.number.toString().includes(query.toLowerCase()) ||
          hymn.title.toLowerCase().includes(query.toLowerCase()) ||
          hymn.markdown.toLowerCase().includes(query.toLowerCase())
      )
      .map((hymn) => ({ ...hymn, language }));

    results.push(...languageResults);
  }

  return results;
};

export const getHymnById = async (
  id: string,
  language: Language
): Promise<Hymn | null> => {
  try {
    const hymns = await loadHymnsForLanguage(language);

    // First try to find by exact ID
    let hymn = hymns.find((h) => h.id === id);

    // If not found and the ID might contain a hymn number, try to find by number
    if (!hymn && id.includes("-")) {
      const hymnNumberStr = id.split("-")[1];
      if (hymnNumberStr) {
        const hymnNumber = parseInt(hymnNumberStr, 10);
        if (!isNaN(hymnNumber)) {
          hymn = hymns.find((h) => h.number === hymnNumber);
        }
      }
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
    const hymns = await loadHymnsForLanguage(language);
    return hymns.find((h) => h.number === number) || null;
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
