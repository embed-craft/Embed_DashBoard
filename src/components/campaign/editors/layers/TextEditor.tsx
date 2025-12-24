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

    const handleFontUrlChange = (url: string) => {
        // 1. Check if it's a Google Fonts 'Share' or 'Specimen' URL (User paste error)
        // e.g. https://fonts.google.com/share?selection.family=BBH+Bogle
        // e.g. https://fonts.google.com/specimen/Roboto
        if (url.includes('fonts.google.com/share') || url.includes('fonts.google.com/specimen')) {
            try {
                let family = '';
                if (url.includes('selection.family=')) {
                    family = url.split('selection.family=')[1]?.split('&')[0];
                } else if (url.includes('/specimen/')) {
                    family = url.split('/specimen/')[1]?.split('?')[0];
                }

                if (family) {
                    // Convert to CSS API URL
                    const cleanFamily = family.replace(/\+/g, ' ');
                    const cssUrl = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;

                    // Auto-set both URL and Family Name
                    // We need to call handleContentUpdate for both, but it might batch. 
                    // ideally updateLayer({ content: { ...layer.content, fontUrl: cssUrl, fontFamily: cleanFamily } })
                    // But we only have handleContentUpdate (key, value). Let's call twice.
                    handleContentUpdate('fontUrl', cssUrl);
                    handleContentUpdate('fontFamily', cleanFamily);
                    return;
                }
            } catch (e) {
                console.warn('Failed to parse Google Fonts URL', e);
            }
        }

        // Default: Just set the URL provided
        handleContentUpdate('fontUrl', url);
    };

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Text Properties</h5>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Content</label>
                    <textarea
                        placeholder="Enter text..."
                        value={textContent}
                        onChange={(e) => {
                            handleContentUpdate('text', e.target.value);
                            // We don't usually put text content in style
                        }}
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
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                handleContentUpdate('fontSize', val);
                                onStyleUpdate('fontSize', val);
                            }}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Font Weight</label>
                        <select
                            value={fontWeight}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                handleContentUpdate('fontWeight', val);
                                onStyleUpdate('fontWeight', val);
                            }}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none bg-white"
                        >
                            <option value="400">Normal (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">Semibold (600)</option>
                            <option value="700">Bold (700)</option>
                            <option value="800">Extra Bold (800)</option>
                            <option value="900">Black (900)</option>
                        </select>
                    </div>
                </div>

                {/* Custom Font Section - Using Bundled Fonts for instant SDK loading */}
                <div className="mb-4 pt-3 border-t border-gray-100">
                    <h6 className="text-xs font-semibold text-gray-900 mb-2">Typography & Font</h6>
                    <div className="space-y-2">
                        <div>
                            <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Font Family</label>
                            <select
                                value={layer.content?.fontFamily || 'Roboto'}
                                onChange={(e) => {
                                    const selectedFont = e.target.value;
                                    handleContentUpdate('fontFamily', selectedFont);
                                    // Also set fontUrl for Dashboard preview (Google Fonts CSS URL)
                                    const fontUrl = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/ /g, '+')}&display=swap`;
                                    handleContentUpdate('fontUrl', fontUrl);
                                }}
                                className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none bg-white"
                            >
                                <optgroup label="Sans-Serif">
                                    <option value="Roboto">Roboto</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Open Sans">Open Sans</option>
                                    <option value="Lato">Lato</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Nunito">Nunito</option>
                                    <option value="Raleway">Raleway</option>
                                    <option value="Ubuntu">Ubuntu</option>
                                    <option value="Source Sans Pro">Source Sans Pro</option>
                                </optgroup>
                                <optgroup label="Serif">
                                    <option value="Playfair Display">Playfair Display</option>
                                    <option value="Merriweather">Merriweather</option>
                                    <option value="Lora">Lora</option>
                                    <option value="PT Serif">PT Serif</option>
                                </optgroup>
                                <optgroup label="Monospace">
                                    <option value="Fira Code">Fira Code</option>
                                    <option value="Source Code Pro">Source Code Pro</option>
                                    <option value="JetBrains Mono">JetBrains Mono</option>
                                </optgroup>
                                <optgroup label="Decorative">
                                    <option value="Pacifico">Pacifico</option>
                                    <option value="Dancing Script">Dancing Script</option>
                                    <option value="Lobster">Lobster</option>
                                </optgroup>
                            </select>
                            <p className="text-[10px] text-gray-400 mt-1">These fonts load instantly in the SDK.</p>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={textColor}
                            onChange={(e) => {
                                handleContentUpdate('textColor', e.target.value);
                                onStyleUpdate('color', e.target.value);
                            }}
                            className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
                        />
                        <input
                            type="text"
                            value={textColor}
                            onChange={(e) => {
                                handleContentUpdate('textColor', e.target.value);
                                onStyleUpdate('color', e.target.value);
                            }}
                            className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-1">Text Align</label>
                    <div className="flex bg-gray-50 p-1 rounded-md border border-gray-200">
                        {['left', 'center', 'right', 'justify'].map((align) => (
                            <button
                                key={align}
                                onClick={() => {
                                    handleContentUpdate('textAlign', align);
                                    onStyleUpdate('textAlign', align);
                                }}
                                className={`flex-1 py-1 text-xs capitalize rounded ${textAlign === align ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {align}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Text Shadow Section */}
                <div className="mb-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h6 className="text-xs font-semibold text-gray-900">Text Shadow</h6>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Offset X</label>
                            <input
                                type="number"
                                value={layer.content?.textShadowX || 0}
                                onChange={(e) => handleContentUpdate('textShadowX', Number(e.target.value))}
                                className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Offset Y</label>
                            <input
                                type="number"
                                value={layer.content?.textShadowY || 0}
                                onChange={(e) => handleContentUpdate('textShadowY', Number(e.target.value))}
                                className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Blur Radius</label>
                            <input
                                type="number"
                                min="0"
                                value={layer.content?.textShadowBlur || 0}
                                onChange={(e) => handleContentUpdate('textShadowBlur', Number(e.target.value))}
                                className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Shadow Color</label>
                            <div className="flex gap-1">
                                <input
                                    type="color"
                                    value={layer.content?.textShadowColor || '#000000'}
                                    onChange={(e) => handleContentUpdate('textShadowColor', e.target.value)}
                                    className="w-full h-[34px] border border-gray-200 rounded-md cursor-pointer"
                                />
                            </div>
                        </div>
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
