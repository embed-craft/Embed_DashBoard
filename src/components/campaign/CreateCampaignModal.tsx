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
    X,
    Sparkles
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils'; // Assuming cn exists, if not I'll stick to standard template literals or just strings.
// Wait, I don't see cn imported in original file. I'll avoid adding new dependencies if possible.

interface CreateCampaignModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EXPERIENCE_TYPES = [
    {
        id: 'nudges',
        label: 'In-app nudges',
        icon: MessageSquare,
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        shadowColor: 'rgba(59, 130, 246, 0.4)',
        description: 'Tooltips, banners, and floaters'
    },
    {
        id: 'messages',
        label: 'Messages',
        icon: Smartphone,
        gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
        shadowColor: 'rgba(168, 85, 247, 0.4)',
        description: 'Push notifications and email'
    },
    {
        id: 'stories',
        label: 'Stories',
        icon: Film,
        gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        shadowColor: 'rgba(236, 72, 153, 0.4)',
        description: 'Full-screen immersive stories'
    },
    {
        id: 'challenges',
        label: 'Challenges',
        icon: Target,
        gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        shadowColor: 'rgba(249, 115, 22, 0.4)',
        description: 'Gamified user challenges'
    },
    {
        id: 'streaks',
        label: 'Streaks',
        icon: Flame,
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        shadowColor: 'rgba(239, 68, 68, 0.4)',
        description: 'Daily activity streaks'
    },
    {
        id: 'survey',
        label: 'Survey',
        icon: ClipboardList,
        gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        shadowColor: 'rgba(34, 197, 94, 0.4)',
        description: 'User feedback and polls'
    }
];

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
    open,
    onOpenChange,
}) => {
    const navigate = useNavigate();

    const handleSelect = (typeId: string) => {
        onOpenChange(false);
        navigate(`/campaign-builder?experience=${typeId}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl p-0 overflow-hidden bg-gray-50/80 backdrop-blur-sm border-0 shadow-2xl">
                <div className="relative p-10">
                    {/* Decorative Header BG */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent opacity-50 pointer-events-none" />

                    <div className="relative flex items-center justify-between mb-10">
                        <div>
                            <DialogTitle className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                                Choose an Experience
                                <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-pulse" />
                            </DialogTitle>
                            <p className="text-gray-500 mt-2 text-lg font-medium">
                                What kind of engagement are you building today?
                            </p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-full transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {EXPERIENCE_TYPES.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => handleSelect(type.id)}
                                    className="group relative flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center overflow-hidden"
                                >
                                    {/* Hover Gradient Bloom */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                                        style={{ background: type.gradient }}
                                    />

                                    {/* Icon Container with Glow */}
                                    <div
                                        className="relative w-20 h-20 rounded-3xl mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                                        style={{
                                            background: type.gradient,
                                            boxShadow: `0 10px 25px -5px ${type.shadowColor}`
                                        }}
                                    >
                                        <Icon className="w-10 h-10 text-white drop-shadow-md" strokeWidth={1.5} />
                                    </div>

                                    <h3 className="relative text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {type.label}
                                    </h3>

                                    <p className="relative text-sm font-medium text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
                                        {type.description}
                                    </p>

                                    {/* Arrow hint on hover? Optional */}
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
