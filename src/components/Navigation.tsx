
import { Moon, Sun, Languages, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHymn } from '@/context/HymnContext';
import type { Language } from '@/types/hymn';

const Navigation = () => {
  const {
    primaryLanguage,
    setPrimaryLanguage,
    secondaryLanguage,
    setSecondaryLanguage,
    isDualMode,
    setIsDualMode,
    isDarkMode,
    setIsDarkMode,
    availableLanguages,
    searchQuery,
    setSearchQuery
  } = useHymn();

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b z-10">
      <div className="max-w-4xl mx-auto px-4 py-2 flex flex-wrap justify-between items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Languages className="mr-2" />
              {primaryLanguage}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {availableLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setPrimaryLanguage(lang)}
              >
                {lang}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative flex-1 mx-2 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search hymns..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsDualMode(!isDualMode)}
            className={isDualMode ? 'bg-primary text-primary-foreground' : ''}
          >
            Dual Mode
          </Button>

          {isDualMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Secondary: {secondaryLanguage || 'Select'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {availableLanguages.filter((lang) => lang !== primaryLanguage).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setSecondaryLanguage(lang)}
                  >
                    {lang}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="outline" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
