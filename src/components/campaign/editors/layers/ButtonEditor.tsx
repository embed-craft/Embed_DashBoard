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
    const buttonText = layer?.content?.label || 'Got it';
    const buttonStyle = layer?.content?.buttonStyle || 'primary';
    const buttonColor = layer?.style?.backgroundColor || '#6366F1';
    const buttonTextColor = layer?.content?.textColor || '#FFFFFF';
    const buttonBorderRadius = typeof layer?.style?.borderRadius === 'number'
        ? layer.style.borderRadius
        : 8;

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Button Properties</h5>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Button Text</label>
                    <input
                        type="text"
                        value={buttonText}
                        onChange={(e) => handleContentUpdate('label', e.target.value)}
                        placeholder="Enter button text"
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Font Size</label>
                        <input
                            type="number"
                            value={layer?.content?.fontSize || 14}
                            onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Font Weight</label>
                        <select
                            value={layer?.content?.fontWeight || 'medium'}
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

                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Button Style</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        {['primary', 'secondary'].map(style => (
                            <button
                                key={style}
                                onClick={() => handleContentUpdate('buttonStyle', style)}
                                className={`p-2 border rounded-md text-xs capitalize transition-colors ${style === buttonStyle ? 'border-primary-500 bg-primary-50 text-indigo-600' : 'border-gray-200 bg-transparent text-gray-500'}`}
                            >
                                {style.charAt(0).toUpperCase() + style.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Style Variant</label>
                    <select
                        value={layer.content?.buttonVariant || 'primary'}
                        onChange={(e) => handleContentUpdate('buttonVariant', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    >
                        <option value="primary">Primary (Solid)</option>
                        <option value="secondary">Secondary (Soft)</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                        <option value="soft">Soft</option>
                        <option value="glass">Glass</option>
                        <option value="gradient">Gradient</option>
                        <option value="shine">Shine</option>
                        <option value="3d">3D</option>
                        <option value="elevated">Elevated</option>
                        <option value="neumorphic">Neumorphic</option>
                        <option value="pill">Pill</option>
                        <option value="underline">Underline</option>
                        <option value="glow">Glow</option>
                        <option value="cyberpunk">Cyberpunk</option>
                        <option value="two-tone">Two Tone</option>
                        <option value="comic">Comic</option>
                        <option value="skeuomorphic">Skeuomorphic</option>
                        <option value="liquid">Liquid</option>
                        <option value="block">Block</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Icon</label>
                        <select
                            value={layer.content?.buttonIcon || ''}
                            onChange={(e) => handleContentUpdate('buttonIcon', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        >
                            <option value="">None</option>
                            <option value="ArrowRight">Arrow Right</option>
                            <option value="ArrowLeft">Arrow Left</option>
                            <option value="Play">Play</option>
                            <option value="Search">Search</option>
                            <option value="Home">Home</option>
                            <option value="Check">Check</option>
                            <option value="X">X</option>
                            <option value="Download">Download</option>
                            <option value="Upload">Upload</option>
                            <option value="User">User</option>
                            <option value="Settings">Settings</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Position</label>
                        <select
                            value={layer.content?.buttonIconPosition || 'right'}
                            onChange={(e) => handleContentUpdate('buttonIconPosition', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        >
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
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
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Button Color</label>
                        <input
                            type="color"
                            value={buttonColor}
                            onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                            className="w-full h-10 border border-gray-200 rounded-md cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                        <input
                            type="color"
                            value={buttonTextColor}
                            onChange={(e) => handleContentUpdate('textColor', e.target.value)} // Bug fix: previously 'textColor' was used, assuming onContentUpdate
                            className="w-full h-10 border border-gray-200 rounded-md cursor-pointer"
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Border Radius</span>
                        <span className="font-semibold text-gray-900">{buttonBorderRadius}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="50"
                        value={buttonBorderRadius}
                        onChange={(e) => onStyleUpdate('borderRadius', Number(e.target.value))}
                        className="w-full cursor-pointer"
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
            />
        </>
    );
};
