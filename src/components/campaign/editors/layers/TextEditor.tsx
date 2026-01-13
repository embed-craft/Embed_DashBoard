import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlignCenter, AlignJustify, AlignLeft, AlignRight, Type, Palette, Layers, Box,
    CaseSensitive, Move, ArrowUpFromLine, Scaling, Underline, Strikethrough,
    CaseUpper, CaseLower, Sun, Square, PaintBucket, Ghost, PenTool
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const Label = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <label className={`text-xs font-medium text-gray-700 block mb-1.5 ${className}`}>
        {children}
    </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
    />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
        <select
            {...props}
            className={`flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${props.className || ''}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    </div>
);

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

    // Derived Design Props
    const style = layer?.style || {};
    const content = layer?.content || {};

    return (
        <div className="p-1">
            <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="text" title="Content & Typography">
                        <Type size={14} className="mr-1.5" /> Text
                    </TabsTrigger>
                    <TabsTrigger value="design" title="Effects & Layout">
                        <Palette size={14} className="mr-1.5" /> Design
                    </TabsTrigger>
                </TabsList>

                {/* --- TEXT TAB --- */}
                <TabsContent value="text" className="space-y-4 animate-in fade-in-50 duration-300">

                    {/* Content Input */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Content</Label>
                            <span className="text-[10px] text-gray-400">{textContent.length} chars</span>
                        </div>
                        <textarea
                            placeholder="Type your text here..."
                            value={textContent}
                            onChange={(e) => handleContentUpdate('text', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none min-h-[100px] resize-y font-sans"
                        />
                    </div>

                    {/* Typography Section */}
                    <div className="bg-gray-50/50 rounded-lg border border-gray-100 p-3 space-y-4">
                        <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center">
                            <CaseSensitive size={12} className="mr-1" /> Typography
                        </h6>

                        {/* Font Family */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px]">Font Family</Label>
                            <Select
                                value={layer.content?.fontFamily || 'Roboto'}
                                onChange={(e) => {
                                    const selectedFont = e.target.value;
                                    handleContentUpdate('fontFamily', selectedFont);
                                    const fontUrl = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/ /g, '+')}&display=swap`;
                                    handleContentUpdate('fontUrl', fontUrl);
                                }}
                            >
                                <optgroup label="Sans-Serif">
                                    <option value="Roboto">Roboto</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Open Sans">Open Sans</option>
                                    <option value="Lato">Lato</option>
                                    <option value="Montserrat">Montserrat</option>
                                </optgroup>
                                <optgroup label="Serif">
                                    <option value="Playfair Display">Playfair Display</option>
                                    <option value="Merriweather">Merriweather</option>
                                </optgroup>
                                <optgroup label="Monospace">
                                    <option value="Fira Code">Fira Code</option>
                                </optgroup>
                                <optgroup label="Decorative">
                                    <option value="Pacifico">Pacifico</option>
                                    <option value="Dancing Script">Dancing Script</option>
                                </optgroup>
                            </Select >
                        </div >

                        {/* Size & Weight */}
                        < div className="grid grid-cols-2 gap-3" >
                            <div>
                                <Label className="text-[11px]">Size</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={fontSize}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            handleContentUpdate('fontSize', val);
                                            onStyleUpdate('fontSize', val);
                                        }}
                                        className="pr-6"
                                    />
                                    <span className="absolute right-2.5 top-2 text-[10px] text-gray-400">px</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-[11px]">Weight</Label>
                                <Select
                                    value={fontWeight}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        handleContentUpdate('fontWeight', val);
                                        onStyleUpdate('fontWeight', val);
                                    }}
                                >
                                    <option value="400">Regular (400)</option>
                                    <option value="500">Medium (500)</option>
                                    <option value="600">Semibold (600)</option>
                                    <option value="700">Bold (700)</option>
                                    <option value="800">Extra Bold (800)</option>
                                    <option value="900">Black (900)</option>
                                </Select>
                            </div>
                        </div >

                        {/* Spacing & Line Height */}
                        < div className="grid grid-cols-2 gap-3" >
                            <div>
                                <Label className="text-[11px] flex items-center gap-1">
                                    <ArrowUpFromLine size={10} /> Line Height
                                </Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={content.lineHeight || 1.4}
                                    onChange={(e) => handleContentUpdate('lineHeight', parseFloat(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label className="text-[11px] flex items-center gap-1">
                                    <Scaling size={10} /> Letter Spacing
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={content.letterSpacing || 0}
                                        onChange={(e) => handleContentUpdate('letterSpacing', parseFloat(e.target.value))}
                                        className="pr-6"
                                    />
                                    <span className="absolute right-2.5 top-2 text-[10px] text-gray-400">px</span>
                                </div>
                            </div>
                        </div >

                        {/* Color & Align */}
                        < div className="grid grid-cols-2 gap-3 items-end" >
                            <div className="space-y-1.5">
                                <Label className="text-[11px]">Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => {
                                            handleContentUpdate('textColor', e.target.value);
                                            onStyleUpdate('color', e.target.value);
                                        }}
                                        className="h-9 w-9 rounded-md border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                                    />
                                    <Input
                                        value={textColor}
                                        onChange={(e) => {
                                            handleContentUpdate('textColor', e.target.value);
                                            onStyleUpdate('color', e.target.value);
                                        }}
                                        className="font-mono text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px]">Alignment</Label>
                                <div className="flex bg-white p-1 rounded-md border border-gray-200 shadow-sm h-9 items-center">
                                    {[
                                        { v: 'left', i: AlignLeft },
                                        { v: 'center', i: AlignCenter },
                                        { v: 'right', i: AlignRight },
                                        { v: 'justify', i: AlignJustify }
                                    ].map(({ v, i: Icon }) => (
                                        <button
                                            key={v}
                                            onClick={() => {
                                                handleContentUpdate('textAlign', v);
                                                onStyleUpdate('textAlign', v);
                                            }}
                                            className={`flex-1 h-7 flex items-center justify-center rounded transition-all ${textAlign === v ? 'bg-gray-100 text-black shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                            title={v}
                                        >
                                            <Icon size={14} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div >

                        {/* Styles & Transform */}
                        < div className="grid grid-cols-2 gap-3" >
                            <div className="space-y-1.5">
                                <Label className="text-[11px]">Decoration</Label>
                                <div className="flex bg-white p-1 rounded-md border border-gray-200 shadow-sm h-9 items-center">
                                    {[
                                        { v: 'none', i: Type, tip: 'None' },
                                        { v: 'underline', i: Underline, tip: 'Underline' },
                                        { v: 'line-through', i: Strikethrough, tip: 'Strikethrough' },
                                    ].map(({ v, i: Icon, tip }) => (
                                        <button
                                            key={v}
                                            onClick={() => handleContentUpdate('textDecoration', v)}
                                            className={`flex-1 h-7 flex items-center justify-center rounded transition-all ${(content.textDecoration || 'none') === v ? 'bg-gray-100 text-black shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                            title={tip}
                                        >
                                            <Icon size={14} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px]">Transform</Label>
                                <div className="flex bg-white p-1 rounded-md border border-gray-200 shadow-sm h-9 items-center">
                                    {[
                                        { v: 'none', i: Type, tip: 'None' },
                                        { v: 'uppercase', i: CaseUpper, tip: 'Uppercase' },
                                        { v: 'lowercase', i: CaseLower, tip: 'Lowercase' },
                                    ].map(({ v, i: Icon, tip }) => (
                                        <button
                                            key={v}
                                            onClick={() => handleContentUpdate('textTransform', v)}
                                            className={`flex-1 h-7 flex items-center justify-center rounded transition-all ${(content.textTransform || 'none') === v ? 'bg-gray-100 text-black shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                                            title={tip}
                                        >
                                            <Icon size={14} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div >

                    </div >

                    <SizeControls layer={layer} selectedLayerId={selectedLayerId} updateLayer={updateLayer} onStyleUpdate={onStyleUpdate} colors={colors} />

                </TabsContent >

                {/* --- DESIGN TAB --- */}
                < TabsContent value="design" className="space-y-5 animate-in fade-in-50 duration-300" >

                    {/* Common Layer Settings (Moved to Top) */}
                    <div className="space-y-2">
                        <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center mb-2">
                            <Box size={12} className="mr-1" /> Layout & Appearance
                        </h6>
                        <CommonStyleControls
                            layer={layer}
                            selectedLayerId={selectedLayerId}
                            updateLayer={updateLayer}
                            onStyleUpdate={onStyleUpdate}
                            handleTooltipUpdate={handleTooltipUpdate}
                            colors={colors}
                            showPosition={true}
                            showPadding={false}
                        />
                    </div>

                    <div className="h-px bg-gray-100 my-4" />

                    {/* Background & Border */}
                    < div className="space-y-3" >
                        <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center mb-2">
                            <PaintBucket size={12} className="mr-1" /> Appearance
                        </h6>
                        <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-3 shadow-sm">
                            {/* Opacity */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-1.5 text-gray-600">
                                        <Ghost size={12} /> Opacity
                                    </Label>
                                    <span className="text-[10px] text-gray-400">{Math.round((style.opacity ?? 1) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={style.opacity ?? 1}
                                    onChange={(e) => onStyleUpdate('opacity', parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>

                            <Separator className="bg-gray-50" />

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-[10px] text-gray-500">Background</Label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={style.backgroundColor || 'transparent'}
                                            onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                                            className="h-9 w-9 rounded-md border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                                        />
                                        <div
                                            className="flex-1 h-9 flex items-center px-2 border border-gray-200 rounded-md text-xs text-gray-500 cursor-pointer hover:bg-gray-50"
                                            onClick={() => onStyleUpdate('backgroundColor', 'transparent')}
                                            title="Clear Background"
                                        >
                                            {style.backgroundColor === 'transparent' ? 'None' : style.backgroundColor}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500">Border Color</Label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={style.borderColor || 'transparent'}
                                            onChange={(e) => onStyleUpdate('borderColor', e.target.value)}
                                            className="h-9 w-9 rounded-md border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                                        />
                                        <div
                                            className="flex-1 h-9 flex items-center px-2 border border-gray-200 rounded-md text-xs text-gray-500 cursor-pointer hover:bg-gray-50"
                                            onClick={() => onStyleUpdate('borderColor', 'transparent')}
                                            title="Clear Border"
                                        >
                                            {style.borderColor === 'transparent' ? 'None' : style.borderColor}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <Label className="text-[10px] text-gray-500">Width</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={style.borderWidth ?? 0}
                                        onChange={(e) => onStyleUpdate('borderWidth', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500">Radius</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={style.borderRadius ?? 0}
                                        onChange={(e) => onStyleUpdate('borderRadius', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label className="text-[10px] text-gray-500">Padding</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={style.padding ?? 0}
                                        onChange={(e) => onStyleUpdate('padding', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div >

                    <div className="h-px bg-gray-100 my-4" />

                    {/* Text Offset */}
                    <div className="space-y-3">
                        <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center mb-2">
                            <Move size={12} className="mr-1" /> Text Offset
                        </h6>
                        <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-3 shadow-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-gray-500">Offset X</Label>
                                    <Input
                                        type="number"
                                        value={layer.content?.textOffsetX || 0}
                                        onChange={(e) => handleContentUpdate('textOffsetX', Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-gray-500">Offset Y</Label>
                                    <Input
                                        type="number"
                                        value={layer.content?.textOffsetY || 0}
                                        onChange={(e) => handleContentUpdate('textOffsetY', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-4" />

                    {/* Text Shadow */}
                    <div className="space-y-3">
                        <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center mb-2">
                            <Layers size={12} className="mr-1" /> Text Shadow
                        </h6>
                        <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-3 shadow-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-gray-500">Offset X</Label>
                                    <Input
                                        type="number"
                                        value={layer.content?.textShadowX || 0}
                                        onChange={(e) => handleContentUpdate('textShadowX', Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-gray-500">Offset Y</Label>
                                    <Input
                                        type="number"
                                        value={layer.content?.textShadowY || 0}
                                        onChange={(e) => handleContentUpdate('textShadowY', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-gray-500">Blur</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={layer.content?.textShadowBlur || 0}
                                        onChange={(e) => handleContentUpdate('textShadowBlur', Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-gray-500">Color</Label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={layer.content?.textShadowColor || '#000000'}
                                            onChange={(e) => handleContentUpdate('textShadowColor', e.target.value)}
                                            className="h-9 w-9 rounded-md border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                                        />
                                        <Input
                                            value={layer.content?.textShadowColor || '#000000'}
                                            onChange={(e) => handleContentUpdate('textShadowColor', e.target.value)}
                                            className="uppercase font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-4" />

                    {/* Text Stroke */}
                    <div className="space-y-3">
                        <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center mb-2">
                            <PenTool size={12} className="mr-1" /> Text Stroke
                        </h6>
                        <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-3 shadow-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-gray-500">Width</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={layer.content?.textStrokeWidth || 0}
                                        onChange={(e) => handleContentUpdate('textStrokeWidth', Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] text-gray-500">Color</Label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={layer.content?.textStrokeColor || '#000000'}
                                            onChange={(e) => handleContentUpdate('textStrokeColor', e.target.value)}
                                            className="h-9 w-9 rounded-md border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                                        />
                                        <Input
                                            value={layer.content?.textStrokeColor || '#000000'}
                                            onChange={(e) => handleContentUpdate('textStrokeColor', e.target.value)}
                                            className="uppercase font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 my-4" />

                </TabsContent >
            </Tabs >
        </div >
    );
};
