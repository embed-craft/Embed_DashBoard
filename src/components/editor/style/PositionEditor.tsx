import React from 'react';
import { LayerStyle } from '@/store/useEditorStore';
import { AlignCenter, AlignLeft, AlignRight, AlignJustify, Move, Layers } from 'lucide-react';

interface PositionEditorProps {
    style: LayerStyle;
    onChange: (updates: Partial<LayerStyle>) => void;
    colors: any;
    showZIndex?: boolean;
    showCoordinates?: boolean;
    showPositionType?: boolean;
}

export const PositionEditor: React.FC<PositionEditorProps> = ({
    style,
    onChange,
    colors,
    showZIndex = true,
    showCoordinates = true,
    showPositionType = true
}) => {
    const position = style.position || 'relative';

    const handleValueChange = (key: keyof LayerStyle, value: string) => {
        // Check if value is a number
        const numValue = Number(value);
        if (!isNaN(numValue) && value !== '') {
            onChange({ [key]: numValue });
        } else {
            onChange({ [key]: value });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Position Type */}
            {showPositionType && (
                <div>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>
                        Position
                    </label>
                    <div style={{ display: 'flex', gap: '1px', backgroundColor: colors.border.default, padding: '1px', borderRadius: '6px', overflow: 'hidden' }}>
                        {['relative', 'absolute', 'fixed', 'sticky'].map((pos) => (
                            <button
                                key={pos}
                                onClick={() => onChange({ position: pos as any })}
                                style={{
                                    flex: 1,
                                    padding: '6px 4px',
                                    border: 'none',
                                    backgroundColor: position === pos ? 'white' : colors.gray[50],
                                    color: position === pos ? colors.primary[500] : colors.text.secondary,
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Position Presets (3x3 Grid) */}
            <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>
                    Position Presets
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                        { label: 'LT', top: 0, left: 0, transform: { translateX: 0, translateY: 0 } },
                        { label: 'CT', top: 0, left: '50%', transform: { translateX: -50, translateY: 0 } },
                        { label: 'RT', top: 0, right: 0, transform: { translateX: 0, translateY: 0 } },
                        { label: 'LC', top: '50%', left: 0, transform: { translateX: 0, translateY: -50 } },
                        { label: 'CC', top: '50%', left: '50%', transform: { translateX: -50, translateY: -50 } },
                        { label: 'RC', top: '50%', right: 0, transform: { translateX: 0, translateY: -50 } },
                        { label: 'LB', bottom: 0, left: 0, transform: { translateX: 0, translateY: 0 } },
                        { label: 'CB', bottom: 0, left: '50%', transform: { translateX: -50, translateY: 0 } },
                        { label: 'RB', bottom: 0, right: 0, transform: { translateX: 0, translateY: 0 } },
                    ].map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => {
                                const updates: Partial<LayerStyle> = {
                                    position: 'absolute', // Presets force absolute positioning
                                    top: undefined,
                                    right: undefined,
                                    bottom: undefined,
                                    left: undefined,
                                    transform: {
                                        ...style.transform,
                                        translateX: preset.transform.translateX,
                                        translateY: preset.transform.translateY
                                    }
                                };

                                if ('top' in preset) updates.top = preset.top;
                                if ('right' in preset) updates.right = preset.right;
                                if ('bottom' in preset) updates.bottom = preset.bottom;
                                if ('left' in preset) updates.left = preset.left;

                                onChange(updates);
                            }}
                            style={{
                                padding: '8px',
                                border: `1px solid ${colors.border.default}`,
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                color: colors.text.secondary,
                                fontSize: '11px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary[500]}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.border.default}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Coordinates Grid */}
            {showCoordinates && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {(['top', 'right', 'bottom', 'left'] as const).map((side) => {
                        const val = style[side];
                        const valStr = val !== undefined ? String(val) : '';
                        const isPercent = valStr.includes('%');
                        const numVal = valStr.replace(/[^0-9.-]/g, '');

                        return (
                            <div key={side}>
                                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px', textTransform: 'capitalize' }}>
                                    {side}
                                </label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <input
                                        type="number"
                                        value={numVal}
                                        onChange={(e) => {
                                            const newVal = e.target.value;
                                            if (newVal === '') {
                                                onChange({ [side]: undefined });
                                            } else {
                                                onChange({ [side]: isPercent ? `${newVal}%` : Number(newVal) });
                                            }
                                        }}
                                        placeholder="auto"
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            border: `1px solid ${colors.border.default}`,
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            outline: 'none',
                                            minWidth: 0
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            if (numVal === '') return;
                                            const newUnit = isPercent ? 'px' : '%';
                                            onChange({ [side]: newUnit === '%' ? `${numVal}%` : Number(numVal) });
                                        }}
                                        style={{
                                            padding: '0 8px',
                                            border: `1px solid ${colors.border.default}`,
                                            borderRadius: '6px',
                                            backgroundColor: colors.gray[50],
                                            color: colors.text.secondary,
                                            fontSize: '10px',
                                            cursor: 'pointer',
                                            minWidth: '32px'
                                        }}
                                    >
                                        {isPercent ? '%' : 'px'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Z-Index */}
            {showZIndex && (
                <div>
                    <label style={{ fontSize: '12px', color: colors.text.secondary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={14} /> Z-Index
                    </label>
                    <input
                        type="number"
                        value={style.zIndex || 0}
                        onChange={(e) => onChange({ zIndex: Number(e.target.value) })}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: `1px solid ${colors.border.default}`,
                            borderRadius: '6px',
                            fontSize: '12px',
                            outline: 'none'
                        }}
                    />
                </div>
            )}
        </div>
    );
};
