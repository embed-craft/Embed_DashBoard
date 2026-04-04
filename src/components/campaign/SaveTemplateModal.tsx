import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, X, Camera, Layers, Tag, Check } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';

interface SaveTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    { id: 'marketing',    label: 'Marketing' },
    { id: 'onboarding',   label: 'Onboarding' },
    { id: 'feedback',     label: 'Feedback' },
    { id: 'announcement', label: 'Announcement' },
    { id: 'support',      label: 'Support' },
    { id: 'other',        label: 'Other' },
];

const typeGradients: Record<string, string> = {
    bottomsheet: 'from-indigo-500 to-violet-600',
    modal:       'from-blue-500 to-cyan-500',
    tooltip:     'from-amber-400 to-orange-500',
    floater:     'from-teal-500 to-emerald-600',
    fullscreen:  'from-slate-600 to-gray-800',
    banner:      'from-sky-400 to-blue-500',
    scratchcard: 'from-yellow-400 to-amber-500',
};

const nudgeTypeLabel: Record<string, string> = {
    bottomsheet: 'Bottom Sheet',
    modal:       'Modal',
    tooltip:     'Tooltip',
    floater:     'Floater',
    fullscreen:  'Full Screen',
    banner:      'Banner',
    scratchcard: 'Scratch Card',
};

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose }) => {
    const { currentCampaign } = useEditorStore();

    const [name, setName]                 = useState('');
    const [description, setDescription]   = useState('');
    const [category, setCategory]         = useState('marketing');
    const [tagInput, setTagInput]         = useState('');
    const [tags, setTags]                 = useState<string[]>([]);
    const [isSaving, setIsSaving]         = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isCapturing, setIsCapturing]   = useState(false);
    const tagInputRef = useRef<HTMLInputElement>(null);

    // Reset + capture on open
    useEffect(() => {
        if (!isOpen) return;

        // Reset form
        setName(currentCampaign?.name ? `${currentCampaign.name} Template` : '');
        setDescription('');
        setCategory('marketing');
        setTags([]);
        setTagInput('');
        setThumbnailUrl(null);

        // Capture phone preview screenshot
        const capture = async () => {
            setIsCapturing(true);
            try {
                const el = document.getElementById('phone-preview-content');
                if (!el) throw new Error('Preview element not found');
                const { default: html2canvas } = await import('html2canvas');
                const canvas = await html2canvas(el, {
                    useCORS: true,
                    allowTaint: true,
                    scale: 1.5, // Higher res
                    backgroundColor: '#ffffff',
                    logging: false,
                });
                setThumbnailUrl(canvas.toDataURL('image/png'));
            } catch (err) {
                console.warn('Thumbnail capture failed, using gradient fallback:', err);
                setThumbnailUrl(null);
            } finally {
                setIsCapturing(false);
            }
        };

        // Slight delay so modal animation completes first
        const timer = setTimeout(capture, 300);
        return () => clearTimeout(timer);
    }, [isOpen]);

    const addTag = (val: string) => {
        const trimmed = val.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags((prev) => [...prev, trimmed]);
        }
        setTagInput('');
    };

    const removeTag = (tag: string) => {
        setTags((prev) => prev.filter((t) => t !== tag));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput);
        } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) { toast.error('Please enter a name'); return; }
        if (!currentCampaign) { toast.error('No campaign to save'); return; }

        setIsSaving(true);
        try {
            // Config from current campaign
            const configKey = `${currentCampaign.nudgeType}Config` as any;
            const config = (currentCampaign as any)[configKey] || {};

            await apiClient.createTemplate({
                name: name.trim(),
                description: description.trim(),
                category,
                tags,
                type: currentCampaign.nudgeType,
                config: { ...config, type: currentCampaign.nudgeType },
                layers: currentCampaign.layers,
                thumbnail: thumbnailUrl || undefined,
                is_system: false,
            });

            toast.success('Template saved to your library!');
            onClose();
        } catch {
            toast.error('Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    const nudgeType = currentCampaign?.nudgeType || 'modal';
    const gradient = typeGradients[nudgeType] || typeGradients.modal;
    const layerCount = currentCampaign?.layers?.length ?? 0;

    return (
        <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-[580px] p-0 overflow-hidden gap-0">
                {/* Header */}
                <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-lg font-bold text-gray-900">Save as Template</DialogTitle>
                            <p className="text-xs text-gray-500 mt-0.5">This design will be saved to your Template Library</p>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </DialogHeader>

                <div className="flex gap-0 min-h-[360px]">
                    {/* Left — Screenshot Preview */}
                    <div className="w-[180px] shrink-0 border-r border-gray-100 bg-gray-50 p-4 flex flex-col items-center gap-3">
                        {/* Phone frame mockup */}
                        <div className="w-full aspect-[9/16] rounded-2xl border-4 border-gray-800 bg-gray-800 overflow-hidden shadow-xl relative">
                            {isCapturing ? (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                                    <Camera size={20} className="text-gray-400 animate-bounce" />
                                </div>
                            ) : thumbnailUrl ? (
                                <img
                                    src={thumbnailUrl}
                                    alt="Template preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
                                    <span className="text-3xl">🎨</span>
                                    <span className="text-white/80 text-[10px] font-medium capitalize">{nudgeType}</span>
                                </div>
                            )}
                        </div>

                        {/* Meta below screenshot */}
                        <div className="text-center space-y-1">
                            <p className={`text-[11px] font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent capitalize`}>
                                {nudgeTypeLabel[nudgeType] || nudgeType}
                            </p>
                            <div className="flex items-center justify-center gap-1 text-gray-400">
                                <Layers size={10} />
                                <span className="text-[10px]">{layerCount} layer{layerCount !== 1 ? 's' : ''}</span>
                            </div>
                            {thumbnailUrl && (
                                <p className="text-[9px] text-green-600 flex items-center justify-center gap-1">
                                    <Check size={9} /> Live screenshot
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right — Form */}
                    <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">
                        {/* Name */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">Name *</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Holiday Offer Bottom Sheet"
                                className="h-9 text-sm"
                                autoFocus
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">Description</label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional context about this template…"
                                className="text-sm min-h-[64px] resize-none"
                            />
                        </div>

                        {/* Category Pills */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Category</label>
                            <div className="flex flex-wrap gap-1.5">
                                {CATEGORIES.map((cat) => {
                                    const active = category === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCategory(cat.id)}
                                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150
                                                ${active
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tags — Pill Input */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">
                                <Tag size={11} className="inline mr-1" />
                                Tags
                            </label>
                            <div
                                onClick={() => tagInputRef.current?.focus()}
                                className="min-h-[38px] flex flex-wrap gap-1.5 items-center px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white cursor-text hover:border-gray-300 focus-within:border-indigo-400 transition-colors"
                            >
                                {tags.map((tag) => (
                                    <span key={tag} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-medium px-2 py-0.5 rounded-full border border-indigo-200">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-indigo-900 transition-colors">
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    ref={tagInputRef}
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    onBlur={() => tagInput && addTag(tagInput)}
                                    placeholder={tags.length === 0 ? 'Type a tag and press Enter…' : ''}
                                    className="flex-1 min-w-[80px] text-xs outline-none bg-transparent placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-gray-400">
                        Saves to Your Templates library
                    </p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>Cancel</Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || !name.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 px-5"
                        >
                            {isSaving ? <Loader2 size={13} className="animate-spin" /> : null}
                            Save Template
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
