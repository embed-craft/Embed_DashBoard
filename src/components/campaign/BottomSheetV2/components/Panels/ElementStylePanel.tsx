import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import {
    Type,
    Move,
    Scaling,
    RotateCw,
    BoxSelect,
    Layers,
    Image as ImageIcon,
    MousePointer2,
    Minimize,
    Maximize
} from 'lucide-react';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';

interface ElementStylePanelProps {
    state: BottomSheetState;
}

export const ElementStylePanel: React.FC<ElementStylePanelProps> = ({ state }) => {
    const { selectedComponent, updateComponent } = state;

    if (!selectedComponent) return null;

    const style = selectedComponent.style || {};
    const content = selectedComponent.content || {};

    // Helper to update style
    const handleStyleUpdate = (updates: any) => {
        updateComponent(selectedComponent.id, {
            style: { ...style, ...updates }
        });
    };

    // Helper to update position
    const handlePositionUpdate = (updates: any) => {
        updateComponent(selectedComponent.id, {
            position: { ...selectedComponent.position, ...updates }
            // Also update style for rendering if needed, though usually position updates handled separately
        });
    };

    // Helper to update specific content
    const handleContentUpdate = (updates: any) => {
        updateComponent(selectedComponent.id, {
            content: { ...content, ...updates }
        });
    };


    // --- Sections ---

    const LayoutSection = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <BoxSelect className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-semibold">Layout & Position</h4>
            </div>

            {/* Container Restrictions: Hide Display, Position, Z-Index, and Force Overflow */}
            {selectedComponent.type !== 'container' ? (
                <>

                    {/* Hide Display/Position for Container */}
                    {selectedComponent.type !== 'container' && (
                        <>
                            {/* Display Mode */}
                            <div className="space-y-2">
                                <Label className="text-xs">Display Mode</Label>
                                <ToggleGroup
                                    type="single"
                                    value={style.display || 'block'}
                                    onValueChange={(val) => handleStyleUpdate({ display: val })}
                                    className="justify-start"
                                >
                                    <ToggleGroupItem value="flex" className="text-xs h-7 px-2">Flex</ToggleGroupItem>
                                    <ToggleGroupItem value="block" className="text-xs h-7 px-2">Block</ToggleGroupItem>
                                    <ToggleGroupItem value="inline-block" className="text-xs h-7 px-2">Inline Block</ToggleGroupItem>
                                    <ToggleGroupItem value="none" className="text-xs h-7 px-2 text-red-500">None</ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            {/* Position Type */}
                            <div className="space-y-2">
                                <Label className="text-xs">Position Type</Label>
                                <select
                                    className="w-full text-xs border rounded p-1"
                                    value={style.position || 'relative'}
                                    onChange={(e) => handleStyleUpdate({ position: e.target.value })}
                                >
                                    <option value="relative">Relative (Default)</option>
                                    <option value="absolute">Absolute</option>
                                    <option value="fixed">Fixed</option>
                                    <option value="sticky">Sticky</option>
                                </select>
                            </div>

                            {/* Coordinates (Top/Right/Bottom/Left) - Only if absolute/fixed/sticky */}
                            {['absolute', 'fixed', 'sticky'].includes(style.position) && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Top</Label>
                                        <Input
                                            type="text"
                                            className="h-7 text-xs"
                                            value={style.top || ''}
                                            placeholder="auto"
                                            onChange={(e) => handleStyleUpdate({ top: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Right</Label>
                                        <Input
                                            type="text"
                                            className="h-7 text-xs"
                                            value={style.right || ''}
                                            placeholder="auto"
                                            onChange={(e) => handleStyleUpdate({ right: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Bottom</Label>
                                        <Input
                                            type="text"
                                            className="h-7 text-xs"
                                            value={style.bottom || ''}
                                            placeholder="auto"
                                            onChange={(e) => handleStyleUpdate({ bottom: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500">Left</Label>
                                        <Input
                                            type="text"
                                            className="h-7 text-xs"
                                            value={style.left || ''}
                                            placeholder="auto"
                                            onChange={(e) => handleStyleUpdate({ left: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Z-Index */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label className="text-xs">Z-Index</Label>
                                    <span className="text-xs text-gray-400">{style.zIndex || 'auto'}</span>
                                </div>
                                <Input
                                    type="number"
                                    className="h-8"
                                    value={style.zIndex || 0}
                                    onChange={(e) => handleStyleUpdate({ zIndex: parseInt(e.target.value) })}
                                />
                            </div>

                            {/* Overflow */}
                            <div className="space-y-2">
                                <Label className="text-xs">Overflow</Label>
                                <ToggleGroup
                                    type="single"
                                    value={style.overflow || 'visible'}
                                    onValueChange={(val) => handleStyleUpdate({ overflow: val })}
                                    className="justify-start"
                                >
                                    <ToggleGroupItem value="visible" className="text-xs h-7 px-2">Visible</ToggleGroupItem>
                                    <ToggleGroupItem value="hidden" className="text-xs h-7 px-2">Hidden</ToggleGroupItem>
                                    <ToggleGroupItem value="scroll" className="text-xs h-7 px-2">Scroll</ToggleGroupItem>
                                    <ToggleGroupItem value="auto" className="text-xs h-7 px-2">Auto</ToggleGroupItem>
                                </ToggleGroup>
                            </div>

                            <Separator />
                        </>
                    ) : (
                    /* Container Layout Info (Simplified) */
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                            <span>Overflow</span>
                            <span className="font-medium text-gray-700">Hidden (Enforced)</span>
                        </div>
                        <Separator />
                    </div>
            )}

                    {/* Size */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Width</Label>
                            <div className="flex gap-1">
                                <Input
                                    value={selectedComponent.position.width || style.width || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const num = parseFloat(val);
                                        handlePositionUpdate({ width: isNaN(num) ? val : num });
                                        handleStyleUpdate({ width: isNaN(num) ? val : `${num}px` });
                                    }}
                                    className="h-8 text-xs"
                                    placeholder="auto"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Height</Label>
                            <div className="flex gap-1">
                                <Input
                                    value={selectedComponent.position.height || style.height || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const num = parseFloat(val);
                                        handlePositionUpdate({ height: isNaN(num) ? val : num });
                                        handleStyleUpdate({ height: isNaN(num) ? val : `${num}px` });
                                    }}
                                    className="h-8 text-xs"
                                    placeholder="auto"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            );

    const TypographySection = () => {
        // Only show for text-containing components (text, button, input)
        if (!['text', 'button', 'input', 'badge'].includes(selectedComponent.type)) return null;

            return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Type className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-semibold">Typography</h4>
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                    <Label className="text-xs">Font Family</Label>
                    <select
                        className="w-full text-xs border rounded p-1"
                        value={style.fontFamily || 'inherit'}
                        onChange={(e) => handleStyleUpdate({ fontFamily: e.target.value })}
                    >
                        <option value="inherit">Inherit</option>
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="Roboto, sans-serif">Roboto</option>
                        <option value="Open Sans, sans-serif">Open Sans</option>
                        <option value="Montserrat, sans-serif">Montserrat</option>
                        <option value="Lato, sans-serif">Lato</option>
                        <option value="Poppins, sans-serif">Poppins</option>
                        <option value="serif">Serif</option>
                        <option value="monospace">Monospace</option>
                    </select>
                </div>

                {/* Size & Weight */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Size (px)</Label>
                        <Input
                            type="number"
                            value={parseInt(style.fontSize || content.fontSize || 16)}
                            onChange={(e) => handleStyleUpdate({ fontSize: `${e.target.value}px` })}
                            className="h-8 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Weight</Label>
                        <select
                            className="w-full text-xs border rounded h-8"
                            value={style.fontWeight || 'normal'}
                            onChange={(e) => handleStyleUpdate({ fontWeight: e.target.value })}
                        >
                            <option value="100">Thin (100)</option>
                            <option value="300">Light (300)</option>
                            <option value="normal">Normal (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">SemiBold (600)</option>
                            <option value="bold">Bold (700)</option>
                            <option value="800">ExtraBold (800)</option>
                            <option value="900">Black (900)</option>
                        </select>
                    </div>
                </div>

                {/* Align & Transform */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Align</Label>
                        <ToggleGroup type="single" value={style.textAlign || 'left'} onValueChange={(v) => handleStyleUpdate({ textAlign: v })} className="justify-start">
                            <ToggleGroupItem value="left" className="h-7 w-7 p-0"><span className="text-xs">L</span></ToggleGroupItem>
                            <ToggleGroupItem value="center" className="h-7 w-7 p-0"><span className="text-xs">C</span></ToggleGroupItem>
                            <ToggleGroupItem value="right" className="h-7 w-7 p-0"><span className="text-xs">R</span></ToggleGroupItem>
                            <ToggleGroupItem value="justify" className="h-7 w-7 p-0"><span className="text-xs">J</span></ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Transform</Label>
                        <ToggleGroup type="single" value={style.textTransform || 'none'} onValueChange={(v) => handleStyleUpdate({ textTransform: v })} className="justify-start">
                            <ToggleGroupItem value="none" className="h-7 text-[10px] px-1">None</ToggleGroupItem>
                            <ToggleGroupItem value="uppercase" className="h-7 text-[10px] px-1">UP</ToggleGroupItem>
                            <ToggleGroupItem value="lowercase" className="h-7 text-[10px] px-1">low</ToggleGroupItem>
                            <ToggleGroupItem value="capitalize" className="h-7 text-[10px] px-1">Cap</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>

                {/* Color */}
                <div className="space-y-2">
                    <Label className="text-xs">Text Color</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={style.color || content.textColor || '#000000'}
                            onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                            className="w-8 h-8 p-0 border-none"
                        />
                        <Input
                            type="text"
                            value={style.color || content.textColor || '#000000'}
                            onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                            className="flex-1 h-8 text-xs"
                        />
                    </div>
                </div>

                {/* Spacing */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Line Height</Label>
                        <Input
                            value={style.lineHeight || '1.5'}
                            onChange={(e) => handleStyleUpdate({ lineHeight: e.target.value })}
                            className="h-8 text-xs"
                            placeholder="1.5 or px"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Letter Spacing</Label>
                        <Input
                            value={style.letterSpacing || 'normal'}
                            onChange={(e) => handleStyleUpdate({ letterSpacing: e.target.value })}
                            className="h-8 text-xs"
                            placeholder="px"
                        />
                    </div>
                </div>

            </div>
            );
    };

    const BackgroundSection = () => (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-semibold">Background</h4>
                </div>

                {/* Bg Color */}
                <div className="space-y-2">
                    <Label className="text-xs">Fill Color</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={style.backgroundColor || 'transparent'}
                            onChange={(e) => handleStyleUpdate({ backgroundColor: e.target.value })}
                            className="w-8 h-8 p-0 border-none"
                        />
                        <Input
                            type="text"
                            value={style.backgroundColor || 'transparent'}
                            onChange={(e) => handleStyleUpdate({ backgroundColor: e.target.value })}
                            className="flex-1 h-8 text-xs"
                            placeholder="#FFFFFF or transparent"
                        />
                    </div>
                </div>

                {/* Image (Hidden for Container) */}
                {selectedComponent.type !== 'container' && (
                    <div className="space-y-2">
                        <Label className="text-xs">Image URL</Label>
                        <Input
                            value={style.backgroundImage?.replace('url(', '').replace(')', '') || ''}
                            onChange={(e) => handleStyleUpdate({ backgroundImage: e.target.value ? `url(${e.target.value})` : '' })}
                            className="h-8 text-xs"
                            placeholder="https://..."
                        />
                    </div>
                )}

                {/* Image Controls */}
                {selectedComponent.type !== 'container' && style.backgroundImage && (
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-[10px]">Size</Label>
                            <select
                                className="w-full text-xs border rounded p-1"
                                value={style.backgroundSize || 'cover'}
                                onChange={(e) => handleStyleUpdate({ backgroundSize: e.target.value })}
                            >
                                <option value="cover">Cover</option>
                                <option value="contain">Contain</option>
                                <option value="auto">Auto</option>
                                <option value="100% 100%">Stretch</option>
                            </select>
                        </div>
                        <div>
                            <Label className="text-[10px]">Repeat</Label>
                            <select
                                className="w-full text-xs border rounded p-1"
                                value={style.backgroundRepeat || 'no-repeat'}
                                onChange={(e) => handleStyleUpdate({ backgroundRepeat: e.target.value })}
                            >
                                <option value="no-repeat">No Repeat</option>
                                <option value="repeat">Repeat</option>
                                <option value="repeat-x">Repeat X</option>
                                <option value="repeat-y">Repeat Y</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <Label className="text-[10px]">Position</Label>
                            <select
                                className="w-full text-xs border rounded p-1"
                                value={style.backgroundPosition || 'center'}
                                onChange={(e) => handleStyleUpdate({ backgroundPosition: e.target.value })}
                            >
                                <option value="center">Center</option>
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                                <option value="top left">Top Left</option>
                                <option value="top right">Top Right</option>
                                <option value="bottom left">Bottom Left</option>
                                <option value="bottom right">Bottom Right</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const BorderSection = () => {
        // ENFORCE: Hide Border Section for Bottom Sheet Container
        if (selectedComponent.type === 'container') return null;

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <BoxSelect className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-semibold">Borders & Shapes</h4>
                </div>

                {/* Radius */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label className="text-xs">Border Radius</Label>
                        <span className="text-xs text-gray-400">{parseInt(style.borderRadius) || 0}px</span>
                    </div>
                    <Slider
                        value={[parseInt(style.borderRadius) || 0]}
                        onValueChange={(val) => handleStyleUpdate({ borderRadius: val[0] })}
                        min={0}
                        max={100}
                        step={1}
                    />
                </div>

                {/* Border */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                        <Label className="text-[10px]">Width</Label>
                        <Input
                            type="number"
                            className="h-7 text-xs"
                            value={parseInt(style.borderWidth) || 0}
                            onChange={(e) => handleStyleUpdate({ borderWidth: `${e.target.value}px`, borderStyle: style.borderStyle || 'solid' })}
                        />
                    </div>
                    <div className="col-span-1">
                        <Label className="text-[10px]">Style</Label>
                        <select
                            className="w-full text-xs h-7 border rounded"
                            value={style.borderStyle || 'solid'}
                            onChange={(e) => handleStyleUpdate({ borderStyle: e.target.value })}
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                        </select>
                    </div>
                    <div className="col-span-1">
                        <Label className="text-[10px]">Color</Label>
                        <div className="flex">
                            <Input
                                type="color"
                                className="w-full h-7 p-0 border-none"
                                value={style.borderColor || '#000000'}
                                onChange={(e) => handleStyleUpdate({ borderColor: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Clip Path */}
                <div className="space-y-2">
                    <Label className="text-xs">Clip Shape</Label>
                    <select
                        className="w-full text-xs border rounded p-1"
                        value={style.clipPath || ''}
                        onChange={(e) => handleStyleUpdate({ clipPath: e.target.value })}
                    >
                        <option value="">None</option>
                        <option value="circle(50% at 50% 50%)">Circle</option>
                        <option value="ellipse(50% 50% at 50% 50%)">Ellipse</option>
                        <option value="polygon(50% 0%, 0% 100%, 100% 100%)">Triangle</option>
                        <option value="polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)">Diamond</option>
                        <option value="polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)">Parallelogram</option>
                    </select>
                </div>
            </div>
        )
    };

    const TransformSection = () => {
        // ENFORCE: Hide Transform Section for Bottom Sheet Container
        if (selectedComponent.type === 'container') return null;

        // Helper to parse transform string
        const getTransformValue = (key: string) => {
            if (!style.transform) return null;
            // Regex to find 'scale(1.5)' or 'rotate(90deg)'
            const match = style.transform.match(new RegExp(`${key}\\(([^)]+)\\)`));
            return match ? match[1] : null;
        };

        // Helper to update transform string
        const updateTransform = (key: string, value: string | number, unit = '') => {
            let currentTransform = style.transform || '';
            const newVal = `${key}(${value}${unit})`;

            if (currentTransform.includes(key)) {
                // Replace existing
                currentTransform = currentTransform.replace(new RegExp(`${key}\\([^)]+\\)`), newVal);
            } else {
                // Append new
                currentTransform = `${currentTransform} ${newVal}`.trim();
            }

            handleStyleUpdate({ transform: currentTransform });
        };

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Move className="w-4 h-4 text-gray-500" />
                    <h4 className="text-sm font-semibold">Transform</h4>
                </div>

                {/* Simple Transform Controls */}
                <div className="space-y-3">
                    {/* Scale */}
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <Label className="text-xs flex items-center gap-1"><Scaling className="w-3" /> Scale</Label>
                            <span className="text-[10px] text-gray-400">{getTransformValue('scale') || 1}x</span>
                        </div>
                        <Slider
                            value={[parseFloat(getTransformValue('scale') || '1')]}
                            onValueChange={(val) => updateTransform('scale', val[0])}
                            min={0.1}
                            max={3}
                            step={0.1}
                        />
                    </div>

                    {/* Rotate */}
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <Label className="text-xs flex items-center gap-1"><RotateCw className="w-3" /> Rotate</Label>
                            <span className="text-[10px] text-gray-400">{getTransformValue('rotate') || 0}°</span>
                        </div>
                        <Slider
                            value={[parseInt(getTransformValue('rotate') || '0')]}
                            onValueChange={(val) => updateTransform('rotate', val[0], 'deg')}
                            min={0}
                            max={360}
                            step={1}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Subcomponent for ID display
    const IdentitySection = ({ component }: { component: any }) => (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <div className="text-xs text-indigo-600 font-medium uppercase">
                {component.type}
            </div>
            <div className="text-xs text-indigo-500 mt-1 truncate">
                ID: {component.id}
            </div>
        </div>
    );

    return (
        <div className="p-4 space-y-6">
            <IdentitySection component={selectedComponent} />
            <Separator />
            <LayoutSection />
            <Separator />
            <TypographySection />
            {['text', 'button', 'input', 'badge'].includes(selectedComponent.type) && <Separator />}
            <BackgroundSection />
            <Separator />
            {selectedComponent.type !== 'container' && <BorderSection />}
            <Separator />
            {selectedComponent.type !== 'container' && <TransformSection />}
        </div>
    );
};
