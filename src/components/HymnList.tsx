
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useHymn } from '@/context/HymnContext';
import { Badge } from '@/components/ui/badge';

const HymnList = () => {
  const { 
    hymns, 
    isLoading, 
    primaryLanguage, 
    searchQuery, 
    searchResults 
  } = useHymn();
  const navigate = useNavigate();

  // If searching, use search results; otherwise, use hymns from primary language
  const displayHymns = searchQuery.trim() ? searchResults : hymns.map(hymn => ({ ...hymn, language: primaryLanguage }));

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4">      
      <div className="space-y-2">
        {displayHymns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hymns found. Try a different search term.
          </div>
        ) : (
          displayHymns.map((hymn) => (
            <button
              key={`${hymn.language}-${hymn.id || hymn.number}`}
              onClick={() => {
                navigate(`/hymn/${hymn.id}`, {
                  state: { language: hymn.language }
                });
              }}
              className="w-full -mt-6 p-2 text-left rounded-lg bg-card hover:bg-accent transition-colors duration-200 group"
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <span className="text-xl group-hover:text-primary transition-colors duration-200 block">
                    {/* <span className="font-semibold mr-2">{hymn.number}.</span> */}
                    {hymn.title}
                  </span>
                  {hymn.language !== primaryLanguage && (
                    <Badge variant="outline" className="mt-1">
                      {hymn.language}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default HymnList;
