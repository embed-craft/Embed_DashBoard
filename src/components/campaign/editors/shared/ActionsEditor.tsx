import React from 'react';
import { Layer } from '@/store/useEditorStore';
import { Link2, X, ExternalLink, MessageSquare, LayoutTemplate, MousePointerClick } from 'lucide-react';

interface ActionsEditorProps {
    action: Layer['content']['action'];
    onChange: (action: Layer['content']['action']) => void;
}

export const ActionsEditor: React.FC<ActionsEditorProps> = ({ action, onChange }) => {
    const activeType = action?.type || 'none';

    const handleTypeChange = (type: string) => {
        if (type === 'none') {
            onChange(undefined);
        } else {
            onChange({ ...action, type: type as any });
        }
    };

    const updateField = (field: string, value: any) => {
        onChange({ ...action, [field]: value } as any);
    };

    const ActionButton = ({ type, icon: Icon, label }: { type: string, icon: any, label: string }) => (
        <button
            onClick={() => handleTypeChange(type)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${activeType === type
                ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
        >
            <Icon size={18} className="mb-1.5" />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
                <ActionButton type="none" icon={MousePointerClick} label="No Action" />
                <ActionButton type="close" icon={X} label="Dismiss" />
                <ActionButton type="deeplink" icon={Link2} label="Deep Link" />
                <ActionButton type="link" icon={ExternalLink} label="External URL" />
                <ActionButton type="custom" icon={MessageSquare} label="Callback" />
                <ActionButton type="interface" icon={LayoutTemplate} label="Interface" />
            </div>

            {activeType === 'deeplink' && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Deep Link / Screen</label>
                        <input
                            type="text"
                            value={action?.url || ''}
                            onChange={(e) => updateField('url', e.target.value)}
                            placeholder="e.g. /product/123"
                            className="w-full text-xs p-2 border border-gray-200 rounded focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>
            )}

            {activeType === 'link' && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Web URL</label>
                        <input
                            type="text"
                            value={action?.url || ''}
                            onChange={(e) => updateField('url', e.target.value)}
                            placeholder="https://example.com"
                            className="w-full text-xs p-2 border border-gray-200 rounded focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>
            )}

            {activeType === 'custom' && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Event Name</label>
                        <input
                            type="text"
                            value={action?.eventName || ''}
                            onChange={(e) => updateField('eventName', e.target.value)}
                            placeholder="e.g. on_submit_click"
                            className="w-full text-xs p-2 border border-gray-200 rounded focus:border-indigo-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Triggers a callback in the SDK</p>
                    </div>
                </div>
            )}
            {/* Interface selector omitted for simplicity in this specific task, can add if needed */}
        </div>
    );
};
