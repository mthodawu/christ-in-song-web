
import React, { createContext, useContext, useState } from 'react';
import { Language } from '@/types/hymn';

interface HymnContextType {
  primaryLanguage: Language;
  setPrimaryLanguage: (lang: Language) => void;
  secondaryLanguage: Language | null;
  setSecondaryLanguage: (lang: Language | null) => void;
  isDualMode: boolean;
  setIsDualMode: (isDual: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const HymnContext = createContext<HymnContextType | undefined>(undefined);

export function HymnProvider({ children }: { children: React.ReactNode }) {
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>('English');
  const [secondaryLanguage, setSecondaryLanguage] = useState<Language | null>(null);
  const [isDualMode, setIsDualMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
