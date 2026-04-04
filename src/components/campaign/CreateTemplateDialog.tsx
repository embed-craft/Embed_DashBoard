import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateTemplateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (template: any) => void;
}

const PreviewWrapper = ({ children, bg }: { children: React.ReactNode, bg: string }) => (
    <div className={`w-16 h-11 rounded border border-black/5 relative overflow-hidden flex shadow-sm transition-transform duration-300 group-hover:scale-105 ${bg}`}>
        {children}
    </div>
);

const NudgePreviews: Record<string, React.ReactNode> = {
    bottomsheet: (
        <PreviewWrapper bg="bg-indigo-50">
            <div className="absolute bottom-0 left-1.5 right-1.5 h-4 bg-indigo-500 rounded-t shadow shadow-indigo-500/20" />
        </PreviewWrapper>
    ),
    modal: (
        <PreviewWrapper bg="bg-blue-50">
            <div className="m-auto w-7 h-5 bg-blue-500 rounded-[3px] shadow shadow-blue-500/20" />
        </PreviewWrapper>
    ),
    banner: (
        <PreviewWrapper bg="bg-sky-50">
            <div className="absolute top-0 left-0 right-0 h-[12px] bg-sky-500 shadow-sm" />
            <div className="absolute top-[14px] left-2 w-8 h-[3px] rounded-full bg-sky-200" />
        </PreviewWrapper>
    ),
    tooltip: (
        <PreviewWrapper bg="bg-amber-50">
            <div className="m-auto flex flex-col items-center gap-0">
                <div className="w-6 h-3.5 bg-amber-500 rounded-[3px] shadow shadow-amber-500/20" />
                <div className="w-1.5 h-1.5 bg-amber-500 rotate-45 -mt-1" />
            </div>
        </PreviewWrapper>
    ),
    floater: (
        <PreviewWrapper bg="bg-teal-50">
            <div className="absolute bottom-1 right-1.5 w-3.5 h-3.5 bg-teal-500 rounded-full shadow shadow-teal-500/20" />
        </PreviewWrapper>
    ),
    fullscreen: (
        <PreviewWrapper bg="bg-slate-700">
            <div className="absolute inset-1 border border-white/20 rounded-[2px]" />
        </PreviewWrapper>
    ),
    scratchcard: (
        <PreviewWrapper bg="bg-yellow-50">
            <div className="m-auto w-6 h-6 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-sm shadow-sm flex items-center justify-center">
                <Sparkles size={10} className="text-white" />
            </div>
        </PreviewWrapper>
    ),
};

const NUDGE_TYPES = [
    { id: 'bottomsheet', label: 'Bottom Sheet',  desc: 'Slides up from the bottom' },
    { id: 'tooltip',     label: 'Tooltip',       desc: 'Anchor to any element' },
    { id: 'floater',     label: 'Floater',       desc: 'Floating corner widget' },
    { id: 'fullscreen',  label: 'Full Screen',   desc: 'Immersive full coverage' },
];

export const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const navigate = useNavigate();
    const [name, setName]           = useState('');
    const [type, setType]           = useState('bottomsheet');
    const [isSaving, setIsSaving]   = useState(false);

    const handleReset = () => {
        setName('');
        setType('bottomsheet');
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error('Please enter a template name');
            return;
        }
        setIsSaving(true);
        try {
            const template = await apiClient.createTemplate({
                name: name.trim(),
                category: 'marketing', // Hardcoded fallback for backend compatibility
                type,
                config: { type },
                layers: [],
                tags: [],
                thumbnail: null,
                is_system: false,
            });
            toast.success('Template created! Opening editor…');
            handleReset();
            onClose();
            if (onSuccess) onSuccess(template);
            
            // Navigate to builder
            const templateId = template._id || template.id;
            navigate(`/campaign-builder?mode=template&id=${templateId}`);
        } catch {
            toast.error('Failed to create template');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(o) => {
            if (!o) {
                onClose();
                handleReset();
            }
        }}>
            <DialogContent className="max-w-[620px] p-0 overflow-hidden gap-0">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                New Template
                            </DialogTitle>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Choose a type and start designing
                            </p>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-6 bg-white">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Template Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Holiday Sale Banner"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            className="h-10 text-sm"
                            autoFocus
                        />
                    </div>

                    {/* Nudge Type Grid */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Nudge Type</label>
                        <div className="grid grid-cols-4 gap-3">
                            {NUDGE_TYPES.map((t) => {
                                const isSelected = type === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id)}
                                        className={`relative group flex flex-col items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all duration-200 text-center
                                            ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-100'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                                            }`}
                                    >
                                        {/* Checkmark */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle2 size={14} className="text-indigo-600 fill-indigo-100" />
                                            </div>
                                        )}
                                        
                                        {/* Visual Layout Mockup */}
                                        <div className="mt-1">
                                            {NudgePreviews[t.id]}
                                        </div>
                                        
                                        {/* Label */}
                                        <div className="flex flex-col items-center mt-1">
                                            <p className={`text-[12px] font-bold leading-tight ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
                                                {t.label}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1 leading-tight hidden lg:block">
                                                {t.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 rounded-b-lg">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving} className="text-gray-600 bg-white shadow-sm">
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleCreate}
                        disabled={isSaving || !name.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 gap-2 shadow-sm"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                        Create & Edit →
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
