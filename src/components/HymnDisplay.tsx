import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHymn } from '@/context/HymnContext';
import hymnService from '@/services/hymnService';
import { cn } from '@/lib/utils';
import type { Hymn } from '@/types/hymn';
import EditHymnDialog from './EditHymnDialog';

interface HymnDisplayProps {
  hymn: Hymn;
}

const HymnDisplay = ({ hymn }: HymnDisplayProps) => {
  const [currentVerse, setCurrentVerse] = useState(0);
  const { primaryLanguage, secondaryLanguage, isDualMode } = useHymn();
  const navigate = useNavigate();
  const [secondaryHymn, setSecondaryHymn] = useState<Hymn | null>(null);
  const [formattedVerses, setFormattedVerses] = useState<React.ReactNode[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentHymn, setCurrentHymn] = useState<Hymn>(hymn);

  // Handle hymn update
  const handleHymnUpdated = (updatedHymn: Hymn) => {
    setCurrentHymn(updatedHymn);
  };

  // Load secondary language hymn if in dual mode
  useEffect(() => {
    if (isDualMode && secondaryLanguage && currentHymn.number) {
      const fetchSecondaryHymn = async () => {
        try {
          const secondaryId = `${secondaryLanguage.toLowerCase()}-${currentHymn.number}`;
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
  }, [currentHymn.number, isDualMode, secondaryLanguage]);

  // Format verses with alternating lines when in dual mode
  useEffect(() => {
    if (!currentHymn.verses || currentHymn.verses.length === 0) {
      setFormattedVerses([]);
      return;
    }

    const currentPrimaryVerse = currentHymn.verses[currentVerse].content;
    const primaryLines = currentPrimaryVerse.split('\n');

    if (!isDualMode || !secondaryHymn || !secondaryHymn.verses || !secondaryHymn.verses[currentVerse]) {
      // If not in dual mode or no secondary verse, just display primary lines
      setFormattedVerses(primaryLines.map((line, i) => (
        <div key={`primary-${i}`} className="mb-4">{line}</div>
      )));
      return;
    }

    const secondaryVerseContent = secondaryHymn.verses[currentVerse].content;
    const secondaryLines = secondaryVerseContent.split('\n');

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
            className="mb-4 text-primary dark:text-yellow-400 italic"
          >
            [{secondaryLines[i]}]
          </div>
        );
      }
    }

    setFormattedVerses(alternatingLines);
  }, [currentHymn.verses, currentVerse, isDualMode, secondaryHymn]);

  if (!currentHymn.verses || currentHymn.verses.length === 0) {
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

  const verses = currentHymn.verses;
  const hasNextVerse = currentVerse < verses.length - 1;
  const hasPrevVerse = currentVerse > 0;

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="mr-2" />
            Back to Hymns
          </Button>
          <div>
            <h1 className="text-2xl font-light">{currentHymn.title}</h1>
            <p className="text-muted-foreground">Hymn {currentHymn.number}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditDialogOpen(true)}
          className="ml-auto"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Hymn
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className=" w-full space-y-4 verse-transition">
          <div className={cn(
            "hymn-text text-center",
            isDualMode && "text-center"
          )}>
            {formattedVerses}
          </div>
          
          <div className="text-center text-muted-foreground">
            Verse {currentVerse + 1} of {verses.length}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
        <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
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
