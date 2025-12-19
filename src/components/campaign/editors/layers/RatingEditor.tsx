import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface RatingEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const RatingEditor: React.FC<RatingEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    handleContentUpdate,
    onStyleUpdate,
    handleTooltipUpdate,
    colors = {
        gray: { 200: '#e5e7eb', 300: '#d1d5db' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 500: '#6366f1' }
    }
}) => {
    const maxStars = layer.content?.maxStars || 5;
    const rating = layer.content?.rating || 0;
    const reviewCount = layer.content?.reviewCount || 0;
    const showReviewCount = layer.content?.showReviewCount !== false;
    const starColor = layer.style?.starColor || '#FFB800';
    const starSize = layer.style?.starSize || 20;

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">⭐ Rating Properties</h5>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Rating Value (0-5)</label>
                    <input
                        type="number"
                        min="0"
                        max={maxStars}
                        step="0.5"
                        value={rating}
                        onChange={(e) => handleContentUpdate('rating', Number(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>

                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Max Stars</label>
                    <input
                        type="number"
                        min="3"
                        max="10"
                        value={maxStars}
                        onChange={(e) => handleContentUpdate('maxStars', Number(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Review Count</label>
                    <input
                        type="number"
                        value={reviewCount}
                        onChange={(e) => handleContentUpdate('reviewCount', Number(e.target.value))}
                        placeholder="2847"
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Star Color</label>
                    <input
                        type="color"
                        value={starColor}
                        onChange={(e) => onStyleUpdate('starColor', e.target.value)}
                        className="w-full h-10 border border-gray-200 rounded-md cursor-pointer"
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Star Size (px)</label>
                    <input
                        type="number"
                        value={starSize}
                        onChange={(e) => onStyleUpdate('starSize', Number(e.target.value))}
                        className="w-full p-2 border border-gray-200 rounded-md text-[13px] outline-none"
                    />
                </div>
                <div className="mb-3">
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                        <div
                            onClick={() => handleContentUpdate('showReviewCount', !showReviewCount)}
                            className={`w-11 h-6 rounded-full relative transition-colors ${showReviewCount ? 'bg-indigo-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${showReviewCount ? 'left-[22px]' : 'left-0.5'}`} />
                        </div>
                        <span>Show Review Count</span>
                    </label>
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
