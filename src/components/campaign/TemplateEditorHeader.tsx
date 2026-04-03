import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, LayoutTemplate, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export const TemplateEditorHeader: React.FC = () => {
    const navigate = useNavigate();
    const {
        currentCampaign,
        updateCampaignName,
        saveCampaign,
        isSaving,
    } = useEditorStore();

    const [localName, setLocalName] = useState(currentCampaign?.name || 'Untitled Template');

    const handleSave = async () => {
        if (!currentCampaign) return;
        try {
            await saveCampaign();
            toast.success('Template saved successfully!');
        } catch {
            toast.error('Failed to save template');
        }
    };

    const handleNameBlur = () => {
        if (localName.trim()) {
            updateCampaignName(localName.trim());
        }
    };

    const nudgeTypeColors: Record<string, string> = {
        bottomsheet: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        modal: 'bg-blue-100 text-blue-700 border-blue-200',
        tooltip: 'bg-amber-100 text-amber-700 border-amber-200',
        floater: 'bg-teal-100 text-teal-700 border-teal-200',
        pip: 'bg-rose-100 text-rose-700 border-rose-200',
        fullscreen: 'bg-gray-100 text-gray-700 border-gray-200',
        carousel: 'bg-purple-100 text-purple-700 border-purple-200',
        banner: 'bg-sky-100 text-sky-700 border-sky-200',
    };

    const nudgeType = currentCampaign?.nudgeType || 'modal';
    const typeClass = nudgeTypeColors[nudgeType] || nudgeTypeColors.modal;
    const lastSaved = currentCampaign?.updatedAt
        ? formatDistanceToNow(new Date(currentCampaign.updatedAt), { addSuffix: true })
        : null;

    return (
        <header className="h-14 shrink-0 bg-white border-b border-gray-200 px-4 flex items-center justify-between gap-4 z-50">
            {/* Left — Back + Mode Badge */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/templates')}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span className="font-medium">Templates</span>
                </button>

                <div className="h-4 w-px bg-gray-200" />

                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${typeClass}`}>
                    <LayoutTemplate size={11} />
                    TEMPLATE EDITOR
                </div>

                <span className="text-[10px] text-gray-400 capitalize font-medium hidden md:block">
                    {nudgeType === 'bottomsheet' ? 'Bottom Sheet' : nudgeType === 'pip' ? 'PiP Video' : nudgeType}
                </span>
            </div>

            {/* Center — Editable Name */}
            <div className="flex-1 flex justify-center max-w-sm">
                <input
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    onBlur={handleNameBlur}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    placeholder="Untitled Template"
                    className="w-full text-center text-sm font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-400 focus:outline-none transition-colors py-0.5 px-2"
                />
            </div>

            {/* Right — Save indicator + button */}
            <div className="flex items-center gap-3">
                {lastSaved && !isSaving && (
                    <div className="hidden md:flex items-center gap-1.5 text-[11px] text-gray-400">
                        <CheckCircle2 size={12} className="text-green-500" />
                        <span>Saved {lastSaved}</span>
                    </div>
                )}

                {isSaving && (
                    <div className="hidden md:flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Loader2 size={12} className="animate-spin text-indigo-500" />
                        <span>Saving…</span>
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-indigo-200 hover:shadow-indigo-300"
                >
                    {isSaving ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Save size={14} />
                    )}
                    Save Template
                </button>
            </div>
        </header>
    );
};
