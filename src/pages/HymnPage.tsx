
import { useParams } from 'react-router-dom';
import hymnsData from '@/data/hymns.json';
import HymnDisplay from '@/components/HymnDisplay';
import Navigation from '@/components/Navigation';

const HymnPage = () => {
  const { id } = useParams();
  const hymn = hymnsData.hymns.find(h => h.id === id);

  if (!hymn) {
    return <div>Hymn not found</div>;
  }

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      <HymnDisplay hymn={hymn} />
    </div>
  );
};

export default HymnPage;
