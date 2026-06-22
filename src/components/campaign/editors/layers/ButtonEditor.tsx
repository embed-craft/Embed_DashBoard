import React, { useRef, useState } from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';
import { TypographyFontFamilySelect } from '../shared/TypographyFontFamilySelect';
import {
    Layout,
    Palette,
    Type,
    MousePointerClick,
    Check,
    ArrowRight,
    ArrowLeft,
    Play,
    Search,
    Home,
    Monitor,
    X,
    Download,
    Upload,
    User,
    Settings,
    Grid,
    Braces
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/useEditorStore';

const STW_VARIABLES = [
    { label: '🎁 Reward Name', value: '{{reward_name}}', desc: 'Name of the won reward' },
    { label: '🎰 Spins Left', value: '{{spins_left}}', desc: 'Remaining spin attempts' },
    { label: '🔄 Max Spins', value: '{{max_spins}}', desc: 'Total allowed spins' },
];

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
    colors
}) => {
    const content = layer.content || {};
    const style = layer.style || {};
    const { currentCampaign } = useEditorStore();
    const isSTW = currentCampaign?.nudgeType === 'spinthewheel';
    const [showVarMenu, setShowVarMenu] = useState(false);
    const labelInputRef = useRef<HTMLInputElement>(null);

    const insertVariable = (varValue: string) => {
        const inp = labelInputRef.current;
        const currentLabel = content.label || '';
        if (inp) {
            const start = inp.selectionStart || currentLabel.length;
            const end = inp.selectionEnd || currentLabel.length;
            const newLabel = currentLabel.substring(0, start) + varValue + currentLabel.substring(end);
            handleContentUpdate('label', newLabel);
            setTimeout(() => {
                inp.focus();
                inp.selectionStart = inp.selectionEnd = start + varValue.length;
            }, 0);
        } else {
            handleContentUpdate('label', currentLabel + varValue);
        }
        setShowVarMenu(false);
    };

    const buttonIcons = ['ArrowRight', 'ArrowLeft', 'Play', 'Search', 'Home', 'Check', 'X', 'Download', 'Upload', 'User', 'Settings'];

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

                    {/* Text Config */}
                    <div className="space-y-3">
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <Label className="text-blue-900 mb-0">Button Text</Label>
                                {isSTW && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowVarMenu(!showVarMenu)}
                                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-all"
                                            title="Insert dynamic variable"
                                        >
                                            <Braces size={12} />
                                            <span>Insert Variable</span>
                                        </button>
                                        {showVarMenu && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setShowVarMenu(false)} />
                                                <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-1.5 min-w-[200px] animate-in fade-in-50 slide-in-from-top-2 duration-200">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-0.5">Dynamic Variables</p>
                                                    {STW_VARIABLES.map(v => (
                                                        <button
                                                            key={v.value}
                                                            onClick={() => insertVariable(v.value)}
                                                            className="w-full text-left px-2.5 py-2 rounded-md hover:bg-indigo-50 transition-colors group"
                                                        >
                                                            <span className="text-xs font-medium text-gray-800 group-hover:text-indigo-700">{v.label}</span>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">{v.desc}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Input
                                ref={labelInputRef}
                                value={content.label || ''}
                                onChange={(e) => handleContentUpdate('label', e.target.value)}
                                placeholder="Button Label"
                                className="bg-white border-blue-200 focus-visible:ring-blue-400 font-medium"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Icon Config */}
                    <div className="space-y-4">
                        <h5 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                            <Grid size={12} className="text-gray-500" />
                            Icon
                        </h5>

                        <div>
                            <Label>Select Icon</Label>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => handleContentUpdate('buttonIcon', '')}
                                    className={`h-9 px-3 rounded-md border text-xs flex items-center justify-center transition-all ${!content.buttonIcon
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    None
                                </button>
                                {buttonIcons.map((icon) => (
                                    <button
                                        key={icon}
                                        onClick={() => handleContentUpdate('buttonIcon', icon)}
                                        className={`h-9 w-9 rounded-md border flex items-center justify-center transition-all ${(content.buttonIcon) === icon
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        title={icon}
                                    >
                                        {icon === 'ArrowRight' && <ArrowRight size={16} />}
                                        {icon === 'ArrowLeft' && <ArrowLeft size={16} />}
                                        {icon === 'Play' && <Play size={16} fill="currentColor" />}
                                        {icon === 'Search' && <Search size={16} />}
                                        {icon === 'Home' && <Home size={16} />}
                                        {icon === 'Check' && <Check size={16} />}
                                        {icon === 'X' && <X size={16} />}
                                        {icon === 'Download' && <Download size={16} />}
                                        {icon === 'Upload' && <Upload size={16} />}
                                        {icon === 'User' && <User size={16} />}
                                        {icon === 'Settings' && <Settings size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {content.buttonIcon && (
                            <div>
                                <Label>Icon Position</Label>
                                <div className="flex bg-gray-100 p-1 rounded-md w-fit">
                                    <button
                                        onClick={() => handleContentUpdate('buttonIconPosition', 'left')}
                                        className={`px-3 py-1.5 text-xs rounded-sm transition-all ${content.buttonIconPosition === 'left' ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Left
                                    </button>
                                    <button
                                        onClick={() => handleContentUpdate('buttonIconPosition', 'right')}
                                        className={`px-3 py-1.5 text-xs rounded-sm transition-all ${(!content.buttonIconPosition || content.buttonIconPosition === 'right') ? 'bg-white shadow-sm text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Right
                                    </button>
                                </div>
                            </div>
                        )}
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
                            <TypographyFontFamilySelect
                                value={content.fontFamily || 'Roboto'}
                                onChange={(val) => handleContentUpdate('fontFamily', val)}
                                handleContentUpdate={handleContentUpdate}
                            />
                        </div>

                        <div>
                            <Label>Font Weight</Label>
                            <Select
                                value={style.fontWeight || content.fontWeight || 'button'}
                                onChange={(e) => {
                                    onStyleUpdate('fontWeight', e.target.value);
                                    handleContentUpdate('fontWeight', e.target.value); // Sync for legacy
                                }}
                            >
                                <option value="normal">Normal</option>
                                <option value="medium">Medium</option>
                                <option value="semibold">Semibold</option>
                                <option value="bold">Bold</option>
                            </Select>
                        </div>
                    </div>

                    {/* Box Model */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-semibold text-gray-900 border-b pb-2">Background & Borders</h5>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Background</Label>
                                <div className="flex gap-2">
                                    <input type="color" value={style.backgroundColor || '#6366f1'} onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)} className="h-9 w-9 rounded border cursor-pointer p-0.5 bg-white" />
                                    <Input value={style.backgroundColor || '#6366f1'} onChange={e => onStyleUpdate('backgroundColor', e.target.value)} />
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
                                <Input type="number" value={style.borderWidth ?? 0} onChange={e => onStyleUpdate('borderWidth', parseInt(e.target.value))} />
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

                    {/* Spacing Section */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-semibold text-gray-900 border-b pb-2">Spacing</h5>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Margin</Label>
                                <Input
                                    type="number"
                                    value={style.margin ?? 0}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        // Clear granular margins to ensure unified value takes precedence
                                        updateLayer(selectedLayerId, {
                                            style: {
                                                ...layer.style,
                                                margin: val,
                                                marginTop: undefined,
                                                marginBottom: undefined,
                                                marginLeft: undefined,
                                                marginRight: undefined,
                                                marginVertical: undefined,
                                                marginHorizontal: undefined
                                            }
                                        });
                                    }}
                                />
                            </div>
                            <div>
                                <Label>Padding Vertical</Label>
                                <Input
                                    type="number"
                                    value={style.paddingVertical ?? style.paddingTop ?? 10}
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

                    {/* Offsets Section */}
                    <div className="space-y-3">
                        <Label>Element Offsets</Label>

                        {/* Text Offsets */}
                        <div className="space-y-1">
                            <Label className="text-gray-500 font-normal text-[10px]">Text Label</Label>
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
                        {content.buttonIcon && (
                            <div className="space-y-1 mt-2">
                                <Label className="text-gray-500 font-normal text-[10px]">Icon</Label>
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
                        )}
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
                        showPosition={true}
                        showPadding={false}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};
