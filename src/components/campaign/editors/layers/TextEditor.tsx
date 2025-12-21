import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface TextEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    handleContentUpdate,
    onStyleUpdate,
    handleTooltipUpdate,
    colors = {
        gray: { 200: '#e5e7eb' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 50: '#eef2ff', 500: '#6366f1' }
    }
}) => {
    const textContent = layer?.content?.text || '';
    const fontSize = layer?.content?.fontSize || 16;
    const fontWeight = layer?.content?.fontWeight || 'semibold';
    const textColor = layer?.content?.textColor || '#111827';
    const textAlign = layer?.content?.textAlign || 'center';

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Text Properties</h5>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Content</label>
                    <textarea
                        placeholder="Enter text..."
                        value={textContent}
                        onChange={(e) => handleContentUpdate('text', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none min-h-[80px] resize-y"
                    />
                </div>

                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />

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
                            <option value="semibold">Semibold</option>
                            <option value="bold">Bold</option>
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                            className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
                        />
                        <input
                            type="text"
                            value={textColor}
                            onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                            className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Text Align</label>
                    <div className="flex bg-gray-50 p-1 rounded-md border border-gray-200">
                        {['left', 'center', 'right'].map((align) => (
                            <button
                                key={align}
                                onClick={() => handleContentUpdate('textAlign', align)}
                                className={`flex-1 py-1 text-xs capitalize rounded ${textAlign === align ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {align}
                            </button>
                        ))}
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
                showPosition={true} // Critical for Overlay Mode
            />
        </>
    );
};
