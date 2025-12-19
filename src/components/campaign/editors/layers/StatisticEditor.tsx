import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface StatisticEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const StatisticEditor: React.FC<StatisticEditorProps> = ({
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
    const prefix = layer.content?.prefix || '';
    const suffix = layer.content?.suffix || '';
    const animateOnLoad = layer.content?.animateOnLoad !== false;
    const fontSize = layer.content?.fontSize || 36;
    const textColor = layer.content?.textColor || '#111827';

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Statistic Properties</h5>
                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Value</label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleContentUpdate('value', Number(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Prefix</label>
                        <input
                            type="text"
                            value={prefix}
                            onChange={(e) => handleContentUpdate('prefix', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                            placeholder="₹"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Suffix</label>
                        <input
                            type="text"
                            value={suffix}
                            onChange={(e) => handleContentUpdate('suffix', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                            placeholder="saved"
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Font Size</label>
                    <input
                        type="number"
                        value={fontSize}
                        onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                    <input
                        type="color"
                        value={textColor}
                        onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                        className="w-full h-10 border border-gray-200 rounded-md cursor-pointer"
                    />
                </div>
                <div className="mb-3">
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                        <div
                            onClick={() => handleContentUpdate('animateOnLoad', !animateOnLoad)}
                            className={`w-11 h-6 rounded-full relative transition-colors ${animateOnLoad ? 'bg-indigo-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${animateOnLoad ? 'left-[22px]' : 'left-0.5'}`} />
                        </div>
                        <span>Animate on Load</span>
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
