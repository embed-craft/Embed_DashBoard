import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface ContainerEditorProps extends LayerEditorProps {
    onStyleUpdate: (key: string, value: any) => void;
}

export const ContainerEditor: React.FC<ContainerEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    onStyleUpdate,
    handleTooltipUpdate,
    colors = {
        gray: { 200: '#e5e7eb' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 50: '#eef2ff', 500: '#6366f1' }
    }
}) => {
    const bgColor = layer.style?.backgroundColor || 'transparent';
    const borderRadius = layer.style?.borderRadius || 0;
    const borderColor = layer.style?.borderColor || 'transparent';
    const borderWidth = typeof layer.style?.borderWidth === 'number' ? layer.style.borderWidth : 0;

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Container Properties</h5>

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Background Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                            className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
                        />
                        <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                            className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Border Radius</label>
                        <input
                            type="number"
                            value={borderRadius}
                            onChange={(e) => onStyleUpdate('borderRadius', Number(e.target.value))}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Border Width</label>
                        <input
                            type="number"
                            value={borderWidth}
                            onChange={(e) => onStyleUpdate('borderWidth', Number(e.target.value))}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                </div>

                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Border Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={borderColor}
                            onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                            className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
                        />
                        <input
                            type="text"
                            value={borderColor}
                            onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                            className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
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
