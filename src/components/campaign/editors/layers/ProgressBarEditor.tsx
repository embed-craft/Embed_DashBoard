import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface ProgressBarEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const ProgressBarEditor: React.FC<ProgressBarEditorProps> = ({
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
    const showPercentage = layer.content?.showPercentage || false;
    const barColor = layer.style?.backgroundColor || '#22C55E';

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Progress Bar Properties</h5>
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
                    <label className="block text-xs text-gray-500 mb-1">Max Value</label>
                    <input
                        type="number"
                        value={max}
                        onChange={(e) => handleContentUpdate('max', Number(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Style Variant</label>
                    <select
                        value={layer.content?.progressBarVariant || 'simple'}
                        onChange={(e) => handleContentUpdate('progressBarVariant', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    >
                        <option value="simple">Simple</option>
                        <option value="rounded">Rounded</option>
                        <option value="striped">Striped</option>
                        <option value="animated">Animated Striped</option>
                        <option value="gradient">Gradient</option>
                        <option value="segmented">Segmented</option>
                        <option value="glow">Glow</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Theme Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={layer.content?.themeColor || '#22C55E'}
                            onChange={(e) => handleContentUpdate('themeColor', e.target.value)}
                            className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
                        />
                        <input
                            type="text"
                            value={layer.content?.themeColor || '#22C55E'}
                            onChange={(e) => handleContentUpdate('themeColor', e.target.value)}
                            className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Bar Color (Legacy)</label>
                    <input
                        type="color"
                        value={barColor}
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
