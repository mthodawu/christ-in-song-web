import { Language, Hymn, HymnData } from '@/types/hymn';

export const availableLanguages: Language[] = [
  'abagusii', 'chichewa', 'dg', 'dholuo', 'english', 'es', 'gikuyu', 'hl',
  'kinyarwanda', 'kirundi', 'ndebele', 'pt', 'ru', 'sdah', 'shona', 'sotho',
  'swahili', 'tonga', 'tswana', 'venda', 'xhosa', 'xitsonga'
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

const processMarkdownToVerses = (markdown: string): { number: number; content: string }[] => {
  if (!markdown) return [];
  
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
  
  if (currentVerse !== '') {
    verses.push({ number: verseNumber, content: currentVerse.trim() });
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
    .filter(hymn => 
      hymn.number.toString().includes(query.toLowerCase()) ||
      hymn.title.toLowerCase().includes(query.toLowerCase()) ||
      hymn.markdown.toLowerCase().includes(query.toLowerCase())
    )
    .map(hymn => ({ ...hymn, language: primaryLanguage }));
  
  results.push(...primaryResults);
  
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
