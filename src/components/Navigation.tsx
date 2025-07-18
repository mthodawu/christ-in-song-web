import {
  Moon,
  Sun,
  Languages,
  // Search,
  Grip,
  BadgeInfo,
  Maximize,
  Minimize,
  MessageCircleQuestion,
  BookOpenText,
  Search,
} from "lucide-react";
import {
  savePreferences,
  loadPreferences,
} from "../services/preferencesService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHymn } from "@/context/HymnContext";
import config from "../config.json";
import { LanguageConfig } from "../types/hymn";
import HymnList from "@/components/HymnList";
import { DialogFooter } from "@/components/ui/dialog";
import MobileSidebar from "./Sidebar";

const Navigation = () => {
  const languageOptions = config.map((lang: LanguageConfig) => ({
    value: lang.key,
    label: `${lang.title} (${lang.language})`,
  }));

  // Add handlers for language changes
  const handlePrimaryLanguageChange = (value: string) => {
    setPrimaryLanguage(value);
  };

  const handleSecondaryLanguageChange = (value: string) => {
    setSecondaryLanguage(value);
  };

  const {
    isDualMode,
    setIsDualMode,
    isDarkMode,
    setIsDarkMode,
    primaryLanguage,
    secondaryLanguage,
    setPrimaryLanguage,
    setSecondaryLanguage,
    availableLanguages,
    searchQuery,
    setSearchQuery,
  } = useHymn();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [info, setInfo] = useState(false);
  const [isWatchDemoOpen, setIsWatchDemoOpen] = useState(false);
  const [hymnNumber, setHymnNumber] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [url, setUrl] = useState(window.location.pathname);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        setIsFullscreen(false);
      }
    }
  };

  // Update fullscreen state when it changes outside our control (e.g. Esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  const navigate = useNavigate();

  const handleNumberClick = (num: number) => {
    if (hymnNumber.length < 3) {
      // Prevent more than 3 digits
      setHymnNumber((prev) => prev + num.toString());
    }
  };

  const handleBackspace = () => {
    setHymnNumber((prev) => prev.slice(0, -1));
  };

  const isSDAH = primaryLanguage === "sdah";

  const handleGo = () => {
    if (hymnNumber) {
      navigate(`/hymn/${primaryLanguage.toLowerCase()}-${hymnNumber}`, {
        state: { language: primaryLanguage },
      });
      setHymnNumber("");
      setIsOpen(false);
    }
  };
  // Handle keyboard navigation
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Ignore key events if they originated in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "b":
          navigate("/");
          break;
        case "d":
          setIsDualMode(!isDualMode);
          break;
        case "v":
          const newMode = !isDarkMode;
          setIsDarkMode(newMode);
          document.documentElement.classList.toggle("dark", newMode);
          break;
        case "i":
          setInfo(!info);
          break;
        case "f":
          toggleFullscreen();
          break;
        case "q":
          event.preventDefault();
          setIsSearchOpen(true);
          // setLocalSearch("");
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          setIsOpen(!isOpen);
          break;
        case "enter":
          if (isOpen) {
            handleGo();
          }
          break;
        default:
          break;
      }
    },
    [navigate, setIsDualMode, isDarkMode, setIsDarkMode, toggleFullscreen]
  );

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  // Save preferences whenever they change
  useEffect(() => {
    savePreferences({
      isDarkMode,
      isDualMode,
      primaryLanguage,
      secondaryLanguage,
    });
  }, [isDarkMode, isDualMode, primaryLanguage, secondaryLanguage]);

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

  // Search submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setShowResults(true);
    setLocalSearch("");
  };

  // Reset results when dialog closes
  useEffect(() => {
    if (!isSearchOpen) {
      setShowResults(false);
      setLocalSearch("");
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b z-10 transition-all duration-300",
        isFullscreen && "opacity-0 hover:opacity-100"
      )}
    >
      <div className="max-w-5xl mx-auto px-4 py-2 flex flex-wrap justify-between items-center gap-2">
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Languages className="md:mr-2 sm:-mr-2" />
                <span className="hidden md:block max-w-32 truncate overflow-hidden">
                  {languageOptions.find((opt) => opt.value === primaryLanguage)
                    ?.label || primaryLanguage}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4}>
              {languageOptions.map((lang) => (
                <DropdownMenuItem
                  key={lang.value}
                  onClick={() => handlePrimaryLanguageChange(lang.value)}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="sm:-mx-2 sm:-px-2">
                <Grip /> <span className="hidden md:block">123</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[375px]">
              <DialogHeader>
                <DialogTitle>Go to Hymn</DialogTitle>
                <DialogDescription>
                  Enter hymn number to navigate
                </DialogDescription>
              </DialogHeader>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter hymn number"
                value={hymnNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length <= 3) {
                    setHymnNumber(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGo();
                  }
                }}
                className="mb-4"
              />
              <div className="md:grid grid-cols-3 gap-2 hidden  mx-auto -mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    onClick={() => handleNumberClick(num)}
                    className="rounded-full -px-3"
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={handleBackspace}
                  className="col-span-1"
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNumberClick(0)}
                  className="col-span-1"
                >
                  0
                </Button>
                <Button
                  variant="default"
                  onClick={handleGo}
                  className="col-span-1"
                >
                  Go
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogTrigger asChild>
            <div className="flex-1 flex justify-center">
              <Button
                variant="outline"
                className="w-full md:max-w-[250px] sm:-mx-2 sm:-px-2 flex items-center justify-start"
              >
                <Search className="text-muted-foreground" />{" "}
                <p className=" text-muted-foreground  sm:inline-flex hidden ">
                  search <span className="hidden lg:block ml-1">{" "} lyrics or title</span>
                </p>
              </Button>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Search hymns by song title or lyrics</DialogTitle>
              <DialogDescription>
                {languageOptions.find((opt) => opt.value === primaryLanguage)
                  ?.label || "Current Hymnal"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSearchSubmit}>
              <Input
                type="search"
                placeholder="Search hymns..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="mb-4"
                autoFocus
              />
              <DialogFooter>
                <Button type="submit" variant="default" className="w-full">
                  Search
                </Button>
              </DialogFooter>
            </form>
            {showResults && (
              <div className="mt-6 max-h-80 overflow-y-scroll ">
                <HymnList onHymnClick={() => setIsSearchOpen(false)} />
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="flex gap-2">
          <Dialog open={info} onOpenChange={setInfo}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hidden md:flex">
                <BadgeInfo className="" />
                <span className="hidden md:block">help</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[375px] md:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Help & info</DialogTitle>
                <DialogDescription>
                  Keyboard shortcuts for navigation and functionality.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3">
                  <h4 className="text-md font-semibold">General Shortcuts</h4>
                  <p className="text-sm text-muted-foreground">
                    Press <strong>F</strong> to toggle fullscreen mode.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Press <strong>V</strong> to toggle dark mode.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Press <strong>I</strong> to open this info panel again.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Press <strong>ESC</strong> to close this dialog.
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Press any key <strong>0-9</strong> to open the hymn number
                    pad.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Press <strong>Q</strong> to search by title or lyrics.
                    <span className="ml-1 bg-blue-100 text-blue-500 text-xs px-1 items-center rounded-full">
                      new
                    </span>
                  </p>
                  <h4 className="text-md font-semibold mt-4">Hymn Shortcuts</h4>
                  <p className="text-sm text-muted-foreground">
                    Press <strong>B</strong> to go back to the list of hymns.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Press <strong>D</strong> to select second language.
                    <span className="ml-1 bg-blue-100 text-blue-500 text-xs px-1 items-center rounded-full">
                      new
                    </span>
                  </p>
                  {/* <p className="text-sm text-muted-foreground">
                    Press <strong>E</strong> to edit hymns on the Hymn page.
                  </p> */}
                  <p className="text-sm text-muted-foreground -my-1">
                    Press <strong className="text-lg ">&#8678;</strong> to go to
                    the previous verse.
                  </p>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Press <strong className="text-lg ">&#8680;</strong> to go to
                    the next verse.
                  </p>
                  <p className="text-sm text-muted-foreground -my-1">
                    Press <strong>SHIFT+</strong>
                    <strong className="text-lg ">&#8678;</strong> to go to the
                    previous song.
                  </p>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Press <strong>SHIFT+</strong>
                    <strong className="text-lg ">&#8680;</strong> to go to the
                    next song.
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate("/about")}>
                app info & demo
                <MessageCircleQuestion className="mr-2 h-4 w-4" />
              </Button>
            </DialogContent>
          </Dialog>

          {!isSDAH && (
            <Button
              variant="outline"
              onClick={() => setIsDualMode(!isDualMode)}
              className={isDualMode ? "bg-primary text-primary-foreground" : ""}
            >
              <BookOpenText className="" />
              {!isDualMode && (
                <span className="hidden md:block">dual language mode</span>
              )}
            </Button>
          )}

          {isDualMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Languages className="md:mr-2 sm:-mr-2" />
                  <span className="hidden md:block max-w-3 truncate overflow-hidden">
                    {languageOptions.find(
                      (opt) => opt.value === secondaryLanguage
                    )?.label || "Select language"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
                {languageOptions
                  .filter((lang) => lang.value !== primaryLanguage)
                  .map((lang) => (
                    <DropdownMenuItem
                      key={lang.value}
                      onClick={() => handleSecondaryLanguageChange(lang.value)}
                    >
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="outline" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize /> : <Maximize />}
          </Button>

          <Button variant="outline" className="hidden md:flex" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun /> : <Moon />}
          </Button>

          {/* Mobile sidebar trigger */}
          <div className="md:hidden">
            <MobileSidebar
              onDualMode={() => setIsDualMode(!isDualMode)}
              onDarkMode={toggleDarkMode}
              onInfo={() => setInfo(true)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
