import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface MediaEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>, target: 'layer' | 'background' | 'tooltip_image_only') => void;
}

export const MediaEditor: React.FC<MediaEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    handleContentUpdate,
    onStyleUpdate,
    handleTooltipUpdate,
    handleImageUpload,
    colors = {
        gray: { 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 500: '#6366f1' }
    }
}) => {
    const imageUrl = layer?.content?.imageUrl || layer?.content?.videoUrl || '';
    const hasUrl = !!imageUrl;

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">Media Properties</h5>
                <div className="w-full h-[140px] rounded-lg overflow-hidden mb-4 border border-gray-200 bg-gray-100">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Media preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-[13px]">
                            Upload Image
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] text-gray-900">Add URL</span>
                    <div
                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${hasUrl ? 'bg-indigo-500' : 'bg-gray-300'}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-all ${hasUrl ? 'left-[22px]' : 'left-0.5'}`} />
                    </div>
                </div>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => handleContentUpdate(layer.type === 'video' ? 'videoUrl' : 'imageUrl', e.target.value)}
                        placeholder="https://example.com/image.png"
                        className="flex-1 p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                    <label className="px-4 py-2 bg-indigo-500 text-white rounded-md cursor-pointer text-xs font-medium flex items-center whitespace-nowrap">
                        Upload
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'layer')}
                            className="hidden"
                        />
                    </label>
                </div>

                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />
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
