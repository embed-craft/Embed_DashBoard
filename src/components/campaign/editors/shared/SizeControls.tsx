import React from 'react';
import { LayerEditorProps } from '../types';

interface SizeControlsProps extends LayerEditorProps {
    onStyleUpdate: (key: string, value: any) => void;
}

export const SizeControls: React.FC<SizeControlsProps> = ({
    layer,
    onStyleUpdate
}) => {
    if (!layer || !layer.style) return null;

    // Helper to parse existing value into { mode, value, unit }
    const parseDimension = (val: any) => {
        if (val === 'auto' || val === undefined || val === null) {
            return { mode: 'auto', value: '', unit: 'px' };
        }
        const strVal = String(val);
        const isPercent = strVal.endsWith('%');
        const num = parseFloat(strVal);

        return {
            mode: 'custom',
            value: isNaN(num) ? '' : num,
            unit: isPercent ? '%' : 'px'
        };
    };

    const handleUpdate = (dimension: 'width' | 'height', newMode: string, newValue: any, newUnit: string) => {
        if (newMode === 'auto') {
            onStyleUpdate(dimension, 'auto');
        } else {
            // Custom mode
            const num = parseFloat(String(newValue));
            if (isNaN(num)) return; // Don't update if invalid
            onStyleUpdate(dimension, `${num}${newUnit}`);
        }
    };

    return (
        <div className="mb-4 space-y-3">
            <label className="block text-xs font-semibold text-gray-900 border-b border-gray-100 pb-1 mb-2">
                Size
            </label>

            {/* Helper Component for a single Dimension Row */}
            {['width', 'height'].map((dim) => {
                const label = dim === 'width' ? 'Width' : 'Height';
                const { mode, value, unit } = parseDimension(layer.style![dim as 'width' | 'height']);

                return (
                    <div key={dim} className="flex items-center justify-between gap-2">
                        <label className="text-[11px] text-gray-500 w-12 capitalize">{label}</label>

                        {/* Mode Select (Auto vs Custom) */}
                        <select
                            value={mode}
                            onChange={(e) => handleUpdate(dim as 'width' | 'height', e.target.value, value || 100, unit)}
                            className="p-1.5 border border-gray-200 rounded text-xs outline-none bg-white cursor-pointer hover:border-gray-300 transition-colors w-20"
                        >
                            <option value="auto">Auto</option>
                            <option value="custom">Custom</option>
                        </select>

                        {/* Value Input (Only if Custom) */}
                        {mode === 'custom' && (
                            <div className="flex flex-1 gap-1">
                                <input
                                    type="number"
                                    value={value}
                                    placeholder="0"
                                    onChange={(e) => handleUpdate(dim as 'width' | 'height', 'custom', e.target.value, unit)}
                                    className="flex-1 w-0 p-1.5 border border-gray-200 rounded text-xs outline-none focus:border-indigo-500"
                                />
                                <select
                                    value={unit}
                                    onChange={(e) => handleUpdate(dim as 'width' | 'height', 'custom', value, e.target.value)}
                                    className="w-12 p-1.5 border border-gray-200 rounded text-xs outline-none bg-gray-50 cursor-pointer"
                                >
                                    <option value="px">px</option>
                                    <option value="%">%</option>
                                </select>
                            </div>
                        )}

                        {/* Spacer if Auto to keep alignment if needed, or just let flexible */}
                        {mode === 'auto' && <div className="flex-1" />}
                    </div>
                );
            })}
        </div>
    );
};
