
export type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Chinese' | 'Korean';

export interface Verse {
  number: number;
  content: string;
}

export interface HymnTranslation {
  language: Language;
  title: string;
  verses: Verse[];
}

export interface Hymn {
  id: string;
  number: number;
  translations: HymnTranslation[];
}
