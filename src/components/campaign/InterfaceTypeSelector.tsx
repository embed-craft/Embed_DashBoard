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
    Maximize2,
    PanelBottom,
    MessageCircle,
    PictureInPicture2,
    Gift,
    LayoutPanelTop,
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
    gradient: string;
    description: string;
}> = [

        {
            id: 'bottomsheet',
            label: 'Bottom Sheet / Banner',
            icon: <PanelBottom size={24} />,
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            description: 'Slides up (Sheet) or down (Banner)',
        },
        {
            id: 'tooltip',
            label: 'Tooltip',
            icon: <MessageCircle size={24} />,
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            description: 'Contextual pointer tip',
        },

        {
            id: 'floater',
            label: 'Floater',
            icon: <MessageCircle size={24} style={{ transform: 'rotate(180deg)' }} />, // Reusing distinct icon style
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            description: 'Floating action button',
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
            <DialogContent className="max-w-xl p-0 overflow-hidden bg-white">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Create Interface
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Create a new sub-interface for your campaign by selecting a type and providing a name.
                            </DialogDescription>
                        </DialogHeader>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Name Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interface Name
                        </label>
                        <Input
                            type="text"
                            value={interfaceName}
                            onChange={(e) => setInterfaceName(e.target.value)}
                            placeholder={`Interface ${existingInterfaceCount + 1}`}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            e.g., tncModal, rewardSheet, welcomeTooltip
                        </p>
                    </div>

                    {/* Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Select Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {INTERFACE_TYPES.map((type) => {
                                const isSelected = selectedType === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type.id)}
                                        className={`
                      relative flex flex-col items-center p-4 rounded-xl border-2 
                      transition-all duration-200 text-center
                      ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-white"
                                            style={{ background: type.gradient }}
                                        >
                                            {type.icon}
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                            {type.label}
                                        </h4>
                                        <p className="text-xs text-gray-500 leading-tight">
                                            {type.description}
                                        </p>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!selectedType}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
