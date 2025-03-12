
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHymn } from '@/context/HymnContext';
import hymnService from '@/services/hymnService';
import { cn } from '@/lib/utils';
import type { Hymn } from '@/types/hymn';

interface HymnDisplayProps {
  hymn: Hymn;
}

const HymnDisplay = ({ hymn }: HymnDisplayProps) => {
  const [currentVerse, setCurrentVerse] = useState(0);
  const { primaryLanguage, secondaryLanguage, isDualMode } = useHymn();
  const navigate = useNavigate();
  const [secondaryHymn, setSecondaryHymn] = useState<Hymn | null>(null);
  const [formattedVerses, setFormattedVerses] = useState<React.ReactNode[]>([]);

  // Load secondary language hymn if in dual mode
  useEffect(() => {
    if (isDualMode && secondaryLanguage && hymn.number) {
      const fetchSecondaryHymn = async () => {
        try {
          const secondaryId = `${secondaryLanguage.toLowerCase()}-${hymn.number}`;
          const hymnData = await hymnService.getHymnById(secondaryId, secondaryLanguage);
          setSecondaryHymn(hymnData);
        } catch (error) {
          console.error('Failed to load secondary hymn:', error);
        }
      };
      fetchSecondaryHymn();
    } else {
      setSecondaryHymn(null);
    }
  }, [hymn.number, isDualMode, secondaryLanguage]);

  // Format verses with alternating lines when in dual mode
  useEffect(() => {
    if (!hymn.verses || hymn.verses.length === 0) {
      setFormattedVerses([]);
      return;
    }

    const currentPrimaryVerse = hymn.verses[currentVerse].content;
    const primaryLines = currentPrimaryVerse.split(' ').reduce((acc: string[], word: string, index: number) => {
      const lineIndex = Math.floor(index / 6);
      if (!acc[lineIndex]) acc[lineIndex] = '';
      acc[lineIndex] += (acc[lineIndex] ? ' ' : '') + word;
      return acc;
    }, []);

    if (!isDualMode || !secondaryHymn || !secondaryHymn.verses || !secondaryHymn.verses[currentVerse]) {
      // If not in dual mode or no secondary verse, just display primary lines
      setFormattedVerses(primaryLines.map((line, i) => (
        <div key={`primary-${i}`} className="mb-4">{line}</div>
      )));
      return;
    }

    const secondaryVerseContent = secondaryHymn.verses[currentVerse].content;
    const secondaryLines = secondaryVerseContent.split(' ').reduce((acc: string[], word: string, index: number) => {
      const lineIndex = Math.floor(index / 6);
      if (!acc[lineIndex]) acc[lineIndex] = '';
      acc[lineIndex] += (acc[lineIndex] ? ' ' : '') + word;
      return acc;
    }, []);

    // Create alternating lines of primary and secondary content
    const alternatingLines: React.ReactNode[] = [];
    const maxLines = Math.max(primaryLines.length, secondaryLines.length);

    for (let i = 0; i < maxLines; i++) {
      // Add primary line if available
      if (primaryLines[i]) {
        alternatingLines.push(
          <div key={`primary-${i}`} className="mb-2">{primaryLines[i]}</div>
        );
      }

      // Add secondary line if available
      if (secondaryLines[i]) {
        alternatingLines.push(
          <div 
            key={`secondary-${i}`} 
            className="mb-4 text-emerald-600 dark:text-emerald-400 italic"
          >
            [{secondaryLines[i]}]
          </div>
        );
      }
    }

    setFormattedVerses(alternatingLines);
  }, [hymn.verses, currentVerse, isDualMode, secondaryHymn]);

  if (!hymn.verses || hymn.verses.length === 0) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No verses available for this hymn.</p>
        <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
          <ArrowLeft className="mr-2" />
          Back to Hymns
        </Button>
      </div>
    );
  }

  const verses = hymn.verses;
  const hasNextVerse = currentVerse < verses.length - 1;
  const hasPrevVerse = currentVerse > 0;

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      <header className="p-4 flex items-center">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="mr-2" />
          Back to Hymns
        </Button>
        <div>
          <h1 className="text-2xl font-light">{hymn.title}</h1>
          <p className="text-muted-foreground">Hymn {hymn.number}</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-4 verse-transition">
          <div className={cn(
            "hymn-text text-center",
            isDualMode && "text-left"
          )}>
            {formattedVerses}
          </div>
          
          <div className="text-center text-muted-foreground">
            Verse {currentVerse + 1} of {verses.length}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => hasPrevVerse && setCurrentVerse(currentVerse - 1)}
            disabled={!hasPrevVerse}
          >
            <ChevronLeft className="mr-2" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            onClick={() => hasNextVerse && setCurrentVerse(currentVerse + 1)}
            disabled={!hasNextVerse}
          >
            Next
            <ChevronRight className="ml-2" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default HymnDisplay;
