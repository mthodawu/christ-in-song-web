
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import hymnService from '@/services/hymnService';
import { Hymn, Language } from '@/types/hymn';
import { toast } from 'sonner';

interface EditHymnDialogProps {
  hymn: Hymn | null;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onHymnUpdated: (updatedHymn: Hymn) => void;
}

const EditHymnDialog = ({ 
  hymn, 
  language, 
  isOpen, 
  onClose, 
  onHymnUpdated 
}: EditHymnDialogProps) => {
  const [title, setTitle] = useState(hymn?.title || '');
  const [markdown, setMarkdown] = useState(hymn?.markdown || '');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when hymn changes
  React.useEffect(() => {
    if (hymn) {
      setTitle(hymn.title);
      setMarkdown(hymn.markdown);
    }
  }, [hymn]);

  const handleSave = async () => {
    if (!hymn || !hymn.id) return;
    
    setIsSaving(true);
    try {
      const updatedHymn = await hymnService.updateHymn(hymn.id, language, title, markdown);
      if (updatedHymn) {
        toast.success('Hymn updated successfully');
        onHymnUpdated(updatedHymn);
        onClose();
      } else {
        toast.error('Failed to update hymn');
      }
    } catch (error) {
      console.error('Error updating hymn:', error);
      toast.error('An error occurred while updating the hymn');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Hymn #{hymn?.number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Hymn title"
            />
          </div>
          
          <div>
            <label htmlFor="markdown" className="block text-sm font-medium mb-1">
              Content (Markdown)
            </label>
            <Textarea
              id="markdown"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Hymn content in markdown format"
              className="min-h-[300px] font-mono"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use markdown to format verses. Empty lines separate verses.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditHymnDialog;
