import React from 'react';
import { SizeControls } from '@/components/campaign/editors/shared/SizeControls';
import { PositionEditor } from '@/components/editor/style/PositionEditor';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LayoutGrid, List, Maximize2 } from 'lucide-react';
import { DataBindingEditor } from '@/components/campaign/editors/shared/DataBindingEditor';

interface GridContainerEditorProps {
    layer: any;
    selectedLayerId: string;
    updateLayer: (id: string, updates: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
    colors: any;
}

export const GridContainerEditor: React.FC<GridContainerEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    onStyleUpdate,
    colors
}) => {
    // Helper for content updates
    const updateContent = (key: string, value: any) => {
        updateLayer(selectedLayerId, {
            content: { ...layer.content, [key]: value }
        });
    };

    const content = layer.content || {};



    return (
        <div className="flex flex-col h-full bg-white font-sans text-gray-900">
            {/* Header */}
            <div className="p-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                    <LayoutGrid className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold">Grid Container</h3>
                    <p className="text-[10px] text-gray-500 leading-tight">Data-driven loop template container</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">

                {/* --- DATA BINDING --- */}
                <div className="space-y-4">
                    <DataBindingEditor layer={layer} selectedLayerId={selectedLayerId} updateLayer={updateLayer} />
                    
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <Label className="text-[11px] text-gray-800 font-medium cursor-pointer">Enable Loading Shimmer</Label>
                        <Switch
                            checked={content.shimmerEnabled ?? true}
                            onCheckedChange={(c) => updateContent('shimmerEnabled', c)}
                            className="scale-75 origin-right"
                        />
                    </div>
                </div>

                {/* --- GRID LAYOUT --- */}
                <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                    <h5 className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
                        <List size={14} className="text-gray-500" />
                        Loop Configuration
                    </h5>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] text-gray-600 font-medium">Columns (Span)</Label>
                            <Input
                                type="number"
                                min={1}
                                max={6}
                                value={content.span ?? 2}
                                onChange={(e) => updateContent('span', e.target.value === '' ? 1 : Math.max(1, Number(e.target.value)))}
                                className="h-8 text-xs bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] text-gray-600 font-medium">Horizontal Gap (px)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={content.gridGapX ?? 0}
                                onChange={(e) => updateContent('gridGapX', e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                                className="h-8 text-xs bg-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] text-gray-600 font-medium">Vertical Gap (px)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={content.gridGapY ?? 0}
                                onChange={(e) => updateContent('gridGapY', e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                                className="h-8 text-xs bg-white"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded-md">
                        <p className="text-[10px] text-yellow-800 leading-tight">
                            <strong>Note:</strong> To use this container, add exactly ONE "Grid Element" layer inside it. It will act as the master template to clone.
                        </p>
                    </div>
                </div>

                {/* --- DIMENSIONS --- */}
                <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                    <h5 className="text-[12px] font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
                        <Maximize2 size={14} className="text-gray-500" />
                        Frame Bounds
                    </h5>
                    <SizeControls
                        layer={layer}
                        selectedLayerId={selectedLayerId}
                        updateLayer={updateLayer}
                        onStyleUpdate={onStyleUpdate}
                        colors={colors}
                        hideAspectRatio={true}
                    />
                    
                    <Separator className="my-3 block bg-gray-200"/>

                    <PositionEditor
                        style={layer.style || {}}
                        onChange={(updates) => updateLayer(selectedLayerId, { style: { ...layer.style, ...updates } })}
                        colors={colors}
                        showZIndex={true}
                        showCoordinates={true}
                        showPositionType={false}
                        allowedPositions={['absolute']}
                    />
                </div>
            </div>
        </div>
    );
};
