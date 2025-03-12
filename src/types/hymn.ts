
export type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Italian' | 'Portuguese' | 'Chinese' | 'Korean' |
  'Abagusii' | 'Chichewa' | 'DG' | 'Dholuo' | 'ES' | 'Gikuyu' | 'HL' | 'Kinyarwanda' | 'Kirundi' | 'Ndebele' | 
  'PT' | 'RU' | 'SDAH' | 'Shona' | 'Sotho' | 'Swahili' | 'Tonga' | 'Tswana' | 'Venda' | 'Xhosa' | 'Xitsonga';

export interface Verse {
  number: number;
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
