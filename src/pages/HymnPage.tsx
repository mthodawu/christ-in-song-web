
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import HymnDisplay from '@/components/HymnDisplay';
import Navigation from '@/components/Navigation';
import { useHymn } from '@/context/HymnContext';
import hymnService from '@/services/hymnService';
import type { Hymn } from '@/types/hymn';
import { toast } from 'sonner';

const HymnPage = () => {
  const { id } = useParams<{ id: string }>();
  const { primaryLanguage } = useHymn();
  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [currentHymnNumber, setCurrentHymnNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Effect to load hymn when ID or language changes
  useEffect(() => {
    const loadHymn = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // First try to load the exact ID
        let hymnData = await hymnService.getHymnById(id, primaryLanguage);
        
        // If not found but we have a currentHymnNumber, try to load by number in the new language
        if (!hymnData && currentHymnNumber) {
          const newId = `${primaryLanguage.toLowerCase()}-${currentHymnNumber}`;
          hymnData = await hymnService.getHymnById(newId, primaryLanguage);
          
          if (hymnData) {
            // Update URL to reflect the new hymn ID
            navigate(`/hymn/${newId}`, { replace: true });
          }
        }
        
        if (hymnData) {
          setHymn(hymnData);
          setCurrentHymnNumber(hymnData.number);
          setError(null);
        } else {
          setHymn(null);
          setError('Hymn not found in the selected language');
          toast.error('This hymn is not available in the selected language');
        }
      } catch (err) {
        console.error('Error loading hymn:', err);
        setError('Failed to load hymn');
        toast.error('Failed to load hymn');
      } finally {
        setLoading(false);
      }
    };

    loadHymn();
  }, [id, primaryLanguage, currentHymnNumber, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Navigation />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !hymn) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto py-8 text-center">
          <h2 className="text-2xl font-bold text-destructive">{error || 'Hymn not found'}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      <HymnDisplay hymn={hymn} />
    </div>
  );
};

export default HymnPage;
