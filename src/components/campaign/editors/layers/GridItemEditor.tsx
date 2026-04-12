import React from 'react';
import { BoxSelect } from 'lucide-react';
import { PositionEditor } from '@/components/editor/style/PositionEditor';
import { SizeControls } from '@/components/campaign/editors/shared/SizeControls';
import { Separator } from '@/components/ui/separator';

interface GridItemEditorProps {
    layer: any;
    selectedLayerId: string;
    updateLayer: (id: string, updates: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
    colors: any;
}

export const GridItemEditor: React.FC<GridItemEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    onStyleUpdate,
    colors
}) => {
    return (
        <div className="flex flex-col h-full bg-white font-sans text-gray-900">
            {/* Header */}
            <div className="p-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
                <div className="p-1.5 bg-yellow-50 rounded-md border border-yellow-200">
                    <BoxSelect className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold">Grid Loop Item</h3>
                    <p className="text-[10px] text-gray-500 leading-tight">Cloned template bounds</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1">Layout Controlled By Parent</h4>
                    <p className="text-[11px] leading-tight">
                        This element acts as the bounding box for your repeated data format. 
                        Its width and arrangement are strictly managed by the <strong>Grid Container</strong> above it.
                        <br/><br/>
                        Place Text, Images, and Scratch Foils inside this item to design the reward.
                    </p>
                </div>

                {/* --- DIMENSIONS (Optional Overrides) --- */}
                <div className="space-y-4 border rounded-lg p-3 bg-gray-50/50">
                    <h5 className="text-[12px] font-semibold text-gray-900 mb-2">Item Height (Auto or Explicit)</h5>
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
                        showCoordinates={false}
                        showPositionType={false}
                        allowedPositions={['relative']} // Must be relative so elements inside position properly
                    />
                </div>
            </div>
        </div>
    );
};
