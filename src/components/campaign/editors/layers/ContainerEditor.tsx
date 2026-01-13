import React from 'react';
import { LayerEditorProps } from '@/components/campaign/editors/types'; // Assuming this exists or using generic props
import { StylesEditor } from './StylesEditor';
import { SizeControls } from '@/components/campaign/editors/shared/SizeControls';
import { PaddingEditor } from '@/components/editor/style/PaddingEditor'; // Direct import
import { PositionEditor } from '@/components/editor/style/PositionEditor'; // Direct import
import { MousePointer2, Move, Layout, Box, Maximize2 } from 'lucide-react';

interface ContainerEditorProps {
    layer: any; // Type 'Layer' imports were tricky in snippets, using any for broad compatibility, but ideally 'Layer'
    selectedLayerId: string;
    updateLayer: (id: string, updates: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
    handleTooltipUpdate: (key: string, value: any) => void;
    colors: any;
}

export const ContainerEditor: React.FC<ContainerEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    onStyleUpdate,
    handleTooltipUpdate,
    colors
}) => {

    // Handle Content Updates (Interaction)
    const handleContentUpdate = (key: string, value: any) => {
        updateLayer(selectedLayerId, {
            content: {
                ...layer.content,
                [key]: value
            }
        });
    };

    return (
        <div className="flex flex-col gap-1 pb-20"> {/* Reduced gap, handling spacing via padding/sections */}

            {/* Header */}
            <div className="pb-4 mb-2 border-b border-gray-100">
                <h4 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Box size={14} className="text-indigo-600" />
                    </div>
                    Container Settings
                </h4>
                <p className="text-[11px] text-gray-500 ml-9 mt-1">
                    Manage layout, positioning, and style.
                </p>
            </div>

            {/* 1. Position Section */}
            <div className="py-2">
                <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Move size={14} className="text-gray-500" />
                    Position
                </h5>
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

            <hr className="border-gray-100 my-2" />

            {/* 2. Sizing Section */}
            <div className="py-2">
                <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Maximize2 size={14} className="text-gray-500" />
                    Dimensions
                </h5>
                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />

                {/* Overflow Control */}
                <div className="mt-4">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-2">Overflow Behavior</label>
                    <div className="flex bg-gray-50 p-1 rounded-md border border-gray-200">
                        {['visible', 'hidden', 'scroll'].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => onStyleUpdate('overflow', opt)}
                                className={`flex-1 py-1.5 text-xs rounded capitalize transition-all ${(layer.style?.overflow || 'visible') === opt
                                    ? 'bg-white text-indigo-600 shadow-sm font-medium'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <hr className="border-gray-100 my-2" />

            {/* 3. Appearance (Styles) Section */}
            <div className="py-2">
                {/* Header handled inside StylesEditor, but we wrap for spacing consistency */}
                <StylesEditor
                    layer={layer}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                />
            </div>

            <hr className="border-gray-100 my-2" />

            {/* 4. Spacing Section */}
            <div className="py-2">
                <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <Layout size={14} className="text-gray-500" />
                    Inside Spacing
                </h5>
                <PaddingEditor
                    style={layer.style || {}}
                    onChange={(updates) => updateLayer(selectedLayerId, { style: { ...layer.style, ...updates } })}
                    colors={colors}
                />
            </div>

            <hr className="border-gray-100 my-2" />

            {/* 5. Interaction Section */}
            <div className="py-2">
                <h5 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <MousePointer2 size={14} className="text-gray-500" />
                    Interaction
                </h5>

                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-900">Clickable Container</span>
                        <span className="text-[10px] text-gray-500">Enable click actions on this box</span>
                    </div>
                    <input
                        type="checkbox"
                        checked={layer.content?.isInteractive || false}
                        onChange={(e) => handleContentUpdate('isInteractive', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                </label>
                {layer.content?.isInteractive && (
                    <div className="mt-3 flex gap-2 items-start text-xs text-yellow-700 bg-yellow-50 p-2.5 rounded-md border border-yellow-100">
                        <span>⚠</span>
                        <span>Configure the specific action (Link/Navigate) in the <strong>Actions</strong> tab.</span>
                    </div>
                )}
            </div>

        </div>
    );
};
