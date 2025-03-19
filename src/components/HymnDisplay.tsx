import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Edit,
  List,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHymn } from "@/context/HymnContext";
import hymnService from "@/services/hymnService";
import { cn } from "@/lib/utils";
import type { Hymn } from "@/types/hymn";
import EditHymnDialog from "./EditHymnDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HymnDisplayProps {
  hymn: Hymn;
  initialVerse?: number;
}

const HymnDisplay = ({ hymn, initialVerse = 0 }: HymnDisplayProps) => {
  const [currentVerse, setCurrentVerse] = useState(initialVerse);
  const {
    primaryLanguage,
    secondaryLanguage,
    isDualMode,
    setIsDualMode,
    isDarkMode,
    setIsDarkMode,
    totalHymns,
  } = useHymn();
  const navigate = useNavigate();
  const [secondaryHymn, setSecondaryHymn] = useState<Hymn | null>(null);
  const [formattedVerses, setFormattedVerses] = useState<React.ReactNode[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentHymn, setCurrentHymn] = useState<Hymn>(hymn);
  const [numberBuffer, setNumberBuffer] = useState<string>("");
  const [isNumberPadActive, setIsNumberPadActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitor fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle language change navigation
  useEffect(() => {
    if (currentHymn.number) {
      const expectedPath = `/hymn/${primaryLanguage.toLowerCase()}-${currentHymn.number}`;
      // Only navigate if language changes, not when hymn number changes
      if (window.location.pathname !== expectedPath && !window.location.pathname.includes(String(currentHymn.number))) {
        navigate(expectedPath, {
          state: { language: primaryLanguage, verse: currentVerse },
          replace: true,
        });
      }
    }
  }, [primaryLanguage]); // Only depend on language changes

  // Handle hymn update
  const handleHymnUpdated = (updatedHymn: Hymn) => {
    setCurrentHymn(updatedHymn);
  };

  // Handle number pad input
  const handleNumberInput = useCallback(
    (num: string) => {
      if (numberBuffer.length < 3) {
        setNumberBuffer((prev) => prev + num);
      }
    },
    [numberBuffer]
  );

  // Handle number pad navigation
  const handleNumberPadEnter = useCallback(() => {
    if (numberBuffer) {
      navigate(`/hymn/${primaryLanguage.toLowerCase()}-${numberBuffer}`, {
        state: { language: primaryLanguage },
      });
      setNumberBuffer("");
      setIsNumberPadActive(false);
    }
  }, [numberBuffer, primaryLanguage, navigate]);

  // Load secondary language hymn if in dual mode
  useEffect(() => {
    if (isDualMode && secondaryLanguage && currentHymn.number) {
      const fetchSecondaryHymn = async () => {
        try {
          const secondaryId = `${secondaryLanguage.toLowerCase()}-${
            currentHymn.number
          }`;
          const hymnData = await hymnService.getHymnById(
            secondaryId,
            secondaryLanguage
          );
          setSecondaryHymn(hymnData);
        } catch (error) {
          console.error("Failed to load secondary hymn:", error);
        }
      };
      fetchSecondaryHymn();
    } else {
      setSecondaryHymn(null);
    }
  }, [currentHymn.number, isDualMode, secondaryLanguage]);

  // Format verses with alternating lines when in dual mode
  useEffect(() => {
    if (!currentHymn.verses || currentHymn.verses.length === 0) {
      setFormattedVerses([]);
      return;
    }

    const currentPrimaryVerse = currentHymn.verses[currentVerse].content;
    const primaryLines = currentPrimaryVerse.split("\n");

    if (
      !isDualMode ||
      !secondaryHymn ||
      !secondaryHymn.verses ||
      !secondaryHymn.verses[currentVerse]
    ) {
      // If not in dual mode or no secondary verse, just display primary lines
      setFormattedVerses(
        primaryLines.map((line, i) => (
          <div key={`primary-${i}`} className="mb-4">
            {line}
          </div>
        ))
      );
      return;
    }

    const secondaryVerseContent = secondaryHymn.verses[currentVerse].content;
    const secondaryLines = secondaryVerseContent.split("\n");

    // Create alternating lines of primary and secondary content
    const alternatingLines: React.ReactNode[] = [];
    const maxLines = Math.max(primaryLines.length, secondaryLines.length);

    for (let i = 0; i < maxLines; i++) {
      // Add primary line if available
      if (primaryLines[i]) {
        alternatingLines.push(
          <div key={`primary-${i}`} className="mb-2">
            {primaryLines[i]}
          </div>
        );
      }

      // Add secondary line if available
      if (secondaryLines[i]) {
        alternatingLines.push(
          <div
            key={`secondary-${i}`}
            className="mb-4 text-primary dark:text-yellow-400 italic"
          >
            [{secondaryLines[i]}]
          </div>
        );
      }
    }

    setFormattedVerses(alternatingLines);
  }, [currentHymn.verses, currentVerse, isDualMode, secondaryHymn]);

  useEffect(() => {
    if (!hymn) {
      toast.error('Hymn not found');
      navigate('/', { replace: true });
    }
  }, [hymn, navigate]);

  if (!currentHymn.verses || currentHymn.verses.length === 0) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">
          No verses available for this hymn.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2" />
          Back to Hymns
        </Button>
      </div>
    );
  }

  const verses = currentHymn.verses;
  const hasNextVerse = currentVerse < verses.length - 1;
  const hasPrevVerse = currentVerse > 0;

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
        // case "arrowleft":
        //   if (hasPrevVerse) {
        //     setCurrentVerse((prev) => prev - 1);
        //   }
        //   break;
        // case "arrowright":
        //   if (hasNextVerse) {
        //     setCurrentVerse((prev) => prev + 1);
        //   }
        //   break;
        case "e":
          setIsEditDialogOpen(true);
          break;
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
        case "enter":
          if (isNumberPadActive) {
            handleNumberPadEnter();
          }
          break;
        case "escape":
          if (isNumberPadActive) {
            setNumberBuffer("");
            setIsNumberPadActive(false);
          }
          break;
        case "arrowleft":
          if (event.shiftKey) {
            const prevNumber = Number(currentHymn.number) - 1;
            if (prevNumber >= 1) {
              navigate(`/hymn/${primaryLanguage.toLowerCase()}-${prevNumber}`, {
                replace: true,
              });
            }
          } else if (hasPrevVerse) {
            setCurrentVerse((prev) => prev - 1);
          }
          break;
        case "arrowright":
          if (event.shiftKey) {
            const nextNumber = Number(currentHymn.number) + 1;
            if (nextNumber <= totalHymns) {
              // You'll need to get totalHymns from your context or props
              navigate(`/hymn/${primaryLanguage.toLowerCase()}-${nextNumber}`, {
                replace: true,
              });
            }
          } else if (hasNextVerse) {
            setCurrentVerse((prev) => prev + 1);
          }
          break;
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
    [
      hasPrevVerse,
      hasNextVerse,
      navigate,
      setIsDualMode,
      isDarkMode,
      setIsDarkMode,
      isNumberPadActive,
      numberBuffer,
      handleNumberPadEnter,
    ]
  );

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col ">
      <header className="p-4 flex items-center justify-center mt-10">
        <div className="flex items-center">
          <div>
            <h1 className="-mb-10 text-2xl font-light">{currentHymn.title}</h1>
            {/* <p className="text-muted-foreground">Hymn {currentHymn.number}</p> */}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 ">
        <div className=" w-full space-y-4 verse-transition">
          <div
            className={cn(
              "text-md md:hymn-text text-center",
              isDualMode && "text-center"
            )}
          >
            {formattedVerses}
          </div>

          <div className="text-center text-muted-foreground">
            Verse {currentVerse + 1} of {verses.length}
          </div>
        </div>
      </main>

      {isNumberPadActive && (
        <Dialog open={isNumberPadActive} onOpenChange={setIsNumberPadActive}>
          <DialogContent className="sm:max-w-[200px]">
            <DialogHeader>
              <DialogTitle className="text-center text-3xl">
                {numberBuffer || "..."}
              </DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      <footer
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t transition-all duration-300",
          isFullscreen && "opacity-0 hover:opacity-100"
        )}
      >
        <div className="max-w-5xl mx-auto p-2 sm:p-2 flex flex-wrap justify-center sm:justify-between items-center gap-2 sm:gap-2 sm:text-xs">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 sm:-mx-1" />
            <span className="hidden md:block">to Hymns</span>
            <List className="md:hidden" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="ml-auto"
          >
            <Edit className="md:mr-2 h-4 w-4 sm:-mx-1" />
            <span className="hidden md:block">Edit</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const prevNumber = Number(currentHymn.number) - 1;
              if (prevNumber >= 1) {
                navigate(
                  `/hymn/${primaryLanguage.toLowerCase()}-${prevNumber}`,
                  { replace: true }
                );
              }
            }}
            disabled={Number(currentHymn.number) <= 1}
          >
            <ChevronsLeft className="md:mr-2 sm:-mx-1" />
            <span className="hidden md:block">prev hymn</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => hasPrevVerse && setCurrentVerse(currentVerse - 1)}
            disabled={!hasPrevVerse}
          >
            <ChevronLeft className="md:mr-2  sm:-mx-1" />
            <span className="hidden md:block">previous</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => hasNextVerse && setCurrentVerse(currentVerse + 1)}
            disabled={!hasNextVerse}
          >
            <span className="hidden md:block">next</span>
            <ChevronRight className="md:ml-2 sm:-mx-1" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextNumber = Number(currentHymn.number) + 1;
              if (nextNumber <= totalHymns) {
                // You'll need to get totalHymns from your context or props
                navigate(
                  `/hymn/${primaryLanguage.toLowerCase()}-${nextNumber}`,
                  { replace: true }
                );
              }
            }}
            disabled={Number(currentHymn.number) >= totalHymns}
          >
            <span className="hidden md:block">next hymn</span>
            <ChevronsRight className="md:ml-2 sm:-mx-1" />
          </Button>
        </div>
      </footer>

      <EditHymnDialog
        hymn={currentHymn}
        language={primaryLanguage}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onHymnUpdated={handleHymnUpdated}
      />
    </div>
  );
};

export default HymnDisplay;
