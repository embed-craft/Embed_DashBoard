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

    const parseValue = (val: any) => {
        if (val === 'auto' || val === undefined) return { num: '', unit: 'auto' };
        if (val === '100%') return { num: '100', unit: '%' };
        const str = String(val);
        if (str.endsWith('%')) return { num: parseFloat(str), unit: '%' };
        return { num: parseFloat(str), unit: 'px' };
    };

    return (
        <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Size</label>
            <div className="grid grid-cols-2 gap-2">
                {/* Width */}
                <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Width</label>
                    <div className="flex gap-1">
                        <select
                            value={layer.style?.width === 'auto' || layer.style?.width === undefined ? 'auto' : 'custom'}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'auto') onStyleUpdate('width', 'auto');
                                else {
                                    const current = parseValue(layer.style?.width);
                                    onStyleUpdate('width', current.num ? `${current.num}${current.unit === 'auto' ? 'px' : current.unit}` : 200);
                                }
                            }}
                            className="flex-1 p-1.5 border border-gray-200 rounded-md text-xs outline-none"
                        >
                            <option value="auto">Auto</option>
                            <option value="custom">Custom</option>
                        </select>
                        {layer.style?.width !== 'auto' && layer.style?.width !== undefined && (
                            <>
                                <input
                                    type="number"
                                    value={parseValue(layer.style?.width).num}
                                    onChange={(e) => {
                                        const unit = parseValue(layer.style?.width).unit;
                                        onStyleUpdate('width', `${e.target.value}${unit === 'auto' ? 'px' : unit}`);
                                    }}
                                    className="w-[50px] p-1.5 border border-gray-200 rounded-md text-xs outline-none"
                                />
                                <select
                                    value={parseValue(layer.style?.width).unit}
                                    onChange={(e) => {
                                        const num = parseValue(layer.style?.width).num || 0;
                                        onStyleUpdate('width', `${num}${e.target.value}`);
                                    }}
                                    className="w-[45px] p-1.5 border border-gray-200 rounded-md text-xs outline-none"
                                >
                                    <option value="px">px</option>
                                    <option value="%">%</option>
                                </select>
                            </>
                        )}
                    </div>
                </div>

                {/* Height */}
                <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Height</label>
                    <div className="flex gap-1">
                        <select
                            value={layer.style?.height === 'auto' || layer.style?.height === undefined ? 'auto' : 'custom'}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'auto') onStyleUpdate('height', 'auto');
                                else {
                                    const current = parseValue(layer.style?.height);
                                    onStyleUpdate('height', current.num ? `${current.num}${current.unit === 'auto' ? 'px' : current.unit}` : 48);
                                }
                            }}
                            className="flex-1 p-1.5 border border-gray-200 rounded-md text-xs outline-none"
                        >
                            <option value="auto">Auto</option>
                            <option value="custom">Custom</option>
                        </select>
                        {layer.style?.height !== 'auto' && layer.style?.height !== undefined && (
                            <>
                                <input
                                    type="number"
                                    value={parseValue(layer.style?.height).num}
                                    onChange={(e) => {
                                        const unit = parseValue(layer.style?.height).unit;
                                        onStyleUpdate('height', `${e.target.value}${unit === 'auto' ? 'px' : unit}`);
                                    }}
                                    className="w-[50px] p-1.5 border border-gray-200 rounded-md text-xs outline-none"
                                />
                                <select
                                    value={parseValue(layer.style?.height).unit}
                                    onChange={(e) => {
                                        const num = parseValue(layer.style?.height).num || 0;
                                        onStyleUpdate('height', `${num}${e.target.value}`);
                                    }}
                                    className="w-[45px] p-1.5 border border-gray-200 rounded-md text-xs outline-none"
                                >
                                    <option value="px">px</option>
                                    <option value="%">%</option>
                                </select>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
