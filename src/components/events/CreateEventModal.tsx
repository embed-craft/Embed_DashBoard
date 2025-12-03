import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { metadataService } from '@/services/metadataService';

interface CreateEventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ open, onOpenChange, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        description: '',
        category: 'user_interaction',
        source: 'custom',
        validationLevel: 'lax'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await metadataService.createEvent({
                name: formData.name,
                displayName: formData.displayName || formData.name,
                description: formData.description,
                category: formData.category,
                source: formData.source as any,
                validationLevel: formData.validationLevel as any,
                isActive: true,
                version: 1
            });

            toast.success('Event defined successfully');
            onSuccess();
            onOpenChange(false);
            setFormData({
                name: '',
                displayName: '',
                description: '',
                category: 'user_interaction',
                source: 'custom',
                validationLevel: 'lax'
            });
        } catch (error) {
            console.error('Failed to create event:', error);
            toast.error('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Define New Event</DialogTitle>
                    <DialogDescription>
                        Register a new event schema in the system.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Event Name (Key)</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="e.g., button_click"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                                id="displayName"
                                value={formData.displayName}
                                onChange={(e) => handleChange('displayName', e.target.value)}
                                placeholder="e.g., Button Click"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="What does this event track?"
                            className="h-20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                placeholder="e.g., user_interaction"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="source">Source</Label>
                            <select
                                id="source"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.source}
                                onChange={(e) => handleChange('source', e.target.value)}
                            >
                                <option value="custom">Custom</option>
                                <option value="client">Client</option>
                                <option value="server">Server</option>
                                <option value="integration">Integration</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="validationLevel">Validation Level</Label>
                        <select
                            id="validationLevel"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.validationLevel}
                            onChange={(e) => handleChange('validationLevel', e.target.value)}
                        >
                            <option value="lax">Lax (Allow unknown properties)</option>
                            <option value="strict">Strict (Reject unknown properties)</option>
                            <option value="none">None (No validation)</option>
                        </select>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Event Definition'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateEventModal;
