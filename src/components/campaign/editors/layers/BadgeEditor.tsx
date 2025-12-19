import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface BadgeEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const BadgeEditor: React.FC<BadgeEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    handleContentUpdate,
    onStyleUpdate,
    handleTooltipUpdate,
    colors = {
        gray: { 200: '#e5e7eb', 300: '#d1d5db' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 500: '#6366f1' }
    }
}) => {
    const badgeText = layer.content?.badgeText || 'NEW';
    const badgeVariant = layer.content?.badgeVariant || 'custom';
    const pulse = layer.content?.pulse !== false;
    const badgeBackgroundColor = layer.style?.badgeBackgroundColor || '#EF4444';
    const badgeTextColor = layer.style?.badgeTextColor || '#FFFFFF';
    const badgeBorderRadius = layer.style?.badgeBorderRadius || 12;

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">🏷️ Badge Properties</h5>
                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Badge Text</label>
                    <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => handleContentUpdate('badgeText', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        placeholder="30% OFF"
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Variant</label>
                    <select
                        value={badgeVariant}
                        onChange={(e) => handleContentUpdate('badgeVariant', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none bg-white"
                    >
                        <option value="success">Success (Green)</option>
                        <option value="error">Error (Red)</option>
                        <option value="warning">Warning (Orange)</option>
                        <option value="info">Info (Blue)</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                {badgeVariant === 'custom' && (
                    <>
                        <div className="mb-3">
                            <label className="block text-xs text-gray-500 mb-1">Background Color</label>
                            <input
                                type="color"
                                value={badgeBackgroundColor}
                                onChange={(e) => onStyleUpdate('badgeBackgroundColor', e.target.value)}
                                className="w-full h-10 border border-gray-200 rounded-md cursor-pointer"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                            <input
                                type="color"
                                value={badgeTextColor}
                                onChange={(e) => onStyleUpdate('badgeTextColor', e.target.value)}
                                className="w-full h-10 border border-gray-200 rounded-md cursor-pointer"
                            />
                        </div>
                    </>
                )}
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Border Radius</label>
                    <input
                        type="number"
                        value={badgeBorderRadius}
                        onChange={(e) => onStyleUpdate('badgeBorderRadius', Number(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
                <div className="mb-3">
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                        <div
                            onClick={() => handleContentUpdate('pulse', !pulse)}
                            className={`w-11 h-6 rounded-full relative transition-colors ${pulse ? 'bg-indigo-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${pulse ? 'left-[22px]' : 'left-0.5'}`} />
                        </div>
                        <span>Pulse Animation</span>
                    </label>
                </div>
            </div>
            <CommonStyleControls
                layer={layer}
                selectedLayerId={selectedLayerId}
                updateLayer={updateLayer}
                onStyleUpdate={onStyleUpdate}
                handleTooltipUpdate={handleTooltipUpdate}
                colors={colors}
            />
        </>
    );
};
