import React from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { Code } from 'lucide-react';

export const CustomHtmlEditor = () => {
    const { currentCampaign, selectedLayerId, updateLayer } = useEditorStore();
    const selectedLayer = currentCampaign?.layers?.find(l => l.id === selectedLayerId);

    if (!selectedLayer || selectedLayer.type !== 'custom_html') return null;

    const handleUpdate = (html: string) => {
        updateLayer(selectedLayer.id, {
            content: { ...selectedLayer.content, html }
        });
    };

    return (
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
            <h5 style={{
                margin: '0 0 12px 0',
                fontSize: '13px',
                fontWeight: 600,
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                <Code size={14} />
                Custom HTML
            </h5>

            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                    HTML Content
                </label>
                <textarea
                    value={selectedLayer.content?.html || ''}
                    onChange={(e) => handleUpdate(e.target.value)}
                    placeholder="<div>Hello World</div>"
                    style={{
                        width: '100%',
                        minHeight: '200px',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        outline: 'none',
                        resize: 'vertical'
                    }}
                />
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                Enter raw HTML. Inline styles are supported. Scripts may be restricted.
            </div>
        </div>
    );
};
