import React from 'react';
import { LayerStyle } from '@/store/useEditorStore';

interface PaddingEditorProps {
    style: LayerStyle;
    onChange: (updates: Partial<LayerStyle>) => void;
    colors?: any;
}

export const PaddingEditor: React.FC<PaddingEditorProps> = ({
    style,
    onChange,
    colors = { border: { default: '#e5e7eb' }, text: { secondary: '#6b7280' } }
}) => {
    // Helper to get padding value for a side (handles number or object structure)
    const getPadding = (side: 'top' | 'right' | 'bottom' | 'left') => {
        const p = style.padding;
        if (typeof p === 'number') return p;
        if (typeof p === 'object' && p !== null) return p[side] ?? 0;
        return 0; // default
    };

    const updatePadding = (side: 'top' | 'right' | 'bottom' | 'left', val: number) => {
        const current = style.padding;
        let newPadding: any = {};
        
        if (typeof current === 'number') {
            // Expand single number to object
            newPadding = { top: current, right: current, bottom: current, left: current };
        } else if (typeof current === 'object' && current !== null) {
            newPadding = { ...current };
        } else {
             newPadding = { top: 0, right: 0, bottom: 0, left: 0 };
        }
        
        newPadding[side] = val;
        onChange({ padding: newPadding });
    };

    return (
        <div className="mb-4">
             <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                Padding
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['top', 'right', 'bottom', 'left'].map(side => (
                    <div key={side}>
                        <label style={{ display: 'block', fontSize: '10px', color: colors.text.secondary, marginBottom: '2px', textTransform: 'capitalize' }}>
                            {side}
                        </label>
                        <input
                            type="number"
                            value={getPadding(side as any)}
                            onChange={(e) => updatePadding(side as any, Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '6px',
                                border: `1px solid ${colors.border.default}`,
                                borderRadius: '4px',
                                fontSize: '12px',
                                outline: 'none'
                             }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
