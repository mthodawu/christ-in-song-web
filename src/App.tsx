import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HymnProvider } from "@/context/HymnContext";
import Index from "./pages/Index";
import HymnPage from "./pages/HymnPage";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import { useEffect, useState } from "react";
import { Language } from "./types/hymn";
import {
  loadPreferences,
  savePreferences,
} from "./services/preferencesService";

const queryClient = new QueryClient();

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDualMode, setIsDualMode] = useState(false);
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>("english");
  const [secondaryLanguage, setSecondaryLanguage] = useState<Language | null>(
    null
  );

  // Load preferences when the app starts
  useEffect(() => {
    const storedPreferences = loadPreferences();
    if (storedPreferences) {
      setIsDarkMode(storedPreferences.isDarkMode);
      setIsDualMode(storedPreferences.isDualMode);
      setPrimaryLanguage(storedPreferences.primaryLanguage);
      setSecondaryLanguage(storedPreferences.secondaryLanguage || null);
    }
  }, []);

  // Save preferences whenever they change
  useEffect(() => {
    savePreferences({
      isDarkMode,
      isDualMode,
      primaryLanguage,
      secondaryLanguage,
    });
  }, [isDarkMode, isDualMode, primaryLanguage, secondaryLanguage]);

  return (
    <QueryClientProvider client={queryClient}>
      <HymnProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/hymn/:id" element={<HymnPage />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HymnProvider>
    </QueryClientProvider>
  );
};

export default App;
