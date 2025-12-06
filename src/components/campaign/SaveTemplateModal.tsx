import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { useEditorStore } from '@/store/useEditorStore';

interface SaveTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    config?: any; // Deprecated
    nudgeType?: string; // Deprecated
}

const CATEGORIES = [
    { id: 'marketing', label: 'Marketing' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'announcement', label: 'Announcement' },
    { id: 'support', label: 'Support' },
    { id: 'other', label: 'Other' }
];

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { currentCampaign } = useEditorStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('marketing');
    const [tags, setTags] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Please enter a template name');
            return;
        }

        if (!currentCampaign) {
            toast.error('No campaign to save');
            return;
        }

        setIsSaving(true);
        try {
            // Determine config based on type
            let config = {};
            switch (currentCampaign.nudgeType) {
                case 'bottomsheet': config = currentCampaign.bottomSheetConfig || {}; break;
                case 'modal': config = currentCampaign.modalConfig || {}; break;
                case 'banner': config = currentCampaign.bannerConfig || {}; break;
                case 'tooltip': config = currentCampaign.tooltipConfig || {}; break;
                case 'floater': config = currentCampaign.floaterConfig || {}; break;
                case 'pip': config = currentCampaign.pipConfig || {}; break;
                default: config = {};
            }

            await apiClient.createTemplate({
                name,
                description,
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                config,
                layers: currentCampaign.layers, // Include layers!
                type: currentCampaign.nudgeType,
                thumbnail: '🎨' // TODO: Generate thumbnail
            });
            toast.success('Template saved successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to save template:', error);
            toast.error('Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save as Template</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Holiday Sale Banner"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this template..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="sale, holiday, banner"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
