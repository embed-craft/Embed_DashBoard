import React, { useState } from 'react';
import { SizeControls } from '@/components/campaign/editors/shared/SizeControls';
import { PositionEditor } from '@/components/editor/style/PositionEditor';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, Link, Layers, List, Maximize2, RefreshCw } from 'lucide-react';

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

    // Live Server DataSources
    const [liveDataSources, setLiveDataSources] = useState<any[]>([]);
    const [isLoadingSources, setIsLoadingSources] = useState(false);
    
    React.useEffect(() => {
        const fetchFeeds = async () => {
            setIsLoadingSources(true);
            try {
                // Fetch from the newly created backend API
                const res = await fetch('http://localhost:4000/v1/admin/datasources');
                if (res.ok) {
                    const data = await res.json();
                    setLiveDataSources(data);
                }
            } catch (err) {
                console.warn('Could not fetch liver server DataSources', err);
            } finally {
                setIsLoadingSources(false);
            }
        };
        fetchFeeds();
    }, []);

    const activeSchema = liveDataSources.find(ds => ds._id === content.dataSourceId);

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
                <div className="space-y-4 border rounded-lg p-3 bg-indigo-50/30">
                    <h5 className="text-[12px] font-semibold text-indigo-900 flex items-center gap-1.5 mb-3">
                        <Link size={14} className="text-indigo-600" />
                        Data Source Binding
                    </h5>
                    
                    <div className="space-y-3">
                        <Label className="text-[10px] text-indigo-700 font-medium">Data Source</Label>
                        <Select
                            value={content.dataSourceId || ''}
                            onValueChange={(val) => {
                                const feed = liveDataSources.find(d => d._id === val);
                                updateLayer(selectedLayerId, {
                                    content: {
                                        ...layer.content,
                                        dataSourceId: val,
                                        dataSourceUrl: feed ? feed.endpoint_url : ''
                                    }
                                });
                            }}
                        >
                            <SelectTrigger className="h-8 text-[11px] bg-white border-indigo-100 placeholder:text-gray-300">
                                <SelectValue placeholder={isLoadingSources ? 'Loading data sources...' : 'Select internal data source'} />
                            </SelectTrigger>
                            <SelectContent>
                                {liveDataSources.map((ds) => (
                                    <SelectItem key={ds._id} value={ds._id}>{ds.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Internal Schema Introspection */}
                        {content.dataSourceId && activeSchema ? (
                            <div className="p-2 bg-white border border-indigo-50 rounded-md mt-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[9px] font-semibold text-indigo-500 uppercase tracking-wider">Available Variables</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {activeSchema.cached_schema && activeSchema.cached_schema.map((field: any) => (
                                        <span key={field.key} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-mono cursor-pointer hover:bg-indigo-100 transition-colors" title="Copy placeholder">
                                            {`{{${field.key}}}`}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-[9px] text-gray-400 mt-1">Select an internal database table to auto-generate mapping placeholders for the marketing team.</p>
                        )}
                    </div>

                    <div className="pt-2 border-t border-indigo-100/50 flex items-center justify-between">
                        <Label className="text-[11px] text-indigo-800 font-medium cursor-pointer">Enable Loading Shimmer</Label>
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
