import React, { useState, useEffect, useRef } from 'react';
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
    GripVertical,
    Edit2,
    MoreVertical,
    Copy
} from 'lucide-react';
import { theme } from '../../styles/design-tokens';

interface InterfacesListProps {
    mainCampaignName: string;
    mainCampaignType: string;
    interfaces: CampaignInterface[];
    activeInterfaceId: string | null;
    onSelectInterface: (id: string | null) => void;
    onAddInterface: () => void;
    onDeleteInterface: (id: string) => void;
    onRenameInterface: (id: string, newName: string) => void;
    onReorderInterface: (startIndex: number, endIndex: number) => void;
    onDuplicateInterface: (id: string) => void;
}

const NUDGE_TYPE_ICONS: Record<string, React.ReactNode> = {
    modal: <Maximize2 size={14} />,
    bottomsheet: <PanelBottom size={14} />,
    tooltip: <MessageCircle size={14} />,
    pip: <PictureInPicture2 size={14} />,
    scratchcard: <Gift size={14} />,
    banner: <LayoutPanelTop size={14} />,
};

export const InterfacesList: React.FC<InterfacesListProps> = ({
    mainCampaignName,
    mainCampaignType,
    interfaces,
    activeInterfaceId,
    onSelectInterface,
    onAddInterface,
    onDeleteInterface,
    onRenameInterface,
    onReorderInterface,
    onDuplicateInterface
}) => {

    const isMainCampaignActive = activeInterfaceId === null;

    // Renaming State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    // DnD State
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
    const contextMenuRef = useRef<HTMLDivElement>(null);

    // Close context menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setContextMenu(null);
            }
        };

        if (contextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [contextMenu]);


    // -- Renaming Handlers --
    const startEditing = (id: string, name: string) => {
        setContextMenu(null); // Close context menu if open
        setEditingId(id);
        setEditingName(name);
    };

    const saveRename = (id: string) => {
        if (editingName.trim() && editingName !== interfaces.find(i => i.id === id)?.name) {
            onRenameInterface(id, editingName.trim());
        }
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation(); // Stop propagation to prevent form submission or other handlers
            saveRename(id);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            setEditingId(null);
        }
    };

    // -- DnD Handlers --
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: Set drag image
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (draggedId === id) return;

        setDragOverId(id);

        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        setDropPosition(e.clientY < midY ? 'before' : 'after');
    };

    const handleDragLeave = () => {
        setDragOverId(null);
        setDropPosition(null);
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        setDragOverId(null);
        setDropPosition(null);

        if (!draggedId || draggedId === targetId) return;

        const oldIndex = interfaces.findIndex(i => i.id === draggedId);
        const targetIndex = interfaces.findIndex(i => i.id === targetId);

        if (oldIndex === -1 || targetIndex === -1) return;

        let newIndex = targetIndex;
        if (dropPosition === 'after') {
            newIndex = targetIndex + 1;
        }

        // Adjust index if moving downwards
        if (oldIndex < newIndex) {
            newIndex -= 1;
        }

        onReorderInterface(oldIndex, newIndex);
    };

    // -- Context Menu Handler --
    const handleContextMenu = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ id, x: e.clientX, y: e.clientY });
    };

    return (
        <div style={{ marginBottom: theme.spacing[4], position: 'relative' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: theme.spacing[2],
                padding: `0 ${theme.spacing[1]}`,
            }}>
                <h4 style={{
                    margin: 0,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.secondary,
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
                        gap: theme.spacing[1],
                        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                        background: theme.colors.background.active,
                        border: 'none',
                        borderRadius: theme.borderRadius.md,
                        fontSize: '11px',
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.primary[600],
                        cursor: 'pointer',
                        transition: `all ${theme.transitions.duration.fast}`,
                    }}
                    title="Add Interface"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.primary[100]}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.background.active}
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
            }}>
                {/* Main Campaign */}
                <div
                    onClick={() => onSelectInterface(null)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2],
                        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                        borderRadius: theme.borderRadius.md,
                        cursor: 'pointer',
                        background: isMainCampaignActive ? theme.colors.background.active : 'transparent',
                        boxShadow: isMainCampaignActive ? theme.shadows.sm : 'none',
                        transition: `all ${theme.transitions.duration.fast}`,
                        position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                        if (!isMainCampaignActive) e.currentTarget.style.backgroundColor = theme.colors.background.hover;
                    }}
                    onMouseLeave={(e) => {
                        if (!isMainCampaignActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    {isMainCampaignActive && (
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '3px',
                            height: '16px',
                            backgroundColor: theme.colors.purple[500],
                            borderRadius: '0 4px 4px 0'
                        }} />
                    )}

                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: theme.borderRadius.md,
                        background: isMainCampaignActive ? theme.colors.purple[100] : theme.colors.gray[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isMainCampaignActive ? theme.colors.purple[600] : theme.colors.gray[500]
                    }}>
                        {NUDGE_TYPE_ICONS[mainCampaignType] || NUDGE_TYPE_ICONS.modal}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: isMainCampaignActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
                            color: isMainCampaignActive ? theme.colors.text.primary : theme.colors.text.secondary,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {mainCampaignName || 'Main Campaign'}
                        </div>
                    </div>
                    {/* Primary Badge */}
                    <span style={{
                        padding: '2px 6px',
                        background: theme.colors.purple[50],
                        color: theme.colors.purple[600],
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: `1px solid ${theme.colors.purple[100]}`
                    }}>
                        Primary
                    </span>
                </div>

                {/* Interfaces Divider */}
                {interfaces.length > 0 && <div style={{ height: '4px' }} />}

                {/* Interfaces */}
                {interfaces.map((iface) => {
                    const isActive = activeInterfaceId === iface.id;
                    const isEditing = editingId === iface.id;
                    const isDragging = draggedId === iface.id;
                    const isDraggedOver = dragOverId === iface.id;

                    return (
                        <div
                            key={iface.id}
                            draggable={!isEditing}
                            onDragStart={(e) => handleDragStart(e, iface.id)}
                            onDragOver={(e) => handleDragOver(e, iface.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, iface.id)}
                            onClick={() => onSelectInterface(iface.id)}
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                startEditing(iface.id, iface.name);
                            }}
                            onContextMenu={(e) => handleContextMenu(e, iface.id)}
                            className="group"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: theme.spacing[2],
                                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                                borderRadius: theme.borderRadius.md,
                                cursor: 'pointer',
                                background: isActive ? theme.colors.background.active : 'transparent',
                                boxShadow: isActive ? theme.shadows.sm : 'none',
                                transition: `all ${theme.transitions.duration.fast}`,
                                position: 'relative',
                                opacity: isDragging ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = theme.colors.background.hover;
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            {/* Drop Indicators */}
                            {isDraggedOver && dropPosition === 'before' && (
                                <div style={{
                                    position: 'absolute', top: -2, left: 0, right: 0, height: 2,
                                    backgroundColor: theme.colors.primary[500], zIndex: 10
                                }} />
                            )}
                            {isDraggedOver && dropPosition === 'after' && (
                                <div style={{
                                    position: 'absolute', bottom: -2, left: 0, right: 0, height: 2,
                                    backgroundColor: theme.colors.primary[500], zIndex: 10
                                }} />
                            )}

                            {/* Active Indicator Bar */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '3px',
                                    height: '16px',
                                    backgroundColor: theme.colors.primary[600],
                                    borderRadius: '0 4px 4px 0'
                                }} />
                            )}

                            {/* Drag Handle (Visible on hover) */}
                            <div
                                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-gray-400"
                                style={{ marginLeft: '-4px' }}
                            >
                                <GripVertical size={12} />
                            </div>

                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: theme.borderRadius.md,
                                background: isActive ? theme.colors.primary[100] : theme.colors.gray[100],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isActive ? theme.colors.primary[600] : theme.colors.gray[500]
                            }}>
                                {NUDGE_TYPE_ICONS[iface.nudgeType] || NUDGE_TYPE_ICONS.modal}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onBlur={() => saveRename(iface.id)}
                                        onKeyDown={(e) => handleKeyDown(e, iface.id)}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            width: '100%',
                                            padding: '2px 4px',
                                            fontSize: theme.typography.fontSize.sm,
                                            border: `1px solid ${theme.colors.primary[500]}`,
                                            borderRadius: theme.borderRadius.sm,
                                            outline: 'none',
                                            backgroundColor: 'white',
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        fontSize: theme.typography.fontSize.sm,
                                        fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
                                        color: isActive ? theme.colors.text.primary : theme.colors.text.secondary,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        {iface.name}
                                    </div>
                                )}
                            </div>

                            {/* Removed Trash Icon - using Context Menu instead */}
                        </div>
                    );
                })}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    style={{
                        position: 'fixed',
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: 'white',
                        border: `1px solid ${theme.colors.gray[200]}`,
                        borderRadius: theme.borderRadius.md,
                        boxShadow: theme.shadows.md,
                        zIndex: 1000,
                        minWidth: '120px',
                        padding: '4px 0',
                    }}
                >
                    <button
                        onClick={() => {
                            const iface = interfaces.find(i => i.id === contextMenu.id);
                            if (iface) startEditing(iface.id, iface.name);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.text.primary,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[50]}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Edit2 size={14} /> Rename
                    </button>
                    <button
                        onClick={() => {
                            onDuplicateInterface(contextMenu.id);
                            setContextMenu(null);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.text.primary,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[50]}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Copy size={14} /> Duplicate
                    </button>
                    <button
                        onClick={() => {
                            onDeleteInterface(contextMenu.id);
                            setContextMenu(null);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.red[600],
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.red[50]}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default InterfacesList;
