export type Language =  'chichewa' | 'dholuo' | 'english' |  'ndebele' | 'pt' |  'sdah' | 'shona' | 'sotho' | 'swahili' | 
  'tonga' | 'tswana' | 'venda' | 'xhosa' | 'xitsonga';

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
