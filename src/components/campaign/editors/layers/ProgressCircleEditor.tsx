import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface ProgressCircleEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const ProgressCircleEditor: React.FC<ProgressCircleEditorProps> = ({
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
    const value = layer.content?.value || 0;
    const max = layer.content?.max || 100;
    const showPercentage = layer.content?.showPercentage !== false;
    const circleColor = layer.style?.backgroundColor || '#6366F1';

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Progress Circle Properties</h5>
                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Current Value</label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleContentUpdate('value', Number(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Style Variant</label>
                    <select
                        value={layer.content?.progressVariant || 'simple'}
                        onChange={(e) => handleContentUpdate('progressVariant', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    >
                        <option value="simple">Simple Ring</option>
                        <option value="semicircle">Semicircle (Gauge)</option>
                        <option value="thick">Thick Ring (Donut)</option>
                        <option value="dashed">Dashed Ring</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Max Value</label>
                    <input
                        type="number"
                        value={max}
                        onChange={(e) => handleContentUpdate('max', Number(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Theme Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={layer.content?.themeColor || '#6366F1'}
                            onChange={(e) => handleContentUpdate('themeColor', e.target.value)}
                            className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
                        />
                        <input
                            type="text"
                            value={layer.content?.themeColor || '#6366F1'}
                            onChange={(e) => handleContentUpdate('themeColor', e.target.value)}
                            className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Circle Color (Legacy)</label>
                    <input
                        type="color"
                        value={circleColor}
                        onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                        className="w-full h-10 border border-gray-200 rounded-md cursor-pointer"
                    />
                </div>
                <div className="mb-3">
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                        <div
                            onClick={() => handleContentUpdate('showPercentage', !showPercentage)}
                            className={`w-11 h-6 rounded-full relative transition-colors ${showPercentage ? 'bg-indigo-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${showPercentage ? 'left-[22px]' : 'left-0.5'}`} />
                        </div>
                        <span>Show Percentage</span>
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
