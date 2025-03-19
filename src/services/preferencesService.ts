import { Language } from "@/types/hymn";

interface UserPreferences {
  isDarkMode: boolean;
  isDualMode: boolean;
  primaryLanguage: Language;
  secondaryLanguage?: Language | null;
}

const PREFERENCES_KEY = "hymnverse-preferences";

export const savePreferences = (preferences: UserPreferences): void => {
  console.log("Saving preferences to localStorage...");
  console.log("Preferences to save:", preferences);
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
};

export const loadPreferences = (): UserPreferences | null => {
  console.log("Loading preferences from localStorage...");
  const stored = localStorage.getItem(PREFERENCES_KEY);
  console.log("Stored preferences:", stored);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse stored preferences:", e);
    return null;
  }
};
