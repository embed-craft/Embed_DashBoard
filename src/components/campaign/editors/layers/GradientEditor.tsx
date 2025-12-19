import React from 'react';
import { LayerEditorProps } from '../types';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls';

interface GradientEditorProps extends LayerEditorProps {
    handleContentUpdate: (key: string, value: any) => void;
    onStyleUpdate: (key: string, value: any) => void;
}

export const GradientEditor: React.FC<GradientEditorProps> = ({
    layer,
    selectedLayerId,
    updateLayer,
    handleContentUpdate,
    onStyleUpdate,
    handleTooltipUpdate,
    colors = {
        gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db' },
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5' }
    }
}) => {
    const gradientType = layer.content?.gradientType || 'linear';
    const gradientDirection = layer.content?.gradientDirection || 180;
    const gradientStops = layer.content?.gradientStops || [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
    ];

    const addGradientStop = () => {
        const newStops = [...gradientStops, { color: '#000000', position: 50 }].sort((a, b) => a.position - b.position);
        handleContentUpdate('gradientStops', newStops);
    };

    const removeGradientStop = (index: number) => {
        if (gradientStops.length > 2) { // Minimum 2 stops
            const newStops = gradientStops.filter((_, i) => i !== index);
            handleContentUpdate('gradientStops', newStops);
        }
    };

    const updateGradientStop = (index: number, field: 'color' | 'position', value: any) => {
        const newStops = [...gradientStops];
        newStops[index] = { ...newStops[index], [field]: value };
        if (field === 'position') {
            newStops.sort((a, b) => a.position - b.position);
        }
        handleContentUpdate('gradientStops', newStops);
    };

    // Generate gradient preview
    const gradientPreview = gradientType === 'linear'
        ? `linear-gradient(${typeof gradientDirection === 'number' ? gradientDirection + 'deg' : gradientDirection}, ${gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`
        : `radial-gradient(circle, ${gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`;

    return (
        <>
            <div className="mb-5">
                <h5 className="text-[13px] font-semibold text-gray-900 mb-3">🌈 Gradient Properties</h5>

                <SizeControls
                    layer={layer}
                    selectedLayerId={selectedLayerId}
                    updateLayer={updateLayer}
                    onStyleUpdate={onStyleUpdate}
                    colors={colors}
                />

                <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">Gradient Type</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleContentUpdate('gradientType', 'linear')}
                            className={`flex-1 p-2 border rounded-md text-xs font-medium transition-all ${gradientType === 'linear'
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                    : 'border-gray-200 bg-transparent text-gray-900'
                                }`}
                        >
                            Linear
                        </button>
                        <button
                            onClick={() => handleContentUpdate('gradientType', 'radial')}
                            className={`flex-1 p-2 border rounded-md text-xs font-medium transition-all ${gradientType === 'radial'
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                    : 'border-gray-200 bg-transparent text-gray-900'
                                }`}
                        >
                            Radial
                        </button>
                    </div>
                </div>

                {gradientType === 'linear' && (
                    <div className="mb-4">
                        <label className="block text-xs text-gray-500 mb-2">
                            Angle: {typeof gradientDirection === 'number' ? gradientDirection : 0}°
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={typeof gradientDirection === 'number' ? gradientDirection : 180}
                            onChange={(e) => handleContentUpdate('gradientDirection', Number(e.target.value))}
                            className="w-full cursor-pointer"
                        />
                        <div className="flex gap-1 mt-2">
                            {[0, 90, 180, 270].map(angle => (
                                <button
                                    key={angle}
                                    onClick={() => handleContentUpdate('gradientDirection', angle)}
                                    className={`flex-1 p-1 border rounded text-[11px] cursor-pointer ${gradientDirection === angle ? 'bg-gray-100 border-gray-300' : 'bg-transparent border-gray-200'
                                        }`}
                                >
                                    {angle}°
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">Preview</label>
                    <div
                        className="w-full h-20 rounded-lg border border-gray-200 shadow-sm"
                        style={{ background: gradientPreview }}
                    />
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-gray-500">Color Stops</label>
                        <button
                            onClick={addGradientStop}
                            className="px-3 py-1 border border-indigo-500 bg-indigo-50 text-indigo-600 rounded text-[11px] font-medium"
                        >
                            + Add Stop
                        </button>
                    </div>

                    {gradientStops.map((stop: any, index: number) => (
                        <div key={index} className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="color"
                                    value={stop.color}
                                    onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                                    className="w-10 h-8 border border-gray-200 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={stop.color}
                                    onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                                    className="flex-1 p-1.5 border border-gray-200 rounded text-[11px] font-mono outline-none"
                                />
                                {gradientStops.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeGradientStop(index)}
                                        className="p-1.5 border border-gray-200 bg-white rounded text-gray-500 hover:text-red-500"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <div>
                                <label className="block text-[11px] text-gray-500 mb-1">
                                    Position: {stop.position}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={stop.position}
                                    onChange={(e) => updateGradientStop(index, 'position', Number(e.target.value))}
                                    className="w-full cursor-pointer"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">Presets</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { name: 'Sunset', stops: [{ color: '#ff6b6b', position: 0 }, { color: '#feca57', position: 100 }] },
                            { name: 'Ocean', stops: [{ color: '#1e3c72', position: 0 }, { color: '#2a5298', position: 100 }] },
                            { name: 'Purple', stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
                            { name: 'Fire', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
                            { name: 'Ice', stops: [{ color: '#74ebd5', position: 0 }, { color: '#ACB6E5', position: 100 }] },
                            { name: 'Aurora', stops: [{ color: '#00c6ff', position: 0 }, { color: '#0072ff', position: 100 }] }
                        ].map((preset) => (
                            <button
                                type="button"
                                key={preset.name}
                                onClick={() => handleContentUpdate('gradientStops', preset.stops)}
                                className="p-2 border border-gray-200 rounded-md cursor-pointer flex flex-col items-center gap-1 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div
                                    className="w-full h-6 rounded"
                                    style={{
                                        background: `linear-gradient(90deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                                    }}
                                />
                                <span className="text-[10px] text-gray-500">{preset.name}</span>
                            </button>
                        ))}
                    </div>
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
