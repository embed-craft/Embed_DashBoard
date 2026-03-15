import React, { useState } from 'react';
import { useEditorStore, StoryItem } from '@/store/useEditorStore';
import { Plus, MoreHorizontal, Edit3, Trash2, Copy, Film, MessageSquare, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
    } = useEditorStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<'title' | 'subtitle' | null>(null);
    const [editValue, setEditValue] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const stories = currentCampaign?.stories || [];

    const handleStartEdit = (story: StoryItem, field: 'title' | 'subtitle') => {
        setEditingId(story.id);
        setEditingField(field);
        setEditValue(story[field] || '');
        setOpenMenuId(null);
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
        setOpenMenuId(null);
    };

    const slideCount = (story: StoryItem) => {
        // Slides are children of root Slide Container
        const root = story.layers.find(l => l.type === 'container' && !l.parent);
        if (!root) return 0;
        return story.layers.filter(l => l.parent === root.id && l.type === 'container').length;
    };

    return (
        <div style={{ padding: '40px 60px', maxWidth: '1000px' }}>
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
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff' }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 120px 48px',
                    padding: '12px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtitle</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>No of slides</span>
                    <span />
                </div>

                {/* Table Rows */}
                {stories.map((story) => (
                    <div
                        key={story.id}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 120px 48px',
                            padding: '14px 20px',
                            borderBottom: '1px solid #f3f4f6',
                            alignItems: 'center',
                            transition: 'background-color 0.15s',
                        }}
                        className="hover:bg-gray-50"
                    >
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
                            }}>
                                <MessageSquare size={16} color="#fff" />
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
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === story.id ? null : story.id);
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
                                <MoreHorizontal size={18} />
                            </button>

                            {openMenuId === story.id && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '100%',
                                        zIndex: 50,
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        minWidth: '160px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <button
                                        onClick={() => handleEdit(story.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            padding: '10px 14px',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            color: '#374151',
                                            textAlign: 'left',
                                        }}
                                        className="hover:bg-gray-50"
                                    >
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => { duplicateStory(story.id); setOpenMenuId(null); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            padding: '10px 14px',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            color: '#374151',
                                            textAlign: 'left',
                                        }}
                                        className="hover:bg-gray-50"
                                    >
                                        <Copy size={14} /> Duplicate
                                    </button>
                                    <button
                                        onClick={() => { deleteStory(story.id); setOpenMenuId(null); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            padding: '10px 14px',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            color: '#EF4444',
                                            textAlign: 'left',
                                        }}
                                        className="hover:bg-red-50"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

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
