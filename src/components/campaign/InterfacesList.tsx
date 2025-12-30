import React from 'react';
import { CampaignInterface } from '@/store/useEditorStore';
import {
    Maximize2,
    PanelBottom,
    MessageCircle,
    PictureInPicture2,
    Gift,
    LayoutPanelTop,
    Plus,
    Trash2,
    ChevronRight
} from 'lucide-react';

interface InterfacesListProps {
    mainCampaignName: string;
    mainCampaignType: string;
    interfaces: CampaignInterface[];
    activeInterfaceId: string | null;
    onSelectInterface: (id: string | null) => void;
    onAddInterface: () => void;
    onDeleteInterface: (id: string) => void;
}

const NUDGE_TYPE_ICONS: Record<string, React.ReactNode> = {
    modal: <Maximize2 size={14} />,
    bottomsheet: <PanelBottom size={14} />,
    tooltip: <MessageCircle size={14} />,
    pip: <PictureInPicture2 size={14} />,
    scratchcard: <Gift size={14} />,
    banner: <LayoutPanelTop size={14} />,
};

const colors = {
    primary: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5' },
    gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 400: '#9ca3af', 500: '#6b7280' },
    text: { primary: '#111827', secondary: '#6b7280' },
    purple: { 50: '#faf5ff', 500: '#a855f7', 600: '#9333ea' },
};

export const InterfacesList: React.FC<InterfacesListProps> = ({
    mainCampaignName,
    mainCampaignType,
    interfaces,
    activeInterfaceId,
    onSelectInterface,
    onAddInterface,
    onDeleteInterface,
}) => {
    const isMainCampaignActive = activeInterfaceId === null;

    return (
        <div style={{ marginBottom: '16px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                padding: '0 4px',
            }}>
                <h4 style={{
                    margin: 0,
                    fontSize: '12px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    Interfaces
                </h4>
                <button
                    onClick={onAddInterface}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        background: colors.primary[50],
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: colors.primary[600],
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    title="Add Interface"
                >
                    <Plus size={12} />
                    Add
                </button>
            </div>

            {/* Interface List */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                background: colors.gray[50],
                borderRadius: '8px',
                padding: '4px',
            }}>
                {/* Main Campaign */}
                <div
                    onClick={() => onSelectInterface(null)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: isMainCampaignActive ? 'white' : 'transparent',
                        borderLeft: isMainCampaignActive ? `3px solid ${colors.purple[500]}` : '3px solid transparent',
                        boxShadow: isMainCampaignActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s',
                    }}
                >
                    <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isMainCampaignActive ? colors.purple[500] : colors.gray[400],
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: isMainCampaignActive ? colors.text.primary : colors.text.secondary,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {mainCampaignName || 'Main Campaign'}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            color: colors.gray[500],
                        }}>
                            {NUDGE_TYPE_ICONS[mainCampaignType] || NUDGE_TYPE_ICONS.modal}
                            <span style={{ textTransform: 'capitalize' }}>{mainCampaignType}</span>
                        </div>
                    </div>
                    <span style={{
                        padding: '2px 6px',
                        background: colors.purple[50],
                        color: colors.purple[600],
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '4px',
                    }}>
                        Primary
                    </span>
                    <ChevronRight size={14} color={colors.gray[400]} />
                </div>

                {/* Interfaces */}
                {interfaces.map((iface) => {
                    const isActive = activeInterfaceId === iface.id;
                    return (
                        <div
                            key={iface.id}
                            onClick={() => onSelectInterface(iface.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: isActive ? 'white' : 'transparent',
                                borderLeft: isActive ? `3px solid ${colors.primary[500]}` : '3px solid transparent',
                                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                transition: 'all 0.15s',
                            }}
                        >
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: isActive ? colors.primary[500] : colors.gray[400],
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: isActive ? colors.text.primary : colors.text.secondary,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {iface.name}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '11px',
                                    color: colors.gray[500],
                                }}>
                                    {NUDGE_TYPE_ICONS[iface.nudgeType] || NUDGE_TYPE_ICONS.modal}
                                    <span style={{ textTransform: 'capitalize' }}>{iface.nudgeType}</span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete "${iface.name}" interface?`)) {
                                        onDeleteInterface(iface.id);
                                    }
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    opacity: 0.5,
                                    transition: 'opacity 0.15s',
                                }}
                                title="Delete interface"
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                            >
                                <Trash2 size={14} color={colors.gray[500]} />
                            </button>
                            <ChevronRight size={14} color={colors.gray[400]} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InterfacesList;
