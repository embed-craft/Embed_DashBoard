import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface InputEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const InputEditor: React.FC<InputEditorProps> = ({
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
    const inputType = layer.content?.inputType || 'text';
    const placeholder = layer.content?.placeholder || '';
    const required = layer.content?.required || false;
    const textColor = layer.content?.textColor || '#111827';

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Input Field Properties</h5>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Input Type</label>
                    <select
                        value={inputType}
                        onChange={(e) => handleContentUpdate('inputType', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none bg-white"
                    >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="textarea">Textarea</option>
                    </select>
                </div>

                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Placeholder Text</label>
                    <input
                        type="text"
                        value={placeholder}
                        onChange={(e) => handleContentUpdate('placeholder', e.target.value)}
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
                            onClick={() => handleContentUpdate('required', !required)}
                            className={`w-11 h-6 rounded-full relative transition-colors ${required ? 'bg-indigo-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${required ? 'left-[22px]' : 'left-0.5'}`} />
                        </div>
                        <span>Required Field</span>
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
