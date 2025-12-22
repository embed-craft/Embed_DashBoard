import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Columns, LayoutGrid, Rows } from 'lucide-react';

interface ContainerEditorProps extends LayerEditorProps {
    handleContentUpdate?: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const ContainerEditor: React.FC<ContainerEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    onStyleUpdate,
    handleTooltipUpdate,
    colors = {
        gray: { 200: '#e5e7eb', 300: '#d1d5db' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 50: '#eef2ff', 500: '#6366f1' }
    }
}) => {
    const flexDirection = layer?.style?.flexDirection || 'column';
    const alignItems = layer?.style?.alignItems || 'stretch';
    const justifyContent = layer?.style?.justifyContent || 'flex-start';
    const gap = layer?.style?.gap || 0;
    const backgroundColor = layer?.style?.backgroundColor || '#ffffff';
    const display = layer?.style?.display || 'flex';

    return (
        <div className="space-y-4">
            <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Container Properties</h5>

            {/* Layout Mode */}
            <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Layout Mode</label>
                <div className="flex bg-gray-50 p-1 rounded-md border border-gray-200">
                    <button
                        onClick={() => onStyleUpdate('display', 'flex')}
                        className={`flex-1 py-1 text-xs capitalize rounded flex items-center justify-center gap-1 ${display === 'flex' ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutGrid size={12} /> Flex
                    </button>
                    <button
                        onClick={() => onStyleUpdate('display', 'block')}
                        className={`flex-1 py-1 text-xs capitalize rounded flex items-center justify-center gap-1 ${display === 'block' ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Columns size={12} /> Block
                    </button>
                </div>
            </div>

            {display === 'flex' && (
                <>
                    {/* Direction */}
                    <div className="mb-3">
                        <label className="block text-xs text-gray-500 mb-1">Direction</label>
                        <div className="flex bg-gray-50 p-1 rounded-md border border-gray-200">
                            <button
                                onClick={() => onStyleUpdate('flexDirection', 'column')}
                                className={`flex-1 py-1 text-xs capitalize rounded flex items-center justify-center gap-1 ${flexDirection === 'column' ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Vertical"
                            >
                                <Rows size={12} /> Vertical
                            </button>
                            <button
                                onClick={() => onStyleUpdate('flexDirection', 'row')}
                                className={`flex-1 py-1 text-xs capitalize rounded flex items-center justify-center gap-1 ${flexDirection === 'row' ? 'bg-white shadow-sm text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                title="Horizontal"
                            >
                                <Columns size={12} /> Horizontal
                            </button>
                        </div>
                    </div>

                    {/* Alignment */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Align Items</label>
                            <select
                                value={alignItems}
                                onChange={(e) => onStyleUpdate('alignItems', e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none bg-white"
                            >
                                <option value="stretch">Stretch</option>
                                <option value="flex-start">Start</option>
                                <option value="center">Center</option>
                                <option value="flex-end">End</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Justify Content</label>
                            <select
                                value={justifyContent}
                                onChange={(e) => onStyleUpdate('justifyContent', e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none bg-white"
                            >
                                <option value="flex-start">Start</option>
                                <option value="center">Center</option>
                                <option value="flex-end">End</option>
                                <option value="space-between">Space Between</option>
                                <option value="space-around">Space Around</option>
                            </select>
                        </div>
                    </div>

                    {/* Gap */}
                    <div className="mb-3">
                        <label className="block text-xs text-gray-500 mb-1">Gap (px)</label>
                        <input
                            type="number"
                            min="0"
                            value={gap}
                            onChange={(e) => onStyleUpdate('gap', Number(e.target.value))}
                            className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                        />
                    </div>
                </>
            )}

            <SizeControls
                layer={layer}
                selectedLayerId={selectedLayerId}
                updateLayer={updateLayer}
                onStyleUpdate={onStyleUpdate}
                colors={colors}
            />

            {/* Background Color */}
            <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Background Color</label>
                <div className="flex gap-2 items-center">
                    <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                        className="w-10 h-10 border border-gray-200 rounded-md cursor-pointer"
                    />
                    <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => onStyleUpdate('backgroundColor', e.target.value)}
                        className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
            </div>

            <CommonStyleControls
                layer={layer}
                selectedLayerId={selectedLayerId}
                updateLayer={updateLayer}
                onStyleUpdate={onStyleUpdate}
                handleTooltipUpdate={handleTooltipUpdate}
                colors={colors}
                showPosition={true}
            />
        </div>
    );
};
