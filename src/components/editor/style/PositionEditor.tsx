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

            {/* Position Presets Removed as per user request */}

            {/* Coordinates X/Y */}
            {showCoordinates && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                    {/* X Coordinate (Left) */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                            X Coordinate
                        </label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <input
                                type="number"
                                value={style.left !== undefined ? String(style.left).replace(/[^0-9.-]/g, '') : ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const isPercent = String(style.left).includes('%');
                                    onChange({ left: val === '' ? undefined : (isPercent ? `${val}%` : Number(val)) });
                                }}
                                placeholder="0"
                                style={{
                                    flex: 1, padding: '8px', border: `1px solid ${colors.border.default}`,
                                    borderRadius: '6px', fontSize: '12px', outline: 'none', minWidth: 0
                                }}
                            />
                            <button
                                onClick={() => {
                                    const currentNum = String(style.left || '').replace(/[^0-9.-]/g, '');
                                    if (!currentNum) return;
                                    const isPercent = String(style.left).includes('%');
                                    onChange({ left: isPercent ? Number(currentNum) : `${currentNum}%` });
                                }}
                                style={{
                                    padding: '0 8px', border: `1px solid ${colors.border.default}`, borderRadius: '6px',
                                    backgroundColor: colors.gray[50], color: colors.text.secondary, fontSize: '10px',
                                    cursor: 'pointer', minWidth: '32px'
                                }}
                            >
                                {String(style.left).includes('%') ? '%' : 'px'}
                            </button>
                        </div>
                    </div>

                    {/* Y Coordinate (Top) */}
                    <div>
                        <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                            Y Coordinate
                        </label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <input
                                type="number"
                                value={style.top !== undefined ? String(style.top).replace(/[^0-9.-]/g, '') : ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const isPercent = String(style.top).includes('%');
                                    onChange({ top: val === '' ? undefined : (isPercent ? `${val}%` : Number(val)) });
                                }}
                                placeholder="0"
                                style={{
                                    flex: 1, padding: '8px', border: `1px solid ${colors.border.default}`,
                                    borderRadius: '6px', fontSize: '12px', outline: 'none', minWidth: 0
                                }}
                            />
                            <button
                                onClick={() => {
                                    const currentNum = String(style.top || '').replace(/[^0-9.-]/g, '');
                                    if (!currentNum) return;
                                    const isPercent = String(style.top).includes('%');
                                    onChange({ top: isPercent ? Number(currentNum) : `${currentNum}%` });
                                }}
                                style={{
                                    padding: '0 8px', border: `1px solid ${colors.border.default}`, borderRadius: '6px',
                                    backgroundColor: colors.gray[50], color: colors.text.secondary, fontSize: '10px',
                                    cursor: 'pointer', minWidth: '32px'
                                }}
                            >
                                {String(style.top).includes('%') ? '%' : 'px'}
                            </button>
                        </div>
                    </div>
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
