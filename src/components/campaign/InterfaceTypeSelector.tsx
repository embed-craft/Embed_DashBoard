import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    PanelBottom,
    MessageSquare,
    MousePointerClick,
    CheckCircle2,
    X,
} from 'lucide-react';
import { CampaignInterface } from '@/store/useEditorStore';

interface InterfaceTypeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateInterface: (nudgeType: CampaignInterface['nudgeType'], name: string) => void;
    existingInterfaceCount: number;
}

const INTERFACE_TYPES: Array<{
    id: CampaignInterface['nudgeType'];
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    description: string;
}> = [
    {
        id: 'bottomsheet',
        label: 'Bottom Sheet / Banner',
        icon: <PanelBottom className="w-5 h-5" />,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        description: 'Slides up or down from the edge of the screen.',
    },
    {
        id: 'tooltip',
        label: 'Tooltip',
        icon: <MessageSquare className="w-5 h-5" />,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
        description: 'Contextual pop-up pointing to a specific element.',
    },
    {
        id: 'floater',
        label: 'Floater',
        icon: <MousePointerClick className="w-5 h-5" />,
        color: 'text-blue-500',
        bg: 'bg-blue-50/60',
        description: 'Floating action button or sticky widget.',
    },
];

export const InterfaceTypeSelector: React.FC<InterfaceTypeSelectorProps> = ({
    open,
    onOpenChange,
    onCreateInterface,
    existingInterfaceCount,
}) => {
    const [selectedType, setSelectedType] = useState<CampaignInterface['nudgeType'] | null>(null);
    const [interfaceName, setInterfaceName] = useState('');

    const handleCreate = () => {
        if (!selectedType) return;
        const name = interfaceName.trim() || `Interface ${existingInterfaceCount + 1}`;
        onCreateInterface(selectedType, name);
        // Reset state
        setSelectedType(null);
        setInterfaceName('');
        onOpenChange(false);
    };

    const handleClose = () => {
        setSelectedType(null);
        setInterfaceName('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-0 shadow-2xl sm:rounded-2xl">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                                Create Interface
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 mt-1.5 text-sm">
                                Choose an interface type and give it a descriptive name to get started.
                            </DialogDescription>
                        </DialogHeader>
                        <button
                            onClick={handleClose}
                            className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors group"
                        >
                            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </button>
                    </div>

                    {/* Name Input */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                            Interface Name
                        </label>
                        <Input
                            type="text"
                            value={interfaceName}
                            onChange={(e) => setInterfaceName(e.target.value)}
                            placeholder={`Interface ${existingInterfaceCount + 1}`}
                            className="w-full h-11 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-shadow"
                        />
                        <p className="text-xs text-gray-400 mt-2 font-medium">
                            e.g., promotionalBanner, userOnboardingTooltip
                        </p>
                    </div>

                    {/* Type Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Select Type
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {INTERFACE_TYPES.map((type) => {
                                const isSelected = selectedType === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`
                                            relative flex flex-col items-start p-5 rounded-xl border-[1.5px] text-left
                                            transition-all duration-200 group outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                            ${isSelected
                                                ? 'border-slate-900 bg-slate-50/50 shadow-[0_0_0_1px_rgba(15,23,42,1)]'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-lg mb-4 flex items-center justify-center transition-colors
                                                ${isSelected ? type.color + ' ' + type.bg : 'text-gray-500 bg-gray-100 group-hover:' + type.bg + ' group-hover:' + type.color}
                                            `}
                                        >
                                            {type.icon}
                                        </div>
                                        <h4 className={`text-sm font-bold mb-1.5 transition-colors ${isSelected ? 'text-slate-900' : 'text-gray-900'}`}>
                                            {type.label}
                                        </h4>
                                        <p className={`text-[13px] leading-relaxed transition-colors ${isSelected ? 'text-slate-700' : 'text-gray-500'}`}>
                                            {type.description}
                                        </p>
                                        
                                        {/* Selection indicator checkmark */}
                                        <div className={`absolute top-4 right-4 transition-all duration-200 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                            <CheckCircle2 className="w-5 h-5 text-slate-900" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button 
                            variant="ghost" 
                            onClick={handleClose}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium px-5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!selectedType}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Create Interface
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InterfaceTypeSelector;
