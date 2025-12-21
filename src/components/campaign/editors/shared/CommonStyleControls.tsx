import React from 'react';
import { PositionEditor } from '@/components/editor/style/PositionEditor';
import { PaddingEditor } from '@/components/editor/style/PaddingEditor';
import { LayerEditorProps } from '../types';

interface CommonStyleControlsProps extends LayerEditorProps {
    onStyleUpdate: (key: string, value: any) => void;
    showPosition?: boolean;
}

export const CommonStyleControls: React.FC<CommonStyleControlsProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    colors = {
        gray: { 200: '#e5e7eb', 300: '#d1d5db' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5' },
        border: { default: '#e5e7eb' }
    }
}) => {
    if (!layer || !layer.style) return null;
    const isTooltipContainer = layer?.name === 'Tooltip Container';

    return (
        <div className="space-y-6">

            {/* 1. Position (X/Y) - Critical for Overlay Mode */}
            {!isTooltipContainer && (
                <div className="border-t border-gray-200 pt-4">
                    <PositionEditor
                        style={layer.style || {}}
                        onChange={(updates) => updateLayer(selectedLayerId, { style: { ...layer.style, ...updates } })}
                        colors={colors}
                        showZIndex={true}
                        showCoordinates={true} // Now restricted to X/Y
                        showPositionType={false}
                    />
                </div>
            )}

            {/* 2. Padding (Top/Right/Bottom/Left) */}
            <div className="border-t border-gray-200 pt-4">
                <PaddingEditor
                    style={layer.style || {}}
                    onChange={(updates) => updateLayer(selectedLayerId, { style: { ...layer.style, ...updates } })}
                    colors={colors}
                />
            </div>

        </div>
    );
};
