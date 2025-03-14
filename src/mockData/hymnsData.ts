
import { Language, Hymn } from "@/types/hymn";

const mockHymns: Record<Language, Hymn[]> = {
  "english": [
    {
      id: "english-1",
      number: 1,
      title: "Praise to the Lord",
      markdown: "Praise to the Lord, the Almighty, the King of creation!\nO my soul, praise Him, for He is thy health and salvation!\nAll ye who hear, now to His temple draw near;\nPraise Him in glad adoration.",
    },
    {
      id: "english-2",
      number: 2,
      title: "All Creatures of Our God and King",
      markdown: "All creatures of our God and King\nLift up your voice and with us sing,\nAlleluia! Alleluia!\nThou burning sun with golden beam,\nThou silver moon with softer gleam!",
    }
  ],
  "chichewa": [],
  "dholuo": [],
  "ndebele": [],
  "pt": [],
  "sdah": [],
  "shona": [],
  "sotho": [],
  "swahili": [],
  "tonga": [],
  "tswana": [],
  "venda": [],
  "xhosa": [],
  "xitsonga": []
};

export const getMockHymnsByLanguage = (language: Language): Hymn[] => {
  return mockHymns[language] || [];
};

export const getMockHymnByNumber = (language: Language, number: string): Hymn | null => {
  return mockHymns[language]?.find(hymn => hymn.number.toString() === number) || null;
};

export const getMockHymnById = (language: Language, id: string): Hymn | null => {
  return mockHymns[language]?.find(hymn => hymn.id === id) || null;
};

export const searchMockHymns = (language: Language, query: string): Hymn[] => {
  const lowerQuery = query.toLowerCase();
  return mockHymns[language]?.filter(hymn => 
    hymn.title.toLowerCase().includes(lowerQuery) || 
    hymn.markdown.toLowerCase().includes(lowerQuery) ||
    hymn.number.toString().includes(query)
  ) || [];
};

export default {
  getMockHymnsByLanguage,
  getMockHymnByNumber,
  getMockHymnById,
  searchMockHymns
};
