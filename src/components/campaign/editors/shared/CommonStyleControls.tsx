import React from 'react';
import { PositionEditor } from '@/components/editor/style/PositionEditor';
import { ShapeEditor } from '@/components/editor/style/ShapeEditor';
import { LayerEditorProps } from '../types';

interface CommonStyleControlsProps extends LayerEditorProps {
    onStyleUpdate: (key: string, value: any) => void;
    showPosition?: boolean;
}

export const CommonStyleControls: React.FC<CommonStyleControlsProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    onStyleUpdate,
    handleTooltipUpdate,
    showPosition = true,
    colors = {
        gray: { 200: '#e5e7eb', 300: '#d1d5db' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5' }
    }
}) => {
    if (!layer || !layer.style) return null;

    const isTooltipContainer = layer?.name === 'Tooltip Container';
    const hasBorder = layer.style.borderWidth
        ? typeof layer.style.borderWidth === 'number'
            ? layer.style.borderWidth > 0
            : (layer.style.borderWidth.top > 0 ||
                layer.style.borderWidth.right > 0 ||
                layer.style.borderWidth.bottom > 0 ||
                layer.style.borderWidth.left > 0)
        : false;

    return (
        <div className="space-y-6">

            {/* Position Controls */}
            {showPosition && !isTooltipContainer && (
                <div className="border-t border-gray-200 pt-4">
                    <PositionEditor
                        style={layer.style || {}}
                        onChange={(updates) => updateLayer(selectedLayerId, { style: { ...layer.style, ...updates } })}
                        colors={colors}
                        showZIndex={true}
                        showCoordinates={true}
                        showPositionType={true}
                    />
                </div>
            )}

            {/* Background */}
            <div className="border-t border-gray-200 pt-4">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Background</h5>
                <div className="flex gap-2 items-center">
                    <input
                        type="color"
                        value={layer.style?.backgroundColor || '#FFFFFF'}
                        onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                        className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
                    />
                    <input
                        type="text"
                        value={layer.style?.backgroundColor || '#FFFFFF'}
                        onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                        className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
            </div>

            {/* Shape Editor */}
            <div className="border-t border-gray-200 pt-4">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Shapes & Borders</h5>
                <ShapeEditor
                    style={layer.style || {}}
                    onChange={(updates) => updateLayer(selectedLayerId, { style: { ...layer.style, ...updates } })}
                    colors={colors}
                />
            </div>

            {/* Border */}
            <div className="border-t border-gray-200 pt-4">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Border</h5>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] text-gray-900">Add Border</span>
                    <div
                        onClick={() => onStyleUpdate('borderWidth', hasBorder ? 0 : 1)}
                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${hasBorder ? 'bg-indigo-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-all ${hasBorder ? 'left-[22px]' : 'left-0.5'}`} />
                    </div>
                </div>
                {hasBorder && (
                    <>
                        <div className="mb-3">
                            <label className="block text-xs text-gray-500 mb-1">
                                Border Width: {typeof layer.style?.borderWidth === 'number' ? layer.style.borderWidth : 1}px
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={typeof layer.style?.borderWidth === 'number' ? layer.style.borderWidth : 1}
                                onChange={(e) => onStyleUpdate('borderWidth', Number(e.target.value))}
                                className="w-full cursor-pointer"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-xs text-gray-500 mb-1">Border Color</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={layer.style?.borderColor || '#000000'}
                                    onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                                    className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={layer.style?.borderColor || '#000000'}
                                    onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                                    className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Filters */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                    <h5 className="text-[13px] font-semibold text-gray-900">Filters</h5>
                    {(layer.style?.filter?.blur || layer.style?.filter?.brightness) && (
                        <button onClick={() => onStyleUpdate('filter', {})} className="px-2 py-1 border border-gray-200 rounded text-[11px] text-gray-500">Reset</button>
                    )}
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Blur</label>
                    <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.5"
                        value={layer.style?.filter?.blur || 0}
                        onChange={(e) => {
                            const current = layer.style?.filter || {};
                            onStyleUpdate('filter', { ...current, blur: Number(e.target.value) });
                        }}
                        className="w-full cursor-pointer"
                    />
                </div>
            </div>

            {/* Box Shadow */}
            <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                    <h5 className="text-[13px] font-semibold text-gray-900">Box Shadow</h5>
                    {layer.style?.boxShadow && (
                        <button onClick={() => onStyleUpdate('boxShadow', undefined)} className="px-2 py-1 border border-gray-200 rounded text-[11px] text-gray-500">Remove</button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { name: 'Soft', value: '0 2px 8px rgba(0,0,0,0.1)' },
                        { name: 'Hard', value: '0 8px 24px rgba(0,0,0,0.25)' }
                    ].map(p => (
                        <button
                            key={p.name}
                            onClick={() => onStyleUpdate('boxShadow', p.value)}
                            className={`p-2 border rounded-md text-xs ${layer.style?.boxShadow === p.value ? 'bg-indigo-50' : 'bg-white'}`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};
