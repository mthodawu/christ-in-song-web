import {
  Moon,
  Sun,
  Languages,
  Search,
  Grip,
  BadgeInfo,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
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
import type { Language } from "@/types/hymn";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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
    setSearchQuery,
  } = useHymn();

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  const navigate = useNavigate();
  const [hymnNumber, setHymnNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [info, setInfo] = useState(false);

  const handleNumberClick = (num: number) => {
    if (hymnNumber.length < 3) {
      // Prevent more than 3 digits
      setHymnNumber((prev) => prev + num.toString());
    }
  };

  const handleBackspace = () => {
    setHymnNumber((prev) => prev.slice(0, -1));
  };

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
        default:
          break;
        // Handle number keys
        // if (event.key >= "0" && event.key <= "9") {
        //   if (!isNumberPadActive) {
        //     setNumberBuffer(event.key);
        //     setIsNumberPadActive(true);
        //   } else if (numberBuffer.length < 3) {
        //     setNumberBuffer(prev => prev + event.key);
        //   }
        // }
      }
    },
    [navigate, setIsDualMode, isDarkMode, setIsDarkMode]
  );

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b z-10">
      <div className="max-w-5xl mx-auto px-4 py-2 flex flex-wrap justify-between items-center gap-2">
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

        {/* <div className="relative flex-1 mx-2 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search hymns..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div> */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Grip className="mr-2" />
              123
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[275px]">
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
              className="mb-4"
            />
            <div className="grid grid-cols-3 gap-2">
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

        <Dialog open={info} onOpenChange={setInfo}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <BadgeInfo className="mr-2" />
              help
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[375px]">
            <DialogHeader>
              <DialogTitle>Go to Hymn</DialogTitle>
              <DialogDescription>
                Enter hymn number to navigate
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <p className="text-sm text-muted-foreground">
                  Press <strong>B</strong> to go back to the list of hymns.
                </p>
                <p className="text-sm text-muted-foreground">
                  Press <strong>D</strong> to toggle dual languages mode.
                </p>
                <p className="text-sm text-muted-foreground">
                  Press <strong>V</strong> to toggle dark mode.
                </p>
              </div>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="w-full">
                <AccordionTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center justify-between w-1/2 text-center">
                    <span>About this app</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground text-justify">
                      This Christ in Song web app was developed by iLanga
                      Creatives to help users easily navigate, and project hymns
                      in multiple languages during worship services.
                    </p>
                    {/* <p className="text-sm text-muted-foreground">
                  Visit us at: <a href="https://ilangacreatives.co.za" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">ilangacreatives.co.za</a>
                </p> */}
                    <p className="text-sm text-muted-foreground">
                      For any queries or feedback, please contact us:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      <li>
                        Email:{" "}
                        <a
                          href="mailto:ilangacreatives@gmail.com"
                          className="text-orange-600 hover:underline"
                        >
                          ilangacreatives@gmail.com
                        </a>
                      </li>
                      <li>
                        Instagram:{" "}
                        <a
                          href="https://instagram.com/ilangacreatives"
                          className="text-orange-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          @ilangacreatives
                        </a>
                      </li>
                      <li>
                        Website:{" "}
                        <a
                          href="https://ilangacreatives.co.za"
                          className="text-orange-600 hover:underline group inline-flex items-center gap-1"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          ilangacreatives.co.za
                          <Rocket className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </DialogContent>
        </Dialog>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsDualMode(!isDualMode)}
            className={isDualMode ? "bg-primary text-primary-foreground" : ""}
          >
            Dual Mode
          </Button>

          {isDualMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Secondary: {secondaryLanguage || "Select"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {availableLanguages
                  .filter((lang) => lang !== primaryLanguage)
                  .map((lang) => (
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
