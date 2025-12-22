import React, { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import Editor from '@monaco-editor/react';
import { Code, LayoutTemplate, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommonStyleControls } from '../shared/CommonStyleControls';
import { SizeControls } from '../shared/SizeControls'; // Assuming utils exist, or I can inline styles

export const CustomHtmlEditor = () => {
    const { currentCampaign, updateLayer } = useEditorStore();
    const selectedLayerId = currentCampaign?.selectedLayerId;
    const selectedLayer = currentCampaign?.layers?.find(l => l.id === selectedLayerId);

    if (!selectedLayer || selectedLayer.type !== 'custom_html') return null;

    // Determine current mode based on size
    const isFullPage = selectedLayer.size.width === '100%' && selectedLayer.size.height === '100%';
    const [mode, setMode] = useState<'hybrid' | 'full_page'>(isFullPage ? 'full_page' : 'hybrid');

    const handleUpdate = (value: string | undefined) => {
        updateLayer(selectedLayer.id, {
            content: { ...selectedLayer.content, html: value || '' }
        });
    };

    const handleModeChange = (newMode: 'hybrid' | 'full_page') => {
        setMode(newMode);
        if (newMode === 'full_page') {
            updateLayer(selectedLayer.id, {
                size: { width: '100%', height: '100%' },
                position: { x: 0, y: 0, type: 'absolute' },
                style: { ...selectedLayer.style, position: 'absolute' },
                content: { ...selectedLayer.content, fullPageMode: true } // EXPLICIT Flag
            });
        } else {
            // Revert to a sensible default for Hybrid
            updateLayer(selectedLayer.id, {
                size: { width: 300, height: 200 }, // Default box size
                position: { x: 20, y: 20, type: 'relative' }, // Approximate default
                style: { ...selectedLayer.style, position: 'relative' },
                content: { ...selectedLayer.content, fullPageMode: false } // Disable Flag
            });
        }
    };

    // Helper for style updates compatible with CommonStyleControls
    const onStyleUpdate = (key: string, value: any) => {
        updateLayer(selectedLayer.id, {
            style: { ...selectedLayer.style, [key]: value }
        });
    };

    const colors = {
        gray: { 50: '#f9fafb', 200: '#e5e7eb' }, // Added gray[50] for PositionEditor
        text: { primary: '#111827', secondary: '#6b7280' },
        primary: { 50: '#eef2ff', 500: '#6366f1' },
        border: { default: '#e5e7eb' } // FIXED: Added missing border.default
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Code size={16} />
                        Coding Panel
                    </h5>
                </div>

                {/* Mode Toggle */}
                <div style={{ display: 'flex', backgroundColor: '#e5e7eb', padding: '2px', borderRadius: '6px' }}>
                    <button
                        onClick={() => handleModeChange('hybrid')}
                        style={{
                            flex: 1,
                            padding: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: mode === 'hybrid' ? '#fff' : 'transparent',
                            color: mode === 'hybrid' ? '#111827' : '#6b7280',
                            boxShadow: mode === 'hybrid' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Layers size={14} />
                        Hybrid
                    </button>
                    <button
                        onClick={() => handleModeChange('full_page')}
                        style={{
                            flex: 1,
                            padding: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: mode === 'full_page' ? '#fff' : 'transparent',
                            color: mode === 'full_page' ? '#111827' : '#6b7280',
                            boxShadow: mode === 'full_page' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LayoutTemplate size={14} />
                        Full Page
                    </button>
                </div>
                {mode === 'full_page' && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#059669', padding: '6px', backgroundColor: '#ecfdf5', borderRadius: '4px' }}>
                        ✅ Layer forced to full width/height. Background made transparent.
                    </div>
                )}
            </div>

            {/* Hybrid Mode Controls: Position & Size */}
            {mode === 'hybrid' && (
                <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                    <SizeControls
                        layer={selectedLayer}
                        selectedLayerId={selectedLayer.id}
                        updateLayer={updateLayer}
                        onStyleUpdate={onStyleUpdate}
                        colors={colors}
                    />
                    <CommonStyleControls
                        layer={selectedLayer}
                        selectedLayerId={selectedLayer.id}
                        updateLayer={updateLayer}
                        onStyleUpdate={onStyleUpdate}
                        handleTooltipUpdate={() => { }} // No tooltip support for custom html yet
                        colors={colors}
                        showPosition={true}
                    />
                </div>
            )}

            {/* Editor Area */}
            <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
                <Editor
                    height="100%"
                    defaultLanguage="html"
                    theme="light"
                    value={selectedLayer.content?.html || ''}
                    onChange={handleUpdate}
                    options={{
                        minimap: { enabled: false },
                        padding: { top: 16 },
                        wordWrap: 'on',
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2
                    }}
                />
            </div>
            <div style={{ padding: '8px 12px', fontSize: '11px', color: '#6b7280', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between' }}>
                <span>Shadow DOM: Active</span>
                <span>{mode === 'full_page' ? 'Canvas Override: On' : 'Standard Component'}</span>
            </div>
        </div>
    );
};
