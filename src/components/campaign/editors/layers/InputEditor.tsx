import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';
import {
    Database,
    Layout,
    MousePointerClick,
    Palette,
    Type,
    Check,
    AlertCircle,
    Send,
    ArrowRight,
    Search,
    Plus,
    Box
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
// Using native inputs styled like Shadcn for performance/simplicity in this complex form
// import { Input } from '@/components/ui/input'; 
// import { Label } from '@/components/ui/label';

// Helper for consistent label styling
const Label = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <label className={`text-xs font-medium text-gray-700 block mb-1.5 ${className}`}>
        {children}
    </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
    />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div className="relative">
        <select
            {...props}
            className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${props.className || ''}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    </div>
);


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
    colors
}) => {
    const content = layer.content || {};
    const style = layer.style || {};

    return (
        <div className="p-1">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="general" title="General Settings">
                        <Layout size={14} className="mr-1.5" /> General
                    </TabsTrigger>
                    <TabsTrigger value="design" title="Design & Appearance">
                        <Palette size={14} className="mr-1.5" /> Design
                    </TabsTrigger>
                    <TabsTrigger value="validation" title="Data Validation">
                        <Database size={14} className="mr-1.5" /> Logic
                    </TabsTrigger>
                    <TabsTrigger value="actions" title="Actions & Events">
                        <MousePointerClick size={14} className="mr-1.5" /> Action
                    </TabsTrigger>
                </TabsList>

                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-5 animate-in fade-in-50 duration-300">

                    {/* Variable Name Section */}
                    <div className="space-y-3">
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                            <Label className="text-blue-900">Variable Name</Label>
                            <Input
                                value={content.variableName || ''}
                                onChange={(e) => handleContentUpdate('variableName', e.target.value)}
                                placeholder="e.g. user_email"
                                className="bg-white border-blue-200 focus-visible:ring-blue-400 font-mono text-xs"
                            />
                            <p className="text-[10px] text-blue-600/80 mt-1.5 flex items-center gap-1">
                                <Database size={10} />
                                Key used in JSON submission
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Text Config */}
                    <div className="space-y-4">
                        <h5 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                            <Type size={12} className="text-gray-500" />
                            Text Labels
                        </h5>

                        <div className="grid gap-3">
                            <div>
                                <Label>Label Text</Label>
                                <Input
                                    value={content.label || ''}
                                    onChange={(e) => handleContentUpdate('label', e.target.value)}
                                    placeholder="e.g. Email Address"
                                />
                            </div>

                            <div>
                                <Label>Placeholder</Label>
                                <Input
                                    value={content.placeholder || ''}
                                    onChange={(e) => handleContentUpdate('placeholder', e.target.value)}
                                    placeholder="e.g. Enter email..."
                                />
                            </div>

                            <div>
                                <Label>Helper Text</Label>
                                <Input
                                    value={content.helperText || ''}
                                    onChange={(e) => handleContentUpdate('helperText', e.target.value)}
                                    placeholder="e.g. We'll never share your email."
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- VALIDATION TAB --- */}
                <TabsContent value="validation" className="space-y-6 animate-in fade-in-50 duration-300">

                    {/* Input Types */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Input Type</Label>
                            <Select
                                value={content.inputType || 'text'}
                                onChange={(e) => handleContentUpdate('inputType', e.target.value)}
                            >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="phone">Phone</option>
                                <option value="password">Password</option>
                                <option value="date">Date</option>
                                <option value="multiline">Multiline Area</option>
                            </Select>
                        </div>
                        <div>
                            <Label>Keyboard</Label>
                            <Select
                                value={content.keyboardType || 'text'}
                                onChange={(e) => handleContentUpdate('keyboardType', e.target.value)}
                            >
                                <option value="text">Default</option>
                                <option value="emailAddress">Email</option>
                                <option value="number">Numeric</option>
                                <option value="phone">Phone Pad</option>
                                <option value="url">URL</option>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    {/* Validation Rules */}
                    <div className="space-y-4">
                        <h5 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                            <AlertCircle size={12} className="text-gray-500" />
                            Validation Rules
                        </h5>

                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                            <Label className="mb-0 cursor-pointer text-gray-900">Required Field</Label>
                            <Switch
                                checked={content.required || false}
                                onCheckedChange={(checked) => handleContentUpdate('required', checked)}
                            />
                        </div>

                        <div>
                            <Label>Regex Pattern (Optional)</Label>
                            <Input
                                value={content.validationRegex || ''}
                                onChange={(e) => handleContentUpdate('validationRegex', e.target.value)}
                                placeholder="e.g. ^[0-9]{5}$"
                                className="font-mono text-xs"
                            />
                        </div>

                        <div>
                            <Label>Error Message</Label>
                            <Input
                                value={content.errorMessage || ''}
                                onChange={(e) => handleContentUpdate('errorMessage', e.target.value)}
                                placeholder="Display when validation fails"
                                className="border-red-200 focus-visible:ring-red-200"
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* --- DESIGN TAB --- */}
                <TabsContent value="design" className="space-y-5 animate-in fade-in-50 duration-300">

                    {/* Typography Section */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-semibold text-gray-900 border-b pb-2">Typography & Colors</h5>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Text Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={content.textColor || '#111827'}
                                        onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                                        className="h-9 w-9 rounded-md border cursor-pointer p-0.5 bg-white"
                                    />
                                    <Input
                                        value={content.textColor || '#111827'}
                                        onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Font Size</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={content.fontSize || 14}
                                        onChange={(e) => handleContentUpdate('fontSize', parseInt(e.target.value))}
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-2 text-xs text-gray-400">px</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Font Family</Label>
                            <Select
                                value={content.fontFamily || 'Roboto'}
                                onChange={(e) => {
                                    handleContentUpdate('fontFamily', e.target.value);
                                    handleContentUpdate('fontUrl', `https://fonts.googleapis.com/css2?family=${e.target.value.replace(/ /g, '+')}&display=swap`);
                                }}
                            >
                                <optgroup label="Sans-Serif">
                                    <option value="Roboto">Roboto</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Open Sans">Open Sans</option>
                                </optgroup>
                                <optgroup label="Serif">
                                    <option value="Playfair Display">Playfair Display</option>
                                    <option value="Merriweather">Merriweather</option>
                                </optgroup>
                                <optgroup label="Monospace">
                                    <option value="Fira Code">Fira Code</option>
                                </optgroup>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Label Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={style.labelColor || '#374151'}
                                        onChange={(e) => onStyleUpdate('labelColor', e.target.value)}
                                        className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-white"
                                    />
                                    <Input
                                        value={style.labelColor || '#374151'}
                                        onChange={(e) => onStyleUpdate('labelColor', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Placeholder Color</Label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={style.placeholderColor || '#9ca3af'}
                                        onChange={(e) => onStyleUpdate('placeholderColor', e.target.value)}
                                        className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-white"
                                    />
                                    <Input
                                        value={style.placeholderColor || '#9ca3af'}
                                        onChange={(e) => onStyleUpdate('placeholderColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Box Model Section */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-semibold text-gray-900 border-b pb-2">Borders & Background</h5>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Background</Label>
                                <div className="flex gap-2">
                                    <input type="color" value={style.backgroundColor || '#ffffff'} onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)} className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-white" />
                                    <Input value={style.backgroundColor || '#ffffff'} onChange={e => onStyleUpdate('backgroundColor', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label>Border Color</Label>
                                <div className="flex gap-2">
                                    <input type="color" value={style.borderColor || '#d1d5db'} onChange={(e) => onStyleUpdate('borderColor', e.target.value)} className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-white" />
                                    <Input value={style.borderColor || '#d1d5db'} onChange={e => onStyleUpdate('borderColor', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label>Radius</Label>
                                <Input type="number" value={style.borderRadius || 6} onChange={e => onStyleUpdate('borderRadius', parseInt(e.target.value))} />
                            </div>
                            <div>
                                <Label>Width</Label>
                                <Input type="number" value={style.borderWidth ?? 1} onChange={e => onStyleUpdate('borderWidth', parseInt(e.target.value))} />
                            </div>
                            <div>
                                <Label>Style</Label>
                                <Select value={style.borderStyle || 'solid'} onChange={e => onStyleUpdate('borderStyle', e.target.value)}>
                                    <option value="solid">Solid</option>
                                    <option value="dashed">Dashed</option>
                                    <option value="dotted">Dotted</option>
                                    <option value="none">None</option>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Focus Color</Label>
                                <div className="flex gap-2">
                                    <input type="color" value={style.focusBorderColor || '#6366f1'} onChange={(e) => onStyleUpdate('focusBorderColor', e.target.value)} className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-white" />
                                </div>
                            </div>
                            <div>
                                <Label>Error Color</Label>
                                <div className="flex gap-2">
                                    <input type="color" value={style.errorColor || '#ef4444'} onChange={(e) => onStyleUpdate('errorColor', e.target.value)} className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-white" />
                                </div>
                            </div>
                        </div>

                        {/* Text Offset - Legacy Indent - Keep or Remove? Let's keep for backward compat but rename or hide if using offsets? 
                           Actually, Text Offset X can replace Indent if we migrate logic. 
                           For now, let's keep the new Offsets section separate. 
                        */}
                        {/* 
                        <div>
                            <Label>Text Indent (Padding Left)</Label>
                            <Input
                                type="number"
                                value={String(style.paddingLeft ?? 10).replace('px', '')}
                                onChange={(e) => onStyleUpdate('paddingLeft', `${e.target.value}px`)}
                            />
                        </div>
                        */}
                    </div>

                    {/* Shadow Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h5 className="text-xs font-semibold text-gray-900">Shadow</h5>
                            <Switch
                                checked={style.shadowEnabled || false}
                                onCheckedChange={(checked) => onStyleUpdate('shadowEnabled', checked)}
                            />
                        </div>

                        {style.shadowEnabled && (
                            <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <Label>Color</Label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={style.shadowColor || '#000000'}
                                            onChange={(e) => onStyleUpdate('shadowColor', e.target.value)}
                                            className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-white"
                                        />
                                        <Input
                                            value={style.shadowColor || '#000000'}
                                            onChange={(e) => onStyleUpdate('shadowColor', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Blur</Label>
                                    <Input
                                        type="number"
                                        value={style.shadowBlur || 0}
                                        onChange={(e) => onStyleUpdate('shadowBlur', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label>Spread</Label>
                                    <Input
                                        type="number"
                                        value={style.shadowSpread || 0}
                                        onChange={(e) => onStyleUpdate('shadowSpread', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label>Offset Y</Label>
                                    <Input
                                        type="number"
                                        value={style.shadowOffsetY || 4}
                                        onChange={(e) => onStyleUpdate('shadowOffsetY', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Spacing Section (Simplified) */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-semibold text-gray-900 border-b pb-2">Spacing</h5>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Margin</Label>
                                <Input
                                    type="number"
                                    value={style.margin ?? 0}
                                    onChange={(e) => onStyleUpdate('margin', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label>Padding</Label>
                                <Input
                                    type="number"
                                    value={style.padding ?? 12}
                                    onChange={(e) => onStyleUpdate('padding', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Offsets Section */}
                    <div className="space-y-3">
                        <Label>Element Offsets</Label>

                        {/* Text Offsets */}
                        <div className="space-y-1">
                            <Label className="text-gray-500 font-normal text-[10px]">Text (Input)</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-normal text-gray-400">Offset X</Label>
                                    <Input
                                        type="number"
                                        value={style.textOffsetX || 0}
                                        onChange={(e) => onStyleUpdate('textOffsetX', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-normal text-gray-400">Offset Y</Label>
                                    <Input
                                        type="number"
                                        value={style.textOffsetY || 0}
                                        onChange={(e) => onStyleUpdate('textOffsetY', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Icon Offsets */}
                        <div className="space-y-1 mt-2">
                            <Label className="text-gray-500 font-normal text-[10px]">Icon (Submit Button)</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-normal text-gray-400">Offset X</Label>
                                    <Input
                                        type="number"
                                        value={style.iconOffsetX || 0}
                                        onChange={(e) => onStyleUpdate('iconOffsetX', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs font-normal text-gray-400">Offset Y</Label>
                                    <Input
                                        type="number"
                                        value={style.iconOffsetY || 0}
                                        onChange={(e) => onStyleUpdate('iconOffsetY', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <SizeControls
                        layer={layer}
                        selectedLayerId={selectedLayerId}
                        updateLayer={updateLayer}
                        onStyleUpdate={onStyleUpdate}
                        colors={colors}
                    />

                    <CommonStyleControls
                        layer={layer}
                        selectedLayerId={selectedLayerId}
                        updateLayer={updateLayer}
                        onStyleUpdate={onStyleUpdate}
                        handleTooltipUpdate={handleTooltipUpdate}
                        colors={colors}
                        showPadding={false}
                    />
                </TabsContent>

                {/* --- ACTIONS TAB --- */}
                <TabsContent value="actions" className="space-y-5 animate-in fade-in-50 duration-300">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Label className="text-gray-900 mb-0 flex items-center gap-2">
                                <Send size={14} className={content.showSubmitButton ? "text-indigo-600" : "text-gray-400"} />
                                Show Submit Button
                            </Label>
                            <Switch
                                checked={!!content.showSubmitButton}
                                onCheckedChange={(checked) => handleContentUpdate('showSubmitButton', checked)}
                            />
                        </div>

                        {content.showSubmitButton && (
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <div>
                                    <Label>Button Icon</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['Send', 'ArrowRight', 'Check', 'Search', 'Plus'].map((icon) => (
                                            <button
                                                key={icon}
                                                onClick={() => handleContentUpdate('submitIcon', icon)}
                                                className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-all ${(content.submitIcon || 'Send') === icon
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {icon === 'Send' && <Send size={18} />}
                                                {icon === 'ArrowRight' && <ArrowRight size={18} />}
                                                {icon === 'Check' && <Check size={18} />}
                                                {icon === 'Search' && <Search size={18} />}
                                                {icon === 'Plus' && <Plus size={18} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500">
                                    This button appears inside the input field on the right.
                                    Configure the action to trigger in the layer's primary Action tab.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
};
