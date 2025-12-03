import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    MessageSquare,
    Smartphone,
    Film,
    Target,
    Flame,
    ClipboardList,
    X
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';

interface CreateCampaignModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EXPERIENCE_TYPES = [
    {
        id: 'nudges',
        label: 'In-app nudges',
        icon: MessageSquare,
        color: 'bg-blue-500',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        description: 'Modals, tooltips, and banners'
    },
    {
        id: 'messages',
        label: 'Messages',
        icon: Smartphone,
        color: 'bg-purple-500',
        gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
        description: 'Push notifications and email'
    },
    {
        id: 'stories',
        label: 'Stories',
        icon: Film,
        color: 'bg-pink-500',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        description: 'Full-screen immersive stories'
    },
    {
        id: 'challenges',
        label: 'Challenges',
        icon: Target,
        color: 'bg-orange-500',
        gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        description: 'Gamified user challenges'
    },
    {
        id: 'streaks',
        label: 'Streaks',
        icon: Flame,
        color: 'bg-red-500',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        description: 'Daily activity streaks'
    },
    {
        id: 'survey',
        label: 'Survey',
        icon: ClipboardList,
        color: 'bg-green-500',
        gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        description: 'User feedback and polls'
    }
];

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
    open,
    onOpenChange,
}) => {
    const navigate = useNavigate();
    const { createCampaign } = useEditorStore();

    const handleSelect = (typeId: string) => {
        onOpenChange(false);
        // Navigate to builder with experience type as query param
        // The DesignStep will show the selection view for choosing nudge type
        navigate(`/campaign-builder?experience=${typeId}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-gray-50/50">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                Choose an Experience
                            </DialogTitle>
                            <p className="text-gray-500 mt-2">
                                Select the type of experience you want to create for your users
                            </p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {EXPERIENCE_TYPES.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => handleSelect(type.id)}
                                    className="group relative flex flex-col items-center p-8 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 text-center"
                                >
                                    <div
                                        className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300"
                                        style={{ background: type.gradient }}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {type.label}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {type.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateCampaignModal;
