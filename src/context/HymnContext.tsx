import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Hymn } from '@/types/hymn';
import hymnService, { availableLanguages } from '@/services/hymnService';

interface HymnContextType {
  primaryLanguage: Language;
  setPrimaryLanguage: (lang: Language) => void;
  secondaryLanguage: Language | null;
  setSecondaryLanguage: (lang: Language | null) => void;
  isDualMode: boolean;
  setIsDualMode: (isDual: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  hymns: Hymn[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Array<Hymn & { language: Language }>;
  availableLanguages: Language[];
  totalHymns: number;
}

const HymnContext = createContext<HymnContextType | undefined>(undefined);

export function HymnProvider({ children }: { children: React.ReactNode }) {
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>('english');
  const [secondaryLanguage, setSecondaryLanguage] = useState<Language | null>(null);
  const [isDualMode, setIsDualMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<Hymn & { language: Language }>>([]);

  useEffect(() => {
    const loadHymns = async () => {
      setIsLoading(true);
      try {
        const loadedHymns = await hymnService.getAllHymnsForLanguage(primaryLanguage);
        setHymns(loadedHymns);
      } catch (error) {
        console.error('Failed to load hymns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHymns();
  }, [primaryLanguage]);

  // useEffect(() => {
  //   if (!searchQuery.trim()) {
  //     setSearchResults([]);
  //     return;
  //   }

  //   const timer = setTimeout(async () => {
  //     try {
  //       const results = await hymnService.searchHymnsAcrossLanguages(searchQuery, primaryLanguage);
  //       setSearchResults(results);
  //     } catch (error) {
  //       console.error('Search failed:', error);
  //     }
  //   }, 300);

  //   return () => clearTimeout(timer);
  // }, [searchQuery, primaryLanguage]);

  return (
    <HymnContext.Provider
      value={{
        primaryLanguage,
        setPrimaryLanguage,
        secondaryLanguage,
        setSecondaryLanguage,
        isDualMode,
        setIsDualMode,
        isDarkMode,
        setIsDarkMode,
        hymns,
        isLoading,
        searchQuery,
        setSearchQuery,
        searchResults,
        availableLanguages,
        totalHymns: hymns.length,
      }}
    >
      {children}
    </HymnContext.Provider>
  );
}

export function useHymn() {
  const context = useContext(HymnContext);
  if (context === undefined) {
    throw new Error('useHymn must be used within a HymnProvider');
  }
  return context;
}
