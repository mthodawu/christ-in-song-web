
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useHymn } from '@/context/HymnContext';
import { Badge } from '@/components/ui/badge';

const HymnList = () => {
  const { 
    hymns, 
    isLoading, 
    primaryLanguage, 
    searchQuery, 
    setSearchQuery, 
    searchResults 
  } = useHymn();
  const navigate = useNavigate();

  const displayHymns = searchQuery.trim() ? searchResults : hymns.map(hymn => ({ ...hymn, language: primaryLanguage }));

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search hymns across all languages..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        {displayHymns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hymns found. Try a different search term.
          </div>
        ) : (
          displayHymns.map((hymn) => (
            <button
              key={`${hymn.language}-${hymn.id || hymn.number}`}
              onClick={() => navigate(`/hymn/${hymn.id}`)}
              className="w-full p-4 text-left rounded-lg bg-card hover:bg-accent transition-colors duration-200 group"
            >
              <div className="flex items-center">
                <span className="text-2xl font-light text-muted-foreground mr-4">
                  {hymn.number.toString().padStart(3, '0')}
                </span>
                <div className="flex-1">
                  <span className="text-xl group-hover:text-primary transition-colors duration-200 block">
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
