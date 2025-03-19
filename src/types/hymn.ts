export type Language = string; // Changed from explicit union type to string

export interface LanguageConfig {
    key: string;
    title: string;
    language: string;
}

export interface Verse {
  number?: number;
  content: string;
}

export interface Hymn {
  id?: string;
  number: number;
  title: string;
  markdown: string;
  verses?: Verse[];
}

export interface HymnData {
  language: Language;
  hymns: Hymn[];
}
