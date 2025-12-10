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

interface CreateTemplateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (template: any) => void;
}

const CATEGORIES = [
    { id: 'marketing', label: 'Marketing' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'announcement', label: 'Announcement' },
    { id: 'support', label: 'Support' },
    { id: 'other', label: 'Other' }
];

const NUDGE_TYPES = [
    { id: 'modal', label: 'Modal' },
    { id: 'banner', label: 'Banner' },
    { id: 'tooltip', label: 'Tooltip' },
    { id: 'floater', label: 'Floater' },
    { id: 'pip', label: 'PiP Video' },
    { id: 'bottomsheet', label: 'Bottom Sheet' }
];

export const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('marketing');
    const [type, setType] = useState('modal');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Please enter a template name');
            return;
        }

        setIsSaving(true);
        try {
            const template = await apiClient.createTemplate({
                name,
                description,
                category,
                tags: [],
                type,

                config: { type }, // ✅ FIX: Save type in config as Nudge schema expects it there
                layers: [], // Empty layers
                thumbnail: '🎨',
                is_system: false
            });
            toast.success('Template created successfully!');
            onSuccess(template);
            onClose();
        } catch (error) {
            console.error('Failed to create template:', error);
            toast.error('Failed to create template');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Awesome Template"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {NUDGE_TYPES.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
