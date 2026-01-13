import React, { useState } from 'react';
import { Layer } from '@/store/useEditorStore';
import { Paintbrush, Image as ImageIcon, BoxSelect, Sun } from 'lucide-react';

interface StylesEditorProps {
    layer: Layer;
    updateLayer: (id: string, updates: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const StylesEditor: React.FC<StylesEditorProps> = ({
    layer,
    updateLayer,
    onStyleUpdate
}) => {
    // Background Image/Color Logic
    const bgImage = layer.style?.backgroundImage;
    const bgColor = layer.style?.backgroundColor || '#ffffff';
    const bgSize = layer.style?.backgroundSize || 'cover';
    const hasBgImage = bgImage && bgImage !== 'none';

    // Border Logic
    const borderRadius = layer.style?.borderRadius || 0;
    const borderWidth = layer.style?.borderWidth || 0;
    const borderColor = layer.style?.borderColor || '#e5e7eb';
    const borderStyle = layer.style?.borderStyle || 'solid';

    // Effects Logic
    const opacity = layer.style?.opacity ?? 1;
    const boxShadow = layer.style?.boxShadow || 'none';

    // Shadow Parsing/Helpers
    const isShadowEnabled = boxShadow !== 'none';
    const getShadowValues = () => {
        if (!isShadowEnabled) return { blur: 20, spread: 0, color: 'rgba(0,0,0,0.15)' }; // Defaults
        // Expected format: "0px 4px {blur}px {spread}px {color}"
        const parts = boxShadow.split('px');
        // parts[0] -> 0 (x)
        // parts[1] -> 4 (y)
        // parts[2] -> blur
        // parts[3] -> spread
        // parts[4] -> color (rest of string)
        if (parts.length >= 4) {
            const colorPart = parts.slice(4).join('px').trim(); // Rejoin in case color has px (unlikely but safe)
            return {
                blur: parseInt(parts[2].trim()) || 0,
                spread: parseInt(parts[3].trim()) || 0,
                color: colorPart || 'rgba(0,0,0,0.15)'
            };
        }
        return { blur: 20, spread: 0, color: 'rgba(0,0,0,0.15)' };
    };

    const { blur, spread, color: shadowColor } = getShadowValues();

    const updateShadow = (newBlur: number, newSpread: number, newColor: string) => {
        // Enforce consistent format: offset-x | offset-y | blur-radius | spread-radius | color
        const newShadow = `0px 4px ${newBlur}px ${newSpread}px ${newColor}`;
        onStyleUpdate('boxShadow', newShadow);
    };

    const toggleShadow = () => {
        if (isShadowEnabled) {
            onStyleUpdate('boxShadow', 'none');
        } else {
            updateShadow(20, 0, 'rgba(0,0,0,0.15)'); // Default start
        }
    };

    return (
        <div className="space-y-6">

            {/* 1. Background Section */}
            <div>
                <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Paintbrush size={14} className="text-gray-500" />
                    Appearance
                </h5>

                <div className="space-y-4">
                    {/* Background Color */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Fill Color</label>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden relative shadow-sm">
                                <input
                                    type="color"
                                    value={bgColor.startsWith('#') ? bgColor : '#ffffff'}
                                    onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div
                                    className="w-full h-full"
                                    style={{ backgroundColor: bgColor }}
                                />
                            </div>
                            <input
                                type="text"
                                value={bgColor}
                                onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                                className="flex-1 p-1.5 text-xs border border-gray-200 rounded outline-none focus:border-indigo-500 font-mono"
                                placeholder="#TargetColor"
                            />
                        </div>
                    </div>

                    {/* Background Image */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Image URL</label>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <ImageIcon size={14} className="absolute left-2.5 top-2 text-gray-400" />
                                <input
                                    type="text"
                                    value={hasBgImage ? bgImage.replace('url(', '').replace(')', '') : ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onStyleUpdate('backgroundImage', val ? `url(${val})` : 'none');
                                    }}
                                    placeholder="https://..."
                                    className="w-full pl-8 p-1.5 text-xs border border-gray-200 rounded outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        {hasBgImage && (
                            <div className="mt-2 flex gap-2">
                                <select
                                    value={bgSize}
                                    onChange={(e) => onStyleUpdate('backgroundSize', e.target.value)}
                                    className="block w-full p-1.5 text-xs border border-gray-200 rounded bg-white"
                                >
                                    <option value="cover">Cover (Fill)</option>
                                    <option value="contain">Contain (Fit)</option>
                                    <option value="100% 100%">Stretch</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* 2. Border Section */}
            <div>
                <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <BoxSelect size={14} className="text-gray-500" />
                    Border
                </h5>

                <div className="grid grid-cols-2 gap-4">
                    {/* Radius */}
                    <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-1">Radius</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={typeof borderRadius === 'number' ? borderRadius : 0}
                                onChange={(e) => onStyleUpdate('borderRadius', parseFloat(e.target.value))}
                                className="w-full p-1.5 text-xs border border-gray-200 rounded outline-none"
                                min={0}
                            />
                            <span className="text-[10px] text-gray-400">px</span>
                        </div>
                    </div>
                    {/* Width */}
                    <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-1">Width</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={typeof borderWidth === 'number' ? borderWidth : 0}
                                onChange={(e) => onStyleUpdate('borderWidth', parseFloat(e.target.value))}
                                className="w-full p-1.5 text-xs border border-gray-200 rounded outline-none"
                                min={0}
                            />
                            <span className="text-[10px] text-gray-400">px</span>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex gap-2">
                    <div className="flex-1">
                        <input
                            type="color"
                            value={borderColor}
                            onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                            className="w-full h-8 rounded border border-gray-200 p-0.5 cursor-pointer"
                        />
                    </div>
                    <div className="flex-1">
                        <select
                            value={borderStyle}
                            onChange={(e) => onStyleUpdate('borderStyle', e.target.value)}
                            className="w-full h-8 px-2 text-xs border border-gray-200 rounded bg-white outline-none"
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                        </select>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* 3. Effects Section - REFACTORED TO MATCH FLOATER EDITOR */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
                        <Sun size={14} className="text-gray-500" />
                        Shadow
                    </h5>
                    <button
                        onClick={toggleShadow}
                        className={`w-11 h-6 rounded-full relative transition-colors ${isShadowEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isShadowEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>

                {isShadowEnabled && (
                    <div className="space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        {/* Blur Slider */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-[10px] text-gray-500 uppercase font-semibold">Blur</label>
                                <span className="text-[10px] text-indigo-600 font-medium">{blur}px</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="50"
                                value={blur}
                                onChange={(e) => updateShadow(parseInt(e.target.value), spread, shadowColor)}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Spread Slider */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-[10px] text-gray-500 uppercase font-semibold">Spread</label>
                                <span className="text-[10px] text-indigo-600 font-medium">{spread}px</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="20"
                                value={spread}
                                onChange={(e) => updateShadow(blur, parseInt(e.target.value), shadowColor)}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Shadow Color */}
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-semibold block mb-1">Color</label>
                            <div className="flex gap-2 items-center">
                                <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden relative shadow-sm">
                                    <input
                                        type="color"
                                        value={shadowColor.startsWith('#') ? shadowColor : '#000000'}
                                        onChange={(e) => updateShadow(blur, spread, e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    <div
                                        className="w-full h-full"
                                        style={{ backgroundColor: shadowColor }}
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={shadowColor}
                                    onChange={(e) => updateShadow(blur, spread, e.target.value)}
                                    className="flex-1 p-1.5 text-xs border border-gray-200 rounded outline-none focus:border-indigo-500 font-mono"
                                    placeholder="rgba(0,0,0,0.15)"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Opacity */}
                <div className="mt-4">
                    <div className="flex justify-between mb-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Opacity</label>
                        <span className="text-[10px] text-gray-500">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={opacity}
                        onChange={(e) => onStyleUpdate('opacity', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>

            </div>

        </div>
    );
};
