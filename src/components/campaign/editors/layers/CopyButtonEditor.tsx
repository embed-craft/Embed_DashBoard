import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';
import {
    Copy,
    Palette,
    Layout,
    ImageIcon,
    Type,
    Maximize,
    Link,
    MessageSquare
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

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

interface CopyButtonEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>, target: 'layer' | 'background' | 'tooltip_image_only') => void;
}

export const CopyButtonEditor: React.FC<CopyButtonEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    handleContentUpdate,
    onStyleUpdate,
    handleTooltipUpdate,
    handleImageUpload,
    colors
}) => {
    const content = layer.content || {};
    const style = layer.style || {};
    const imageUrl = content.imageUrl || '';

    return (
        <div className="p-1">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="general" title="General Settings">
                        <Layout size={14} className="mr-1.5" /> General
                    </TabsTrigger>
                    <TabsTrigger value="design" title="Design & Appearance">
                        <Palette size={14} className="mr-1.5" /> Design
                    </TabsTrigger>
                </TabsList>

                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-5 animate-in fade-in-50 duration-300">

                    {/* Copy Text Section */}
                    <div className="space-y-3">
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                            <Label className="text-blue-900">Copy Text</Label>
                            <Input
                                value={content.copyText || ''}
                                onChange={(e) => handleContentUpdate('copyText', e.target.value)}
                                placeholder="e.g. DISCOUNT2024"
                                className="bg-white border-blue-200 focus-visible:ring-blue-400 font-mono text-xs"
                            />
                            <p className="text-[10px] text-blue-600/80 mt-1.5 flex items-center gap-1">
                                <Copy size={10} />
                                Text to be copied to clipboard
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Copy Trigger</Label>
                        <Select
                            value={content.copyTrigger || 'anywhere'}
                            onChange={(e) => handleContentUpdate('copyTrigger', e.target.value)}
                        >
                            <option value="anywhere">Click Anywhere</option>
                            <option value="icon">Click Icon Only</option>
                        </Select>
                        <p className="text-[10px] text-gray-400">
                            {content.copyTrigger === 'icon'
                                ? "Only clicking the icon will trigger the copy action."
                                : "Clicking anywhere on the button will trigger the copy action."}
                        </p>
                    </div>

                    <Separator />

                    {/* Toast Configuration */}
                    <div className="space-y-4">
                        <h5 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                            <MessageSquare size={12} className="text-gray-500" />
                            Feedback (Toast)
                        </h5>

                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                            <Label className="mb-0 cursor-pointer text-gray-900">Show Toast Notification</Label>
                            <Switch
                                checked={content.showToast || false}
                                onCheckedChange={(checked) => handleContentUpdate('showToast', checked)}
                            />
                        </div>

                        {content.showToast && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                <Label>Toast Message</Label>
                                <textarea
                                    value={content.toastMessage || ''}
                                    onChange={(e) => handleContentUpdate('toastMessage', e.target.value)}
                                    placeholder="e.g. Code copied!"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[60px] resize-y"
                                />
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Media / Icon Section */}
                    <div className="space-y-4">
                        <h5 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                            <ImageIcon size={12} className="text-gray-500" />
                            Icon / Image
                        </h5>



                        {/* Icon Selection */}
                        <div className="space-y-3">
                            <Label>Button Icon</Label>
                            <div className="flex gap-2 flex-wrap">
                                {['Copy', 'Clipboard', 'FileText', 'Link', 'Check'].map((icon) => (
                                    <button
                                        key={icon}
                                        onClick={() => handleContentUpdate('copyIcon', icon)}
                                        className={`h-9 w-9 rounded-md border flex items-center justify-center transition-all ${(content.copyIcon || 'Copy') === icon
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        title={icon}
                                    >
                                        {icon === 'Copy' && <Copy size={16} />}
                                        {icon === 'Clipboard' && <Layout size={16} />}
                                        {icon === 'FileText' && <Type size={16} />}
                                        {icon === 'Link' && <Link size={16} />}
                                        {icon === 'Check' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- DESIGN TAB --- */}
                <TabsContent value="design" className="space-y-5 animate-in fade-in-50 duration-300">

                    {/* Typography */}
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
                                        value={style.fontSize || 14}
                                        onChange={(e) => onStyleUpdate('fontSize', parseInt(e.target.value))}
                                        className="pr-8"
                                    />
                                    <span className="absolute right-3 top-2 text-xs text-gray-400">px</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Font Family</Label>
                            <Select
                                value={style.fontFamily || 'Roboto'}
                                onChange={(e) => onStyleUpdate('fontFamily', e.target.value)}
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
                    </div>

                    {/* Box Model / Background */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-semibold text-gray-900 border-b pb-2">Background & Borders</h5>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Background</Label>
                                <div className="flex gap-2">
                                    <input type="color" value={style.backgroundColor || 'transparent'} onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)} className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-white" />
                                    <Input value={style.backgroundColor || 'transparent'} onChange={e => onStyleUpdate('backgroundColor', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label>Border Color</Label>
                                <div className="flex gap-2">
                                    <input type="color" value={style.borderColor || 'transparent'} onChange={(e) => onStyleUpdate('borderColor', e.target.value)} className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-white" />
                                    <Input value={style.borderColor || 'transparent'} onChange={e => onStyleUpdate('borderColor', e.target.value)} />
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

                    {/* Spacing */}
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
                                <Label>Padding Vertical</Label>
                                <Input
                                    type="number"
                                    value={style.paddingVertical ?? style.paddingTop ?? 0}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        updateLayer(selectedLayerId, {
                                            style: {
                                                ...layer.style,
                                                paddingVertical: val,
                                                paddingTop: undefined,
                                                paddingBottom: undefined,
                                                padding: undefined // Clear unified
                                            }
                                        });
                                    }}
                                />
                            </div>
                            <div>
                                <Label>Padding Horizontal</Label>
                                <Input
                                    type="number"
                                    value={style.paddingHorizontal ?? style.paddingLeft ?? 12}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        updateLayer(selectedLayerId, {
                                            style: {
                                                ...layer.style,
                                                paddingHorizontal: val,
                                                paddingLeft: undefined,
                                                paddingRight: undefined,
                                                padding: undefined // Clear unified
                                            }
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </div>


                    {/* Text Offsets */}
                    <div className="space-y-3">
                        <Label>Text Offsets</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-gray-500 font-normal">Offset X</Label>
                                <Input
                                    type="number"
                                    value={style.textOffsetX || 0}
                                    onChange={(e) => onStyleUpdate('textOffsetX', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label className="text-gray-500 font-normal">Offset Y</Label>
                                <Input
                                    type="number"
                                    value={style.textOffsetY || 0}
                                    onChange={(e) => onStyleUpdate('textOffsetY', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Icon Offsets */}
                    <div className="space-y-3">
                        <Label>Icon Offsets</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-gray-500 font-normal">Offset X</Label>
                                <Input
                                    type="number"
                                    value={style.iconOffsetX || 0}
                                    onChange={(e) => onStyleUpdate('iconOffsetX', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label className="text-gray-500 font-normal">Offset Y</Label>
                                <Input
                                    type="number"
                                    value={style.iconOffsetY || 0}
                                    onChange={(e) => onStyleUpdate('iconOffsetY', parseInt(e.target.value))}
                                />
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
            </Tabs>
        </div>
    );
};
