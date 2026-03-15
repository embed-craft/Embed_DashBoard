import React, { useState } from 'react';
import { useEditorStore, StoryItem } from '@/store/useEditorStore';
import {
    MoreHorizontal,
    Plus,
    Film,
    Copy,
    Trash2,
    Edit3,
    RefreshCcw,
    GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export const StoriesStep: React.FC = () => {
    const {
        currentCampaign,
        addStory,
        deleteStory,
        updateStoryField,
        duplicateStory,
        setActiveStory,
        activeStoryId,
        updateCampaign,
        reorderStories,
        saveCampaign,
    } = useEditorStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<'title' | 'subtitle' | null>(null);
    const [editValue, setEditValue] = useState('');

    const stories = currentCampaign?.stories || [];

    const onDragStart = () => {
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        if (result.source.index === result.destination.index) return;
        
        reorderStories(result.source.index, result.destination.index);
        
        // Auto-save on reorder to ensure persistence
        try {
            await saveCampaign();
        } catch (error) {
            console.error('Failed to save story order:', error);
            toast.error('Order changed locally but failed to save to server');
        }
    };

    const handleStartEdit = (story: StoryItem, field: 'title' | 'subtitle') => {
        setEditingId(story.id);
        setEditingField(field);
        setEditValue(story[field] || '');
    };

    const handleFinishEdit = () => {
        if (editingId && editingField) {
            updateStoryField(editingId, editingField, editValue);
        }
        setEditingId(null);
        setEditingField(null);
        setEditValue('');
    };

    const handleEdit = (storyId: string) => {
        setActiveStory(storyId);
    };

    const slideCount = (story: StoryItem) => {
        // Slides are children of root Slide Container
        const root = story.layers.find(l => l.type === 'container' && !l.parent);
        if (!root) return 0;
        return story.layers.filter(l => l.parent === root.id && l.type === 'container').length;
    };

    return (
        <div style={{ padding: '40px 0', width: '90%', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                    Design
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
                    Use the visual editor to build the interfaces users will see as part of the campaign.
                </p>
            </div>

            {/* Actions Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        padding: '6px 12px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid #e5e7eb',
                    }}>
                        <RefreshCcw size={14} color="#6b7280" />
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>Loop Stories</span>
                        <Switch
                            checked={currentCampaign?.fullscreenConfig?.loopStories ?? false}
                            onCheckedChange={(val) => {
                                updateCampaign({
                                    fullscreenConfig: {
                                        ...(currentCampaign?.fullscreenConfig || {}),
                                        loopStories: val
                                    }
                                } as any);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 1fr 120px 48px',
                    padding: '12px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                }}>
                    <span />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtitle</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>No of slides</span>
                    <span />
                </div>

                {/* Table Rows */}
                <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
                    <Droppable droppableId="stories-list">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {stories.map((story, index) => (
                                    <Draggable key={story.id} draggableId={story.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    display: 'grid',
                                                    gridTemplateColumns: '40px 1fr 1fr 120px 48px',
                                                    padding: '14px 20px',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    alignItems: 'center',
                                                    transition: 'background-color 0.15s',
                                                    backgroundColor: '#fff',
                                                }}
                                                className="hover:bg-gray-50"
                                            >
                                                {/* Drag Handle */}
                                                <div {...provided.dragHandleProps} style={{ color: '#9ca3af', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <GripVertical size={16} />
                                                </div>

                                                {/* Title */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                        boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
                                                    }}>
                                                        <Film size={16} color="#fff" />
                                                    </div>
                                                    {editingId === story.id && editingField === 'title' ? (
                                                        <input
                                                            autoFocus
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onBlur={handleFinishEdit}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleFinishEdit(); if (e.key === 'Escape') { setEditingId(null); setEditingField(null); } }}
                                                            style={{
                                                                fontSize: '14px',
                                                                fontWeight: 500,
                                                                color: '#111827',
                                                                border: '1px solid #6366f1',
                                                                borderRadius: '4px',
                                                                padding: '4px 8px',
                                                                outline: 'none',
                                                                width: '200px',
                                                            }}
                                                        />
                                                    ) : (
                                                        <span
                                                            style={{ fontSize: '14px', fontWeight: 500, color: '#111827', cursor: 'text' }}
                                                            onClick={() => handleStartEdit(story, 'title')}
                                                        >
                                                            {story.title}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Subtitle */}
                                                {editingId === story.id && editingField === 'subtitle' ? (
                                                    <input
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onBlur={handleFinishEdit}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleFinishEdit(); if (e.key === 'Escape') { setEditingId(null); setEditingField(null); } }}
                                                        style={{
                                                            fontSize: '14px',
                                                            color: '#374151',
                                                            border: '1px solid #6366f1',
                                                            borderRadius: '4px',
                                                            padding: '4px 8px',
                                                            outline: 'none',
                                                            width: '200px',
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        style={{ fontSize: '14px', color: story.subtitle ? '#374151' : '#9ca3af', cursor: 'text' }}
                                                        onClick={() => handleStartEdit(story, 'subtitle')}
                                                    >
                                                        {story.subtitle || 'No Subtitle'}
                                                    </span>
                                                )}

                                                {/* Slide Count */}
                                                <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>
                                                    {slideCount(story)}
                                                </span>

                                                {/* Actions Menu */}
                                                <div onPointerDown={(e) => e.stopPropagation()}>
                                                    <Popover key={`popover-${story.id}`}>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                onPointerDown={(e) => e.stopPropagation()}
                                                                onMouseDown={(e) => e.stopPropagation()}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                }}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: '6px',
                                                                    borderRadius: '6px',
                                                                    color: '#9ca3af',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                }}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                <MoreHorizontal size={18} style={{ pointerEvents: 'none' }} />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent align="end" className="w-48 p-1 bg-white shadow-xl z-[9999] border border-gray-100">
                                                            <div className="flex flex-col">
                                                                <button
                                                                    onClick={() => handleEdit(story.id)}
                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                                                >
                                                                    <Edit3 size={14} />
                                                                    <span>Edit Story</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => duplicateStory(story.id)}
                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                                                >
                                                                    <Copy size={14} />
                                                                    <span>Duplicate</span>
                                                                </button>
                                                                <div className="my-1 border-t border-gray-100" />
                                                                <button
                                                                    onClick={() => deleteStory(story.id)}
                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    <span>Delete</span>
                                                                </button>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {/* Add Story Row */}
                <div
                    style={{
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        color: '#6366f1',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.15s',
                        borderBottomLeftRadius: '12px',
                        borderBottomRightRadius: '12px',
                    }}
                    className="hover:bg-indigo-50/50"
                    onClick={() => addStory()}
                >
                    <Plus size={16} />
                    Add Story...
                </div>
            </div>
        </div>
    );
};

export default StoriesStep;
