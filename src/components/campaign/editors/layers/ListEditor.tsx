import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface ListEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const ListEditor: React.FC<ListEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    handleContentUpdate,
    onStyleUpdate,
    handleTooltipUpdate,
    colors = {
        gray: { 100: '#f3f4f6', 200: '#e5e7eb', 600: '#4b5563' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 500: '#6366f1' }
    }
}) => {
    const items = layer.content?.items || [];
    const listStyle = layer.content?.listStyle || 'bullet';

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">List Properties</h5>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">List Style</label>
                    <select
                        value={listStyle}
                        onChange={(e) => handleContentUpdate('listStyle', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none bg-white"
                    >
                        <option value="bullet">Bullet</option>
                        <option value="numbered">Numbered</option>
                        <option value="checkmark">Checkmark</option>
                    </select>
                </div>

                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-2">List Items</label>
                    {items.map((item: string, index: number) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index] = e.target.value;
                                    handleContentUpdate('items', newItems);
                                }}
                                className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                                placeholder={`Item ${index + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const newItems = items.filter((_: any, i: number) => i !== index);
                                    handleContentUpdate('items', newItems);
                                }}
                                className="p-2 border-none bg-gray-100 rounded-md cursor-pointer text-gray-600"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleContentUpdate('items', [...items, ''])}
                        className="w-full p-2 border border-dashed border-gray-200 rounded-md bg-transparent text-[13px] text-gray-500 cursor-pointer flex items-center justify-center gap-1"
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </div>
            </div>
            <CommonStyleControls
                layer={layer}
                selectedLayerId={selectedLayerId}
                updateLayer={updateLayer}
                onStyleUpdate={onStyleUpdate}
                handleTooltipUpdate={handleTooltipUpdate}
                colors={colors}
            />
        </>
    );
};
