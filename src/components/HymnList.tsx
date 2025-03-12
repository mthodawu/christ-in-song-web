
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useHymn } from '@/context/HymnContext';
import type { Hymn } from '@/types/hymn';

interface HymnListProps {
  hymns: Hymn[];
}

const HymnList = ({ hymns }: HymnListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { primaryLanguage } = useHymn();
  const navigate = useNavigate();

  const filteredHymns = hymns.filter((hymn) => {
    const translation = hymn.translations.find((t) => t.language === primaryLanguage);
    if (!translation) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      hymn.number.toString().includes(searchLower) ||
      translation.title.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search hymns..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        {filteredHymns.map((hymn) => {
          const translation = hymn.translations.find((t) => t.language === primaryLanguage);
          if (!translation) return null;
          
          return (
            <button
              key={hymn.id}
              onClick={() => navigate(`/hymn/${hymn.id}`)}
              className="w-full p-4 text-left rounded-lg bg-card hover:bg-accent transition-colors duration-200 group"
            >
              <div className="flex items-center">
                <span className="text-2xl font-light text-muted-foreground mr-4">
                  {hymn.number.toString().padStart(3, '0')}
                </span>
                <span className="text-xl group-hover:text-primary transition-colors duration-200">
                  {translation.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HymnList;
