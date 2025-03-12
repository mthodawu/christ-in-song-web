
import { useEffect } from 'react';
import HymnList from '@/components/HymnList';
import Navigation from '@/components/Navigation';

const Index = () => {
  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      <main className="container mx-auto py-8">
        <HymnList />
      </main>
    </div>
  );
};

export default Index;
