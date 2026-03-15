import React, { useState, useMemo } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import { DesignStep } from '@/components/campaign/steps/DesignStep';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * StoryEditorWrapper wraps DesignStep with:
 * - Back button (← arrow) to return to story list
 * - Story name in the header (editable)
 * - Slide timeline bar at the bottom (Instagram-style)
 */
export const StoryEditorWrapper: React.FC = () => {
    const {
        currentCampaign,
        activeStoryId,
        setActiveStory,
        updateStoryField,
        updateCampaign,
        selectLayer,
    } = useEditorStore();

    const selectedLayerId = currentCampaign?.selectedLayerId || null;

    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');

    const activeStory = currentCampaign?.stories?.find(s => s.id === activeStoryId);
    if (!activeStory) return null;

    // Find root Slide Container and its slide children
    const rootContainer = activeStory.layers.find(l => l.type === 'container' && !l.parent);
    const slides = useMemo(() => {
        if (!rootContainer) return [];
        return activeStory.layers.filter(l => l.parent === rootContainer.id && l.type === 'container');
    }, [activeStory.layers, rootContainer?.id]);

    // Determine which slide is active (based on selectedLayerId)
    const activeSlideId = useMemo(() => {
        if (!selectedLayerId || !rootContainer) return slides[0]?.id || null;
        // If a slide itself is selected
        const isSlide = slides.find(s => s.id === selectedLayerId);
        if (isSlide) return isSlide.id;
        // If a child of a slide is selected, find which slide it belongs to
        const parentSlide = slides.find(s => {
            const isChild = activeStory.layers.some(
                l => l.id === selectedLayerId && l.parent === s.id
            );
            return isChild;
        });
        if (parentSlide) return parentSlide.id;
        // If Slide Container root is selected, show first slide
        if (selectedLayerId === rootContainer.id) return slides[0]?.id || null;
        return slides[0]?.id || null;
    }, [selectedLayerId, slides, activeStory.layers, rootContainer?.id]);

    const handleBack = () => {
        setActiveStory(null);
    };

    const handleNameEditStart = () => {
        setEditName(activeStory.title);
        setIsEditingName(true);
    };

    const handleNameEditFinish = () => {
        if (editName.trim()) {
            updateStoryField(activeStory.id, 'title', editName.trim());
        }
        setIsEditingName(false);
    };

    const handleAddSlide = () => {
        if (!rootContainer || !currentCampaign?.stories) return;

        const slideNumber = slides.length + 1;
        const newSlideId = `layer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const newSlide = {
            id: newSlideId,
            type: 'container' as const,
            name: `Slide ${slideNumber}`,
            parent: rootContainer.id,
            children: [] as string[],
            visible: true,
            locked: false,
            zIndex: slideNumber,
            position: { x: 0, y: 0 },
            size: { width: '100%' as any, height: '100%' as any },
            content: {
                width: 393,
                height: 852,
            } as any,
            style: {
                backgroundColor: '#e5e7eb',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            } as any,
        };

        // Update story: add new slide layer + update root container's children array
        const updatedStories = currentCampaign.stories.map(s => {
            if (s.id !== activeStoryId) return s;
            return {
                ...s,
                layers: [
                    ...s.layers.map(l => {
                        if (l.id !== rootContainer.id) return l;
                        return { ...l, children: [...l.children, newSlideId] };
                    }),
                    newSlide,
                ],
                updatedAt: new Date().toISOString(),
            };
        });

        updateCampaign({ stories: updatedStories, isDirty: true } as any);
        // Select the new slide
        setTimeout(() => selectLayer(newSlideId), 50);
        toast.success(`Slide ${slideNumber} added`);
    };

    const handleSlideClick = (slideId: string) => {
        selectLayer(slideId);
    };

    const activeSlideIndex = slides.findIndex(s => s.id === activeSlideId);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* ===== Top Header Bar: ← Back + Story Name ===== */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                height: '48px',
                flexShrink: 0,
            }}>
                <button
                    onClick={handleBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#374151',
                    }}
                    className="hover:bg-gray-200"
                    title="Back to story list"
                >
                    <ArrowLeft size={18} />
                </button>

                {/* Story Name + Add Story */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                    </div>

                    {isEditingName ? (
                        <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleNameEditFinish}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleNameEditFinish();
                                if (e.key === 'Escape') setIsEditingName(false);
                            }}
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#111827',
                                border: '1px solid #6366f1',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                outline: 'none',
                                width: '160px',
                            }}
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                                onClick={handleNameEditStart}
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: '#111827',
                                    cursor: 'pointer',
                                }}
                            >
                                {activeStory.title}
                            </span>
                            <Check size={14} color="#22c55e" />
                        </div>
                    )}

                    {/* Add Story Button (Header) */}
                    <div style={{ width: '1px', height: '16px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                    <button
                        onClick={() => {
                            const { addStory, setActiveStory } = useEditorStore.getState();
                            const newId = addStory(`Story ${(currentCampaign?.stories?.length || 0) + 1}`);
                            setActiveStory(newId);
                            toast.success('New story created');
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                            cursor: 'pointer',
                            color: '#6b7280',
                            transition: 'all 0.2s',
                        }}
                        className="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                        title="Add New Story"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* Slide indicator in header */}
                <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>
                    Slide {activeSlideIndex + 1} of {slides.length}
                </div>
            </div>

            {/* ===== Main Editor Area ===== */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <DesignStep />
            </div>

            {/* ===== Bottom Slide Timeline Bar ===== */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderTop: '2px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                height: '56px',
                flexShrink: 0,
            }}>
                {/* Slide Thumbnails */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflowX: 'auto' }}>
                    {slides.map((slide, index) => {
                        const isActive = slide.id === activeSlideId;
                        return (
                            <button
                                key={slide.id}
                                onClick={() => handleSlideClick(slide.id)}
                                style={{
                                    minWidth: '44px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    border: isActive ? '2px solid #6366f1' : '2px solid #d1d5db',
                                    backgroundColor: isActive ? '#EEF2FF' : '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: isActive ? '#6366f1' : '#374151',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    flexShrink: 0,
                                    boxShadow: isActive ? '0 0 0 2px rgba(99,102,241,0.2)' : 'none',
                                }}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Add Slide Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSlide}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        borderRadius: '8px',
                        padding: '6px 14px',
                        borderColor: '#d1d5db',
                        flexShrink: 0,
                    }}
                >
                    <Plus size={14} />
                    Add Slide
                </Button>
            </div>
        </div>
    );
};

export default StoryEditorWrapper;
