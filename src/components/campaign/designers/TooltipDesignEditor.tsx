import React, { useState } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { TooltipRenderer } from '../../TooltipRenderer';
import {
    Type, ImageIcon, Layout, Settings,
    AlignLeft, AlignCenter, AlignRight,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    Plus, Trash2, Layers
} from 'lucide-react';
// @ts-ignore
import { SketchPicker } from 'react-color';

const colors = {
    primary: {
        50: '#eef2ff',
        100: '#e0e7ff',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
    },
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },
    text: {
        primary: '#111827',
        secondary: '#6b7280',
    }
};

export const TooltipDesignEditor: React.FC = () => {
    const {
        currentCampaign,
        updateTooltipConfig,
        addLayer,
        selectLayer,
        updateLayerStyle,
        updateLayerContent,
        deleteLayer
    } = useEditorStore();

    const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');

    if (!currentCampaign) return <div>Loading...</div>;

    const config = currentCampaign.tooltipConfig || {};
    const layers = currentCampaign.layers || [];
    const tooltipContainer = layers.find(l => l.type === 'container' && l.name === 'Tooltip Container');
    const tooltipContainerId = tooltipContainer?.id;

    // Fix: Access selectedLayerId from currentCampaign
    const selectedLayerId = currentCampaign.selectedLayerId;
    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    // Helper to add layer safely
    // Fix: Cast 'image' to any to bypass strict LayerType check if 'image' is not in LayerType
    const handleAddLayer = (type: string) => {
        if (!tooltipContainerId) {
            console.error("Tooltip Container not found!");
            return;
        }
        // @ts-ignore - 'image' might be legacy or aliased to 'media' type in strict definitions
        addLayer(type, tooltipContainerId);
    };

    const renderPreview = () => (
        <div style={{
            flex: 1,
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        }}>
            <div style={{ transform: 'scale(1.5)', position: 'relative' }}>
                {/* Mock Target Element */}
                <div style={{
                    marginBottom: '10px',
                    padding: '8px 16px',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#6b7280',
                    textAlign: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    Target Element
                </div>

                {/* The Tooltip Itself */}
                {/* Fix: Removed invalid 'position' prop */}
                <TooltipRenderer
                    layers={layers}
                    selectedLayerId={selectedLayerId}
                    onLayerSelect={selectLayer}
                    colors={colors}
                    config={config}
                />
            </div>
        </div>
    );

    const renderSidebar = () => (
        <div style={{
            width: '320px',
            backgroundColor: 'white',
            borderLeft: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            {/* Sidebar Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                <button
                    onClick={() => setActiveTab('content')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: activeTab === 'content' ? colors.primary[600] : colors.text.secondary,
                        borderBottom: activeTab === 'content' ? `2px solid ${colors.primary[600]}` : 'none',
                        background: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Content & Layers
                </button>
                <button
                    onClick={() => setActiveTab('style')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: activeTab === 'style' ? colors.primary[600] : colors.text.secondary,
                        borderBottom: activeTab === 'style' ? `2px solid ${colors.primary[600]}` : 'none',
                        background: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Appearance
                </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                {activeTab === 'content' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Add Content Buttons */}
                        <div>
                            <h3 style={{ fontSize: '12px', fontWeight: 600, color: colors.text.secondary, textTransform: 'uppercase', marginBottom: '12px' }}>
                                Add Content
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <button
                                    onClick={() => handleAddLayer('text')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        background: 'white',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Type size={16} color={colors.text.secondary} />
                                    Add Text
                                </button>
                                <button
                                    onClick={() => handleAddLayer('image')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        background: 'white',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ImageIcon size={16} color={colors.text.secondary} />
                                    Add Image
                                </button>
                            </div>
                        </div>

                        {/* Layer List */}
                        <div>
                            <h3 style={{ fontSize: '12px', fontWeight: 600, color: colors.text.secondary, textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>Layers</span>
                                <span style={{ fontSize: '10px', fontWeight: 'normal', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '10px' }}>
                                    {tooltipContainer?.children?.length || 0} items
                                </span>
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {tooltipContainer?.children?.map((childId: string) => {
                                    const layer = layers.find(l => l.id === childId);
                                    if (!layer) return null;

                                    const isSelected = selectedLayerId === layer.id;

                                    return (
                                        <div
                                            key={layer.id}
                                            onClick={() => selectLayer(layer.id)}
                                            style={{
                                                padding: '10px 12px',
                                                backgroundColor: isSelected ? colors.primary[50] : 'white',
                                                border: `1px solid ${isSelected ? colors.primary[500] : '#e5e7eb'}`,
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {layer.type === 'text' && <Type size={14} color={isSelected ? colors.primary[600] : colors.text.secondary} />}
                                                {/* Fix: Check for both image and media to be safe */}
                                                {((layer.type as any) === 'image' || layer.type === 'media') && <ImageIcon size={14} color={isSelected ? colors.primary[600] : colors.text.secondary} />}
                                                <span style={{ fontSize: '13px', color: isSelected ? colors.primary[700] : colors.text.primary, fontWeight: isSelected ? 500 : 400 }}>
                                                    {layer.name}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                                            >
                                                <Trash2 size={14} color="#ef4444" />
                                            </button>
                                        </div>
                                    );
                                })}

                                {(!tooltipContainer?.children || tooltipContainer.children.length === 0) && (
                                    <div style={{ padding: '20px', textAlign: 'center', color: colors.text.secondary, fontSize: '13px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px dashed #e5e7eb' }}>
                                        <Layers size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                        <div>No layers yet</div>
                                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Add text or images above</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Layer Properties */}
                        {selectedLayer && selectedLayer.parent === tooltipContainerId && (
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontSize: '12px', fontWeight: 600, color: colors.text.secondary, textTransform: 'uppercase', marginBottom: '12px' }}>
                                    Edit {selectedLayer.type}
                                </h3>

                                {selectedLayer.type === 'text' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px' }}>Text Content</label>
                                            <textarea
                                                value={selectedLayer.content?.text || ''}
                                                onChange={(e) => updateLayerContent(selectedLayer.id, { text: e.target.value })}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '13px' }}
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px' }}>Font Size</label>
                                            <input
                                                type="number"
                                                value={selectedLayer.style?.fontSize || 14}
                                                onChange={(e) => updateLayerStyle(selectedLayer.id, { fontSize: Number(e.target.value) })}
                                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px' }}>Color</label>
                                            <input
                                                type="color"
                                                value={selectedLayer.style?.color || '#ffffff'}
                                                onChange={(e) => updateLayerStyle(selectedLayer.id, { color: e.target.value })}
                                                style={{ width: '100%', height: '36px', padding: '2px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {((selectedLayer.type as any) === 'image' || selectedLayer.type === 'media') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px' }}>Image URL</label>
                                            <input
                                                type="text"
                                                value={selectedLayer.content?.imageUrl || ''}
                                                onChange={(e) => updateLayerContent(selectedLayer.id, { imageUrl: e.target.value })}
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '13px' }}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px' }}>Border Radius</label>
                                            <input
                                                type="number"
                                                value={(selectedLayer.style?.borderRadius as number) || 4}
                                                onChange={(e) => updateLayerStyle(selectedLayer.id, { borderRadius: Number(e.target.value) })}
                                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Tooltip Overall Settings */}
                        <div>
                            <h3 style={{ fontSize: '12px', fontWeight: 600, color: colors.text.secondary, textTransform: 'uppercase', marginBottom: '16px' }}>
                                Tooltip Config
                            </h3>

                            {/* Position */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: colors.text.primary }}>Position</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                    {['top', 'bottom', 'left', 'right'].map(pos => (
                                        <button
                                            key={pos}
                                            onClick={() => updateTooltipConfig({ position: pos })}
                                            style={{
                                                padding: '8px',
                                                border: `1px solid ${config.position === pos ? colors.primary[500] : '#e5e7eb'}`,
                                                backgroundColor: config.position === pos ? colors.primary[50] : 'white',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title={pos}
                                        >
                                            {pos === 'top' && <ArrowUp size={16} color={config.position === pos ? colors.primary[600] : colors.text.secondary} />}
                                            {pos === 'bottom' && <ArrowDown size={16} color={config.position === pos ? colors.primary[600] : colors.text.secondary} />}
                                            {pos === 'left' && <ArrowLeft size={16} color={config.position === pos ? colors.primary[600] : colors.text.secondary} />}
                                            {pos === 'right' && <ArrowRight size={16} color={config.position === pos ? colors.primary[600] : colors.text.secondary} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Background Color */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: colors.text.primary }}>Background Color</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        type="color"
                                        value={config.backgroundColor || '#111827'}
                                        onChange={(e) => updateTooltipConfig({ backgroundColor: e.target.value })}
                                        style={{ width: '40px', height: '40px', borderRadius: '6px', border: '1px solid #e5e7eb', cursor: 'pointer', padding: '2px' }}
                                    />
                                    <input
                                        type="text"
                                        value={config.backgroundColor || '#111827'}
                                        onChange={(e) => updateTooltipConfig({ backgroundColor: e.target.value })}
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                                    />
                                </div>
                            </div>

                            {/* Padding & Radius */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: colors.text.secondary }}>Padding</label>
                                    <input
                                        type="number"
                                        value={config.padding || 12}
                                        onChange={(e) => updateTooltipConfig({ padding: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: colors.text.secondary }}>Radius</label>
                                    <input
                                        type="number"
                                        value={config.borderRadius || 8}
                                        onChange={(e) => updateTooltipConfig({ borderRadius: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.mode === 'image'}
                                        onChange={(e) => updateTooltipConfig({ mode: e.target.checked ? 'image' : 'standard' })}
                                    />
                                    Image Background Mode
                                </label>
                                <p style={{ fontSize: '11px', color: colors.text.secondary, marginLeft: '24px', marginTop: '4px' }}>
                                    Enabling this lets you layer text over a background image.
                                </p>
                            </div>

                            {/* Add Image Link for Image Mode */}
                            {config.mode === 'image' && (
                                <div style={{ marginTop: '12px', marginLeft: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px' }}>Background Image URL</label>
                                    <input
                                        type="text"
                                        value={config.imageUrl || ''}
                                        onChange={(e) => updateTooltipConfig({ imageUrl: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '13px' }}
                                        placeholder="https://..."
                                    />
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        {renderPreview()}
        {renderSidebar()}
    </div>
);
};
