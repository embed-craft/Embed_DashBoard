import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface ButtonEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const ButtonEditor: React.FC<ButtonEditorProps> = ({
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
    const buttonText = layer?.content?.label || 'Button';
    // Defaults matching the simplified design
    const fontSize = layer?.content?.fontSize || 14;
    const fontWeight = layer?.content?.fontWeight || 'medium';
    const themeColor = layer?.content?.themeColor || '#f8a830';
    const textColor = layer?.content?.textColor || '#ffffff';
    const borderRadius = typeof layer?.style?.borderRadius === 'number' ? layer.style.borderRadius : 50;

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Button Properties</h5>

                {/* Text Content */}
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Button Text</label>
                    <input
                        type="text"
                        value={buttonText}
                        onChange={(e) => handleContentUpdate('label', e.target.value)}
                        placeholder="Button"
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>

                {/* Typography */}
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
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        >
                            <option value="normal">Normal</option>
                            <option value="medium">Medium</option>
                            <option value="semibold">Semibold</option>
                            <option value="bold">Bold</option>
                        </select>
                    </div>
                </div>

                {/* Sizing */}
                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />

                {/* Colors */}
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Button Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={layer.style?.backgroundColor || layer?.content?.themeColor || '#f8a830'}
                            onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                            className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
                        />
                        <input
                            type="text"
                            value={layer.style?.backgroundColor || layer?.content?.themeColor || '#f8a830'}
                            onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                            className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                            className="w-full h-10 border border-gray-200 rounded-md cursor-pointer"
                        />
                    </div>
                </div>

                {/* Border Radius */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Border Radius</span>
                        <span className="font-semibold text-gray-900">{borderRadius}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={borderRadius}
                        onChange={(e) => onStyleUpdate('borderRadius', Number(e.target.value))}
                        className="w-full cursor-pointer accent-red-500" // Matches screenshot red slider
                    />
                </div>
            </div>

            {/* Common Styles: Position, Background opacity, Border */}
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
