import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface CountdownEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const CountdownEditor: React.FC<CountdownEditorProps> = ({
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
    // Defaults matching simplified design
    const endTime = layer.content?.endTime || new Date(Date.now() + 86400000).toISOString();
    const format = layer.content?.format || 'HH:MM:SS';
    const fontSize = layer.content?.fontSize || 24;
    const fontWeight = layer.content?.fontWeight || 'bold';
    const textColor = layer.content?.textColor || '#111827';

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">⏳ Countdown Properties</h5>

                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input
                        type="datetime-local"
                        value={endTime.slice(0, 16)}
                        onChange={(e) => handleContentUpdate('endTime', new Date(e.target.value).toISOString())}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Format</label>
                    <select
                        value={format}
                        onChange={(e) => handleContentUpdate('format', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none bg-white"
                    >
                        <option value="HH:MM:SS">HH:MM:SS</option>
                        <option value="MM:SS">MM:SS</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Font Size</label>
                        <input
                            type="number"
                            value={fontSize}
                            onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Font Weight</label>
                        <select
                            value={fontWeight}
                            onChange={(e) => handleContentUpdate('fontWeight', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none bg-white"
                        >
                            <option value="normal">Normal</option>
                            <option value="medium">Medium</option>
                            <option value="bold">Bold</option>
                        </select>
                    </div>
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
            </div>

            <CommonStyleControls
                layer={layer}
                selectedLayerId={selectedLayerId}
                updateLayer={updateLayer}
                onStyleUpdate={onStyleUpdate}
                handleTooltipUpdate={handleTooltipUpdate}
                colors={colors}
                showPosition={true} // Critical for Overlay Mode
            />
        </>
    );
};
