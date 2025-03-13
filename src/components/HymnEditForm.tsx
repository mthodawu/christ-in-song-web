
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useHymn } from '@/context/HymnContext';
import { Hymn } from '@/types/hymn';
import hymnService from '@/services/hymnService';
import { toast } from 'sonner';
import { processMarkdownToVerses } from '@/services/verseService';

interface HymnEditFormProps {
  hymn: Hymn;
  onCancel: () => void;
  onSave: (hymn: Hymn) => void;
}

const HymnEditForm: React.FC<HymnEditFormProps> = ({ hymn, onCancel, onSave }) => {
  const { primaryLanguage } = useHymn();
  const [title, setTitle] = useState(hymn.title);
  const [markdown, setMarkdown] = useState(hymn.markdown);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    if (!markdown.trim()) {
      toast.error('Hymn content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const updatedHymn: Hymn = {
        ...hymn,
        title,
        markdown,
        verses: processMarkdownToVerses(markdown)
      };

      await hymnService.saveHymn(updatedHymn, primaryLanguage);
      onSave(updatedHymn);
      toast.success('Hymn saved successfully');
    } catch (error) {
      console.error('Failed to save hymn:', error);
      toast.error('Failed to save hymn');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="markdown" className="block text-sm font-medium mb-1">
          Hymn Content (Markdown)
        </label>
        <Textarea
          id="markdown"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          className="w-full min-h-[300px] font-mono"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default HymnEditForm;
