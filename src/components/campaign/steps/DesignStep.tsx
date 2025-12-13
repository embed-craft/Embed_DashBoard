import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Save, Rocket, MessageSquare, Smartphone, Film, Target, Flame, ClipboardList, Square, Zap, Image as ImageIcon, Menu, X, ChevronDown, ChevronRight, Eye, EyeOff, Lock, Unlock, Plus, Trash2, Type, Palette, Settings2, Maximize2, Layout, MessageCircle, Info, ImageIcon as PictureIcon, CreditCard, PlayCircle, Grid3x3, Link2, Undo2, Redo2, Copy, LayoutGrid, Upload, Compass, Link, Send, Code, CircleOff, LayoutTemplate, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useEditorStore, getDefaultLayersForNudgeType } from '@/store/useEditorStore';

import { BOTTOM_SHEET_TEMPLATES, getFeaturedTemplates } from '@/lib/bottomSheetTemplates';
import { validateNumericInput, validatePercentage, validateOpacity, validateDimension, validateColor } from '@/lib/validation';
import { BannerRenderer } from '@/components/BannerRenderer';
import { TooltipRenderer } from '@/components/TooltipRenderer';
import { ModalRenderer } from '@/components/ModalRenderer';
import { PipRenderer } from '@/components/PipRenderer';
import { FloaterRenderer } from '@/components/FloaterRenderer';
import { PositionEditor } from '@/components/editor/style/PositionEditor';
import { ShapeEditor } from '@/components/editor/style/ShapeEditor';
import { DESIGN_TYPES, TEMPLATES, DESIGN_CATEGORIES } from '@/lib/designTypes';

import { PhonePreview } from '@/components/editor/PhonePreview';
import { PreviewToolbar } from '@/components/editor/PreviewToolbar';
import { DEVICE_PRESETS, DEFAULT_DEVICE_ID } from '@/lib/devicePresets';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import TemplateGallery from '@/components/campaign/TemplateGallery';
import { SaveTemplateModal } from '@/components/campaign/SaveTemplateModal';
import { BottomSheetMinimalEditor } from '@/components/campaign/editors/BottomSheetMinimalEditor';
import { CustomHtmlEditor } from '@/components/campaign/editors/LayerProperties/CustomHtmlEditor';
import { BottomSheetRenderer } from '@/components/BottomSheetRenderer';



const colors = {
  primary: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
  gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' },
  purple: { 50: '#f5f3ff', 500: '#8b5cf6', 600: '#7c3aed' },
  green: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a' },
  text: { primary: '#111827', secondary: '#6b7280' },
  border: { default: '#e5e7eb' },
  background: { card: '#ffffff', page: '#f9fafb' }
};

const experienceTypes = [
  { id: 'nudges', label: 'In-app nudges', Icon: MessageSquare, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'messages', label: 'Messages', Icon: Smartphone, gradient: 'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)' },
  { id: 'stories', label: 'Stories', Icon: Film, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'challenges', label: 'Challenges', Icon: Target, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'streaks', label: 'Streaks', Icon: Flame, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'survey', label: 'Survey', Icon: ClipboardList, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
];

const nudgeTypes = [
  { id: 'modal', label: 'Modal', Icon: Maximize2, bg: '#E0E7FF', iconBg: '#C7D2FE', iconColor: '#6366F1' },
  { id: 'banner', label: 'Banner', Icon: Layout, bg: '#DBEAFE', iconBg: '#BFDBFE', iconColor: '#3B82F6' },
  { id: 'bottomsheet', label: 'Bottom Sheet', Icon: Square, bg: '#D1FAE5', iconBg: '#A7F3D0', iconColor: '#10B981' },
  { id: 'tooltip', label: 'Tooltip', Icon: MessageCircle, bg: '#FEF3C7', iconBg: '#FDE68A', iconColor: '#F59E0B' },
  { id: 'pip', label: 'Picture in Picture', Icon: PictureIcon, bg: '#E0E7FF', iconBg: '#C7D2FE', iconColor: '#6366F1' },
  { id: 'scratchcard', label: 'Scratch Card', Icon: CreditCard, bg: '#FCE7F3', iconBg: '#F9A8D4', iconColor: '#EC4899' },
  { id: 'carousel', label: 'Story Carousel', Icon: PlayCircle, bg: '#E0E7FF', iconBg: '#C7D2FE', iconColor: '#6366F1' },
  { id: 'inline', label: 'Inline Widget', Icon: Grid3x3, bg: '#DBEAFE', iconBg: '#BFDBFE', iconColor: '#3B82F6' },
  // New types requested
  { id: 'spotlight', label: 'Spotlight', Icon: Zap, bg: '#F3E8FF', iconBg: '#E9D5FF', iconColor: '#A855F7' },
  { id: 'coachmark', label: 'Coachmark', Icon: Compass, bg: '#E0F2FE', iconBg: '#BAE6FD', iconColor: '#0EA5E9' },
];

const EXPERIENCE_MAPPING: Record<string, string[]> = {
  'nudges': ['tooltip', 'spotlight', 'coachmark'],
  'messages': ['modal', 'pip', 'bottomsheet', 'banner', 'scratchcard'],
  'stories': ['carousel'],
  // Default fallbacks for others or future types
  'challenges': [],
  'streaks': [],
  'survey': []
};

export const DesignStep: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Zustand Editor Store
  const {
    currentCampaign,
    activeTab,
    propertyTab,
    showEditor,
    isSaving,
    saveError,
    createCampaign,
    updateCampaignName,
    updateTrigger,
    updateScreen,
    updateStatus,
    saveTemplate,
    editorMode,
    saveCampaign,
    setShowEditor,
    updateLayerContent,
    updateLayerStyle,
    moveLayerToParent,
    selectLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    deleteLayer,
    updateLayer,
    updateBottomSheetConfig,
    updateModalConfig,
    updateBannerConfig,
    updateTooltipConfig,
    updatePipConfig,
    updateFloaterConfig,
    loadCampaign,
    setActiveTab,
    setPropertyTab,
    addLayer,
    setEditorMode,
    isTemplateModalOpen, // ✅ FIX: Add store state
    setTemplateModalOpen, // ✅ FIX: Add store action
    isSaveTemplateModalOpen, // ✅ FIX: Add store state
    setSaveTemplateModalOpen, // ✅ FIX: Add store action
    enableAutoSave: startAutoSave, // Alias to avoid potential shadowing issues
  } = useEditorStore();

  // Local UI state

  const [selectedExperience, setSelectedExperience] = useState<string | null>('nudges');
  const [selectedNudgeType, setSelectedNudgeType] = useState<string | null>(currentCampaign?.nudgeType || null);

  const [isCreating, setIsCreating] = useState(!!searchParams.get('experience')); // Auto-open if experience param exists
  const [filterCategory, setFilterCategory] = useState<string>('all'); // Filter state for selection view
  const [selectedExperienceType, setSelectedExperienceType] = useState<string | null>(null); // Track selected experience
  const [selectedDevice, setSelectedDevice] = useState<string>(DEFAULT_DEVICE_ID); // Device selection for preview
  const [previewZoom, setPreviewZoom] = useState<number>(0.7); // Preview zoom level
  const [showGrid, setShowGrid] = useState<boolean>(false); // Grid overlay toggle
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null); // Fix 3
  const [collapsedLayers, setCollapsedLayers] = useState<Set<string>>(new Set()); // For layer hierarchy

  // Derived state for selected layer
  const selectedLayerId = currentCampaign?.selectedLayerId || null;
  const selectedLayerObj = currentCampaign?.layers?.find((layer: any) => layer.id === selectedLayerId);

  // Property panel state
  const [borderRadiusValue, setBorderRadiusValue] = useState(8);

  // FIX #20: Debounce timer ref for slider inputs
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Page Feature State
  const [pages, setPages] = useState<any[]>([]);

  // Fetch pages on mount
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await apiClient.listPages();
        if (response && response.pages) {
          setPages(response.pages);
        }
      } catch (error) {
        console.error('Failed to fetch pages:', error);
      }
    };
    fetchPages();
  }, []);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // Derive selected page object
  const activePageId = selectedNudgeType === 'tooltip' && currentCampaign?.tooltipConfig?.targetPageId
    ? currentCampaign.tooltipConfig.targetPageId
    : selectedPageId;

  const selectedPage = pages.find(p => p._id === activePageId);

  // Fetch Pages on mount
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await apiClient.listPages();
        setPages(response.pages);
      } catch (error) {
        console.error('Failed to fetch pages:', error);
      }
    };
    fetchPages();
  }, []);

  useEffect(() => {
    // Sync Selected Page to Campaign Config (If needed)
    // currently we just use it for local preview context
  }, [selectedPageId]);



  // Handle Experience Selection
  const handleExperienceSelect = (id: string) => {
    setSelectedExperience(id);
    toast.success(`${experienceTypes.find(e => e.id === id)?.label} selected`);
  };

  // Handle Nudge Type Selection
  const handleNudgeTypeSelect = (id: string) => {
    setSelectedNudgeType(id);

    // Show template selection for bottom sheets
    if (id === 'bottomsheet') {
      useEditorStore.getState().setTemplateModalOpen(true);
    }

    // Create new campaign with selected nudge type
    createCampaign(
      (selectedExperience || selectedExperienceType) as any || 'nudges',
      id as any
    );

    // FIX: Navigate to the new campaign ID immediately to prevent CampaignBuilder from resetting it
    const { currentCampaign } = useEditorStore.getState();
    if (currentCampaign?.id) {
      navigate(`/campaign-builder?id=${currentCampaign.id}&experience=${selectedExperience || selectedExperienceType || 'nudges'}`, { replace: true });
    }

    setShowEditor(true);
    toast.info('Opening editor...');
  };


  // Handle property updates with real-time store sync
  const handleContentUpdate = (field: string, value: any) => {
    if (!selectedLayerId) return;
    updateLayerContent(selectedLayerId, { [field]: value });
  };

  const handleStyleUpdate = (field: string, value: any) => {
    if (!selectedLayerId) return;
    updateLayerStyle(selectedLayerId, { [field]: value });
  };

  const handleTooltipUpdate = (field: string, value: any) => {
    updateTooltipConfig({ [field]: value });
  };

  // Image upload handler (Fix 1)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'layer' | 'background' | 'tooltip_image_only') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;

      if (target === 'layer') {
        handleContentUpdate('imageUrl', base64);
        toast.success('Image uploaded successfully');
      } else if (target === 'tooltip_image_only') {
        updateTooltipConfig({ imageUrl: base64 });
        toast.success('Tooltip image uploaded');
      } else {
        handleStyleUpdate('backgroundImage', `url('${base64}')`);
        toast.success('Background image uploaded');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to upload image');
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop Handlers for Layer Reordering
  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayerId(layerId);
    e.dataTransfer.effectAllowed = 'move';
    // Add a subtle visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedLayerId(null);
    setDragOverLayerId(null);
    setDropPosition(null); // Fix 3
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedLayerId && draggedLayerId !== layerId) {
      setDragOverLayerId(layerId);

      // Calculate drop position (Fix 3 - Enhanced visual feedback)
      const targetElement = e.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const mouseY = e.clientY;
      const relativeY = mouseY - rect.top;
      const height = rect.height;

      // Determine if drop should be before, after, or inside (for containers)
      const targetLayer = campaignLayers.find(l => l.id === layerId);
      const isContainer = targetLayer?.type === 'container';

      if (relativeY < height * 0.33) {
        setDropPosition('before');
      } else if (relativeY > height * 0.67 || !isContainer) {
        setDropPosition('after');
      } else {
        setDropPosition('inside'); // Only for containers
      }
    }
  };

  const handleDragLeave = () => {
    setDragOverLayerId(null);
    setDropPosition(null); // Fix 3
  };

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();

    if (!draggedLayerId || draggedLayerId === targetLayerId) {
      setDraggedLayerId(null);
      setDragOverLayerId(null);
      setDropPosition(null);
      return;
    }

    const draggedLayer = campaignLayers.find(l => l.id === draggedLayerId);
    const targetLayer = campaignLayers.find(l => l.id === targetLayerId);

    if (!draggedLayer || !targetLayer || !currentCampaign) {
      setDraggedLayerId(null);
      setDragOverLayerId(null);
      setDropPosition(null);
      return;
    }

    // Handle different drop positions
    if (dropPosition === 'inside' && targetLayer.type === 'container') {
      // Move layer inside the container (make it a child)
      moveLayerToParent(draggedLayerId, targetLayerId);
      toast.success(`"${draggedLayer.name}" moved inside "${targetLayer.name}"`);
    } else {
      // Reorder at same level (before/after)
      const draggedIndex = campaignLayers.findIndex(l => l.id === draggedLayerId);
      const targetIndex = campaignLayers.findIndex(l => l.id === targetLayerId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const { reorderLayer } = useEditorStore.getState();
        const adjustedIndex = dropPosition === 'after' ? targetIndex + 1 : targetIndex;
        reorderLayer(draggedLayerId, adjustedIndex);
        toast.success('Layer reordered');
      }
    }

    setDraggedLayerId(null);
    setDragOverLayerId(null);
    setDropPosition(null);
  };



  // Enable auto-save on mount
  // useEffect(() => {
  //   console.log('DesignStep mounted - AutoSave temporarily disabled for debugging');
  //   // initializeAutoSave();
  //   return () => {
  //     // Cleanup handled by store
  //   };
  // }, []);

  // Sync selectedNudgeType with current campaign
  useEffect(() => {
    if (currentCampaign?.nudgeType && selectedNudgeType !== currentCampaign.nudgeType) {
      console.log('CampaignBuilder: Syncing selectedNudgeType to:', currentCampaign.nudgeType);
      setSelectedNudgeType(currentCampaign.nudgeType);
    } else if (!currentCampaign && selectedNudgeType) {
      // If no campaign exists but selectedNudgeType is set, reset it
      console.log('CampaignBuilder: No campaign but selectedNudgeType is set, resetting');
      setSelectedNudgeType(null);
    }
  }, [currentCampaign, selectedNudgeType]);

  // Auto-save initialization
  useEffect(() => {
    if (startAutoSave) {
      console.log('DesignStep: Initializing auto-save...');
      startAutoSave();
    } else {
      console.error('DesignStep: startAutoSave is undefined!');
    }
  }, [startAutoSave]);

  // FIX: Reset editor state if no campaign is selected but editor is shown
  useEffect(() => {
    if (showEditor && !currentCampaign) {
      console.warn('DesignStep: showEditor is true but currentCampaign is null. Resetting state.');
      setShowEditor(false);
      setIsCreating(false);
      setSelectedNudgeType(null);
    }
  }, [showEditor, currentCampaign, setShowEditor]);

  // Check URL params for experience type (when coming from CreateCampaignModal)
  useEffect(() => {
    const experienceParam = searchParams.get('experience');
    if (experienceParam && !currentCampaign) {
      // New campaign flow - show selection view
      setSelectedExperienceType(experienceParam);
      setSelectedExperience(experienceParam); // Sync this too
      setIsCreating(true); // Go directly to selection view
    }
  }, [searchParams, currentCampaign]);

  // FIX #14: Warn user about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentCampaign?.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentCampaign?.isDirty]);

  // Template mode detection - Load template when navigating from Templates page

  const loadTemplate = async (templateObj?: any) => {
    try {
      // Import API dynamically
      const api = await import('@/lib/api');

      let template = templateObj;
      if (!template) {
        // Fix: Determine which ID to use based on editor mode
        // If mode is 'template', the 'id' param IS the template ID we want to edit.
        // If mode is 'campaign' (default), we only look for 'templateId' param (e.g. applying template).
        // We must NOT use 'id' in campaign mode as that refers to the campaign itself.
        const mode = searchParams.get('mode');
        const urlId = searchParams.get('id');
        const urlTemplateId = searchParams.get('templateId');

        const fetchTemplateId = (mode === 'template' ? urlId : null) || urlTemplateId;

        if (!fetchTemplateId) return; // Nothing to load

        template = await api.apiClient.getTemplate(fetchTemplateId);
      }

      if (!template) {
        toast.error('Template not found');
        navigate('/templates');
        return;
      }

      console.log('DesignStep: Loaded template:', template);

      // FIX: Use transformer to ensure consistent CampaignEditor format
      const transformers = await import('@/lib/campaignTransformers');
      const campaignData = transformers.backendToEditor(template);

      // Explicitly set source if available and not present (transformers usually don't map sourceTemplateId from raw)
      if (template._id && !campaignData.sourceTemplateId) {
        campaignData.sourceTemplateId = template._id;
      }

      // Ensure nudgeType is set (transformer does this, but being safe)
      if (!campaignData.nudgeType) {
        campaignData.nudgeType = template.type || template.config?.type || 'bottomsheet';
      }

      // Override ID validation issue for templates - templates might use _id as id
      if (!campaignData.id) {
        campaignData.id = template._id || template.id || `temp_${Date.now()}`;
      }

      await loadCampaign(campaignData as any);
      setEditorMode('template');
      setShowEditor(true);
      toast.success('Template loaded');
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error('Failed to load template');
      navigate('/templates');
    }
  };

  useEffect(() => {
    const mode = searchParams.get('mode');
    const templateId = searchParams.get('id');

    if (mode === 'template' && templateId && (editorMode !== 'template' || currentCampaign?.id !== templateId)) {
      console.log('DesignStep: Detected template mode, loading template:', templateId);

      loadTemplate();
    }
  }, [searchParams, editorMode, loadCampaign, setEditorMode, setShowEditor, navigate, currentCampaign]);

  // Get layers from current campaign
  const campaignLayers = currentCampaign?.layers || [];
  const campaignName = currentCampaign?.name || 'New Campaign';

  // Debug logging for preview
  console.log('CampaignBuilder: Current campaign:', currentCampaign?.id);
  console.log('CampaignBuilder: Campaign layers count:', campaignLayers.length);
  console.log('CampaignBuilder: Campaign layers:', campaignLayers);

  // Get bottom sheet container ID (for adding new layers as children)
  const bottomSheetContainer = campaignLayers.find(l => l.type === 'container' && l.name === 'Bottom Sheet');
  const bottomSheetId = bottomSheetContainer?.id || null;




  const isLayerSelected = (layerId: string) => selectedLayerId === layerId;

  // Helper function to check if selected layer matches a type or name
  const isSelectedLayerType = (typeOrName: string) => {
    if (!selectedLayerObj) return false;
    return selectedLayerObj.type === typeOrName ||
      selectedLayerObj.name.toLowerCase().includes(typeOrName.toLowerCase());
  };

  // Layer hierarchy helpers (Fix 2)
  const toggleLayerCollapse = (layerId: string) => {
    setCollapsedLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  };

  // Recursive Layer Tree Item Component (Fix 2)
  const renderLayerTreeItem = (layer: any, depth: number = 0): JSX.Element => {
    const hasChildren = layer.children && layer.children.length > 0;
    const isCollapsed = collapsedLayers.has(layer.id);
    const isSelected = currentCampaign?.selectedLayerId === layer.id;
    const isDraggedOver = dragOverLayerId === layer.id;
    const isDragging = draggedLayerId === layer.id; // Fix 3
    const indentPx = depth * 20;

    return (
      <div key={layer.id} style={{ position: 'relative' }}>
        {/* Insertion line - BEFORE (Fix 3) */}
        {isDraggedOver && dropPosition === 'before' && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            left: `${12 + indentPx}px`,
            right: '12px',
            height: '2px',
            backgroundColor: colors.primary[500],
            borderRadius: '1px',
            zIndex: 100,
            boxShadow: '0 0 4px rgba(99, 102, 241, 0.5)'
          }} />
        )}

        <div
          draggable={!layer.locked}
          onDragStart={(e) => handleDragStart(e, layer.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, layer.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, layer.id)}
          onClick={() => selectLayer(layer.id)}
          style={{
            padding: '10px 12px',
            marginBottom: '4px',
            borderRadius: '6px',
            cursor: layer.locked ? 'not-allowed' : 'grab',
            backgroundColor: isSelected ? colors.purple[50] : 'transparent',
            border: `1px solid ${isDraggedOver && dropPosition === 'inside'
              ? colors.primary[500]
              : isSelected
                ? colors.purple[500]
                : 'transparent'
              }`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: `${12 + indentPx}px`,
            opacity: isDragging ? 0.4 : (layer.visible ? 1 : 0.5), // Ghost effect when dragging
            transition: 'all 0.15s ease',
            transform: isDragging ? 'scale(0.98)' : 'scale(1)' // Subtle scale when dragging
          }}
        >
          {/* Drag handle indicator */}
          {!layer.locked && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              cursor: 'grab',
              opacity: 0.4
            }}>
              <div style={{ width: '3px', height: '3px', backgroundColor: colors.gray[400], borderRadius: '50%' }} />
              <div style={{ width: '3px', height: '3px', backgroundColor: colors.gray[400], borderRadius: '50%' }} />
              <div style={{ width: '3px', height: '3px', backgroundColor: colors.gray[400], borderRadius: '50%' }} />
            </div>
          )}

          {/* Expand/collapse chevron for containers */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleLayerCollapse(layer.id);
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              {isCollapsed ? (
                <ChevronRight size={14} color={colors.gray[500]} />
              ) : (
                <ChevronDown size={14} color={colors.gray[500]} />
              )}
            </button>
          ) : (
            <div style={{ width: '18px' }} /> // Spacer for alignment
          )}

          <ImageIcon size={16} color={isSelected ? colors.purple[500] : colors.gray[500]} />
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: isSelected ? colors.purple[600] : colors.text.primary }}>
            {layer.name}
          </span>

          {/* Action buttons */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleLayerVisibility(layer.id);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
            title={layer.visible ? 'Hide layer' : 'Show layer'}
          >
            {layer.visible ? <Eye size={14} color={colors.gray[400]} /> : <EyeOff size={14} color={colors.gray[400]} />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleLayerLock(layer.id);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
            title={layer.locked ? 'Unlock layer' : 'Lock layer'}
          >
            {layer.locked ? <Lock size={14} color={colors.gray[400]} /> : <Unlock size={14} color={colors.gray[400]} />}
          </button>

          {/* Delete button - Skip for Bottom Sheet root layer */}
          {layer.type !== 'container' && layer.name !== 'Bottom Sheet' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${layer.name}" layer?`)) {
                  deleteLayer(layer.id);
                  toast.success('Layer deleted');
                }
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
              title="Delete layer"
            >
              <Trash2 size={14} color={colors.gray[400]} />
            </button>
          )}

          {/* More options */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Show context menu
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
              title="More options"
            >
              <Menu size={14} color={colors.gray[400]} />
            </button>
          </div>
        </div>

        {/* Insertion line - AFTER (Fix 3) */}
        {isDraggedOver && dropPosition === 'after' && (
          <div style={{
            position: 'absolute',
            bottom: '2px',
            left: `${12 + indentPx}px`,
            right: '12px',
            height: '2px',
            backgroundColor: colors.primary[500],
            borderRadius: '1px',
            zIndex: 100,
            boxShadow: '0 0 4px rgba(99, 102, 241, 0.5)'
          }} />
        )}

        {/* Recursively render children if not collapsed */}
        {hasChildren && !isCollapsed && (
          <div>
            {layer.children.map((childId: string) => {
              const childLayer = campaignLayers.find((l: any) => l.id === childId);
              if (!childLayer) return null;
              return renderLayerTreeItem(childLayer, depth + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  // Helper function to find a layer by name/type
  const findLayerByName = (name: string) => {
    return campaignLayers.find(layer => layer.name.toLowerCase().includes(name.toLowerCase()) || layer.type === name);
  };



  // ... (previous imports)

  // Inside CampaignBuilder component...

  // Render canvas preview based on nudge type
  const renderCanvasPreview = () => {
    // Check if we have a loaded campaign with nudgeType
    const nudgeTypeToRender = selectedNudgeType || currentCampaign?.nudgeType;

    if (!nudgeTypeToRender) {
      return (
        <div style={{ padding: '60px 20px 20px', textAlign: 'center', color: colors.text.secondary, fontSize: '13px' }}>
          Select an experience type to preview
        </div>
      );
    }

    switch (nudgeTypeToRender) {


      case 'modal':
        const defaultModalConfig = {
          mode: 'container' as const,
          width: '90%',
          height: 'auto',
          backgroundColor: '#FFFFFF',
          elevation: 2 as const,
          overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
          animation: { type: 'pop' as const, duration: 300, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
        };

        console.log('DesignStep modalConfig:', currentCampaign?.modalConfig);

        return (
          <ErrorBoundary>
            <ModalRenderer
              layers={campaignLayers}
              selectedLayerId={selectedLayerId}
              onLayerSelect={selectLayer}
              colors={colors}
              config={currentCampaign?.modalConfig || defaultModalConfig}
              onConfigChange={(config) => updateModalConfig(config)}
              onLayerUpdate={updateLayer}
              onDismiss={() => toast.success('Dismiss action triggered (Preview)')}
            />
          </ErrorBoundary>
        );

      case 'banner':
        return (
          <BannerRenderer
            layers={campaignLayers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={selectLayer}
            colors={colors}
            config={currentCampaign?.bannerConfig}
            onHeightChange={(height) => updateBannerConfig({ height })}
            onLayerUpdate={updateLayer}
          />
        );

      case 'tooltip':
        const device = DEVICE_PRESETS.find(d => d.id === selectedDevice) || DEVICE_PRESETS[0];
        const deviceMeta = selectedPage?.deviceMetadata || { width: 1080, height: 1920 };

        const previewWidth = device.width * previewZoom;
        const previewHeight = device.height * previewZoom;

        // Coordinates are Physical (from SDK), DeviceMeta is Logical.
        // We must divide by density to normalize, or divide preview by physical width.
        const density = deviceMeta.density || 1;
        const scaleX = previewWidth / (deviceMeta.width * density);
        const scaleY = previewHeight / (deviceMeta.height * density);

        return (
          <TooltipRenderer
            layers={campaignLayers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={selectLayer}
            colors={colors}
            config={currentCampaign?.tooltipConfig}
            onConfigChange={(config) => updateTooltipConfig(config)}
            targetElement={selectedPage?.elements?.find((e: any) => e.id === currentCampaign?.tooltipConfig?.targetElementId)}
            scaleX={scaleX}
            scaleY={scaleY}
          />
        );

      case 'pip':
        return (
          <PipRenderer
            layers={campaignLayers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={selectLayer}
            colors={colors}
            config={currentCampaign?.pipConfig}
            onConfigChange={(config) => updatePipConfig(config)}
          />
        );
      case 'floater':
        return (
          <FloaterRenderer
            layers={currentCampaign.layers}
            selectedLayerId={selectedLayerId}
            onLayerSelect={selectLayer}
            onLayerUpdate={updateLayer}
            scale={previewZoom}
            config={currentCampaign.floaterConfig}
          />
        );
      case 'scratchcard':
        return (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85%', backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: isSelectedLayerType('container') ? `2px solid ${colors.primary[500]}` : 'none' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px', opacity: isSelectedLayerType('title') || isSelectedLayerType('text') ? 1 : 0.9 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 700, color: colors.text.primary }}>
                Scratch & Win! 🎁
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: colors.text.secondary }}>
                Scratch to reveal your reward
              </p>
            </div>

            {/* Scratch Card Area */}
            <div style={{ width: '100%', height: '140px', borderRadius: '12px', marginBottom: '20px', position: 'relative', border: isSelectedLayerType('overlay') ? `2px solid ${colors.primary[500]}` : 'none' }}>
              {/* Scratch Overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSelectedLayerType('overlay') ? 1 : 0.9 }}>
                <p style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Scratch Here</p>
              </div>

              {/* Reward Content (shown partially) */}
              <div style={{ position: 'absolute', inset: 0, backgroundColor: colors.green[50], borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <p style={{ fontSize: '32px', fontWeight: 700, color: colors.green[500], margin: '0 0 4px 0' }}>50% OFF</p>
                <p style={{ fontSize: '12px', color: colors.text.secondary, margin: 0 }}>On your next order</p>
              </div>
            </div>

            {/* CTA */}
            <button style={{ width: '100%', padding: '14px', backgroundColor: colors.primary[500], color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: isSelectedLayerType('button') ? 1 : 0.9 }}>
              Claim Reward
            </button>
          </div>
        );

      case 'carousel':
        return (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'black' }}>
            {/* Progress Bars */}
            <div style={{ display: 'flex', gap: '4px', padding: '12px 16px', opacity: isSelectedLayerType('container') ? 1 : 0.7 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ flex: 1, height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                  {i === 0 && <div style={{ width: '60%', height: '100%', backgroundColor: 'white' }}></div>}
                </div>
              ))}
            </div>

            {/* Story Content */}
            <div style={{ position: 'relative', height: 'calc(100% - 50px)', opacity: isSelectedLayerType('media') ? 1 : 0.9 }}>
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop" alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* Gradient Overlay */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '40px 20px 20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: 'white', opacity: isSelectedLayerType('text') ? 1 : 0.9 }}>
                  Summer Sale is Live! ☀️
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                  Up to 70% off on all items
                </p>
              </div>

              {/* Close Button */}
              <button style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: isSelectedLayerType('close') ? 1 : 0.7 }}>
                <X size={18} color="white" />
              </button>

              {/* Navigation Controls */}
              <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', opacity: isSelectedLayerType('controls') ? 1 : 0.5 }}>
                <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={20} color="white" style={{ transform: 'rotate(180deg)' }} />
                </button>
              </div>
              <div style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', opacity: isSelectedLayerType('controls') ? 1 : 0.5 }}>
                <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={20} color="white" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'inline':
        return (
          <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
            {/* Inline Widget */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '16px', border: isSelectedLayerType('container') ? `2px solid ${colors.primary[500]}` : `1px solid ${colors.gray[200]}` }}>
              {/* Media */}
              <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: isSelectedLayerType('media') ? `2px solid ${colors.primary[500]}` : 'none' }}>
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop" alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Content */}
              <div style={{ marginBottom: '16px', opacity: isSelectedLayerType('text') ? 1 : 0.9 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 700, color: colors.text.primary }}>
                  Exclusive Members Deal 🌟
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: colors.text.secondary, lineHeight: 1.5 }}>
                  Get early access to our new collection. Limited spots available!
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ flex: 1, padding: '12px', backgroundColor: colors.primary[500], color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: isSelectedLayerType('button') ? 1 : 0.9 }}>
                  Join Now
                </button>
                <button style={{ padding: '12px 20px', backgroundColor: 'transparent', color: colors.text.primary, border: `1px solid ${colors.gray[200]}`, borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', opacity: isSelectedLayerType('button') ? 1 : 0.9 }}>
                  Learn More
                </button>
              </div>
            </div>

            {/* Dummy content to show inline context */}
            <div style={{ fontSize: '13px', color: colors.text.secondary, lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 12px 0' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p style={{ margin: 0 }}>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            </div>
          </div>
        );

      case 'bottomsheet':
        return (
          <BottomSheetRenderer
              layers={campaignLayers}
              selectedLayerId={selectedLayerId}
              onLayerSelect={selectLayer}
              onLayerUpdate={updateLayer}
              colors={colors}
              config={currentCampaign?.bottomSheetConfig}
              onDismiss={() => {}} 
          />
        );

      default:
        return (
          <div style={{ padding: '60px 20px 20px', textAlign: 'center', color: colors.text.secondary, fontSize: '13px' }}>
            Preview for {selectedNudgeType}
          </div>
        );
    }
  };

  // Render layer actions (Refactored from renderLayerProperties)
  const renderLayerActions = () => {
    if (!selectedLayerObj) return null;

    return (
      <div style={{ marginBottom: '20px' }}>
        <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>⚡ Interaction</h5>

        <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>On Click Action</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[
            { value: 'none', label: 'No Action', icon: <CircleOff size={16} /> },
            { value: 'close', label: 'Dismiss', icon: <X size={16} /> },
            { value: 'deeplink', label: 'Open Link', icon: <Link size={16} /> },
            { value: 'navigate', label: 'Navigate', icon: <Compass size={16} /> },
            { value: 'custom', label: 'Custom', icon: <Code size={16} /> }
          ].map((option) => {
            const isSelected = (selectedLayerObj.content?.action?.type || 'none') === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  if (option.value === 'none') {
                    handleContentUpdate('action', undefined);
                  } else {
                    handleContentUpdate('action', {
                      type: option.value,
                      // Preserve existing properties if switching types, or reset? 
                      // For now, let's preserve url if it exists, but maybe safer to reset if type changes significantly.
                      // But simple is better:
                      ...(selectedLayerObj.content?.action || {})
                    });
                    // Ensure type is updated
                    handleContentUpdate('action', { ...selectedLayerObj.content?.action, type: option.value });
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  border: `1px solid ${isSelected ? colors.primary[500] : colors.gray[200]}`,
                  borderRadius: '8px',
                  backgroundColor: isSelected ? colors.primary[50] : 'white',
                  color: isSelected ? colors.primary[600] : colors.text.secondary,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                {option.icon}
                {option.label}
              </button>
            );
          })}
        </div>

        {selectedLayerObj.content?.action?.type === 'deeplink' && (
          <div style={{ marginBottom: '12px', animation: 'fadeIn 0.2s ease-in-out' }}>
            <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Destination URL</label>
            <div style={{ position: 'relative' }}>
              <Link size={14} color={colors.text.secondary} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={selectedLayerObj.content?.action?.url || ''}
                onChange={(e) => handleContentUpdate('action', { ...selectedLayerObj.content?.action, url: e.target.value })}
                placeholder="https://example.com/page"
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  border: `1px solid ${colors.gray[200]}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = colors.primary[500]}
                onBlur={(e) => e.target.style.borderColor = colors.gray[200]}
              />
            </div>
            <div style={{ fontSize: '11px', color: colors.text.secondary, marginTop: '4px' }}>
              Opens in a new tab by default.
            </div>
          </div>
        )}

        {selectedLayerObj.content?.action?.type === 'navigate' && (
          <div style={{ marginBottom: '12px', animation: 'fadeIn 0.2s ease-in-out' }}>
            <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Screen Name</label>
            <div style={{ position: 'relative' }}>
              <Compass size={14} color={colors.text.secondary} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={selectedLayerObj.content?.action?.screenName || ''}
                onChange={(e) => handleContentUpdate('action', { ...selectedLayerObj.content?.action, screenName: e.target.value })}
                placeholder="e.g. HomeScreen, ProfileScreen"
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  border: `1px solid ${colors.gray[200]}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = colors.primary[500]}
                onBlur={(e) => e.target.style.borderColor = colors.gray[200]}
              />
            </div>
            <div style={{ fontSize: '11px', color: colors.text.secondary, marginTop: '4px' }}>
              Enter the exact screen name to navigate to.
            </div>
          </div>
        )}

        {selectedLayerObj.content?.action?.type === 'custom' && (
          <div style={{ marginBottom: '12px', animation: 'fadeIn 0.2s ease-in-out' }}>
            <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Event Name</label>
            <div style={{ position: 'relative' }}>
              <Code size={14} color={colors.text.secondary} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={selectedLayerObj.content?.action?.eventName || ''}
                onChange={(e) => handleContentUpdate('action', { ...selectedLayerObj.content?.action, eventName: e.target.value })}
                placeholder="e.g. track_signup_click"
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  border: `1px solid ${colors.gray[200]}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
                onFocus={(e) => e.target.style.borderColor = colors.primary[500]}
                onBlur={(e) => e.target.style.borderColor = colors.gray[200]}
              />
            </div>
            <div style={{ fontSize: '11px', color: colors.text.secondary, marginTop: '4px' }}>
              The event will start running.
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render properties based on layer type
  const renderLayerProperties = () => {
    if (!selectedLayerObj) {
      // Show global config for specific nudge types when no layer is selected
      if (selectedNudgeType === 'tooltip') return renderTooltipConfig();
      if (selectedNudgeType === 'pip') return renderPipConfig();
      if (selectedNudgeType === 'bottomsheet') return <BottomSheetMinimalEditor />;
      return null;
    }

    if (selectedLayerObj.type === 'custom_html') {
      return <CustomHtmlEditor />;
    }

    // Check if layer is locked (Phase A - Fix 1)
    if (selectedLayerObj.locked) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          color: colors.text.secondary
        }}>
          <Lock size={48} color={colors.gray[300]} />
          <div style={{ fontSize: '14px', fontWeight: 500, color: colors.text.primary }}>Layer is Locked</div>
          <div style={{ fontSize: '12px', maxWidth: '200px', lineHeight: '1.5' }}>
            This layer cannot be edited while locked. Unlock it from the layers panel to make changes.
          </div>
        </div>
      );
    }

    // Modal Configuration
    const renderModalConfig = () => {
      if (selectedNudgeType !== 'modal') return null;

      const config = currentCampaign?.modalConfig || {
        mode: 'container',
        width: '90%',
        height: 'auto',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 2,
        overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
        animation: { type: 'pop', duration: 300, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
      };

      const handleConfigUpdate = (field: string, value: any) => {
        updateModalConfig({ [field]: value });
      };

      const handleNestedConfigUpdate = (parent: 'overlay' | 'animation', field: string, value: any) => {
        const parentObj = config[parent] as any;
        updateModalConfig({ [parent]: { ...parentObj, [field]: value } });
      };

      // Show modal config when:
      // 1. Modal container is selected
      // 2. No layer is selected
      const isModalSelected = selectedLayerObj?.type === 'container' && selectedLayerObj?.name === 'Modal Container';
      const shouldShowFullConfig = !selectedLayerObj || isModalSelected;

      // ALWAYS show the mode toggle, even when child layers are selected
      const modeToggleSection = (
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
            🎨 Modal Mode
          </h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => {
                handleConfigUpdate('mode', 'container');
                // Restore default container styles
                handleConfigUpdate('width', '90%');

                // Find Modal Container layer explicitly
                const modalContainer = currentCampaign?.layers?.find((l: any) => l.type === 'container' && l.name === 'Modal Container');
                if (modalContainer) {
                  updateLayerStyle(modalContainer.id, {
                    width: '90%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    padding: 20
                  });
                }
              }}
              style={{
                padding: '12px',
                border: `2px solid ${(config.mode || 'container') === 'container' ? colors.primary[500] : colors.gray[200]}`,
                borderRadius: '8px',
                background: (config.mode || 'container') === 'container' ? colors.primary[50] : 'white',
                color: (config.mode || 'container') === 'container' ? colors.primary[600] : colors.text.secondary,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center'
              }}
            >
              <LayoutGrid size={18} />
              <div>Container Card</div>
              <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.7 }}>
                White box + layers
              </div>
            </button>
            <button
              onClick={() => {
                handleConfigUpdate('mode', 'image-only');
                // Reset styles for image-only mode
                handleConfigUpdate('width', undefined); // Let it be auto

                // Find Modal Container layer explicitly
                const modalContainer = currentCampaign?.layers?.find((l: any) => l.type === 'container' && l.name === 'Modal Container');
                if (modalContainer) {
                  updateLayerStyle(modalContainer.id, {
                    width: undefined, // Let it be auto
                    backgroundColor: 'transparent',
                    borderRadius: 0,
                    boxShadow: 'none',
                    padding: 0
                  });
                }
              }}
              style={{
                padding: '12px',
                border: `2px solid ${config.mode === 'image-only' ? colors.primary[500] : colors.gray[200]}`,
                borderRadius: '8px',
                background: config.mode === 'image-only' ? colors.primary[50] : 'white',
                color: config.mode === 'image-only' ? colors.primary[600] : colors.text.secondary,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center'
              }}
            >
              <ImageIcon size={18} />
              <div>Image Only</div>
              <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.7 }}>
                Full-image background
              </div>
            </button>
          </div>
          {!shouldShowFullConfig && (
            <button
              onClick={() => {
                // Find modal container ID
                const modalContainer = currentCampaign?.layers?.find((l: any) => l.type === 'container' && l.name === 'Modal Container');
                if (modalContainer) selectLayer(modalContainer.id);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                marginTop: '8px',
                background: 'transparent',
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 500,
                color: colors.text.secondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Settings2 size={14} />
              More Modal Settings
            </button>
          )}
        </div>
      );

      if (!shouldShowFullConfig && selectedLayerObj) {
        return modeToggleSection;
      }

      return (
        <>
          {modeToggleSection}

          {/* Background Image Upload (Image-Only Mode) */}
          {config.mode === 'image-only' && (
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🖼️ Background Image
              </h5>

              {/* Image Preview */}
              {config.backgroundImageUrl && (
                <div style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                  border: `1px solid ${colors.gray[200]}`,
                  position: 'relative'
                }}>
                  <img
                    src={config.backgroundImageUrl}
                    alt="Background preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: config.backgroundSize || 'cover'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate('backgroundImageUrl', '')}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}

              {/* URL Input */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: colors.text.secondary, display: 'block', marginBottom: '6px' }}>
                  Image URL
                </label>
                <input
                  type="text"
                  value={config.backgroundImageUrl || ''}
                  onChange={(e) => handleConfigUpdate('backgroundImageUrl', e.target.value)}
                  placeholder="https://example.com/image.png"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
              </div>

              {/* Upload Button */}
              <div style={{ marginBottom: '12px' }}>
                <label
                  htmlFor="bg-image-upload-modal"
                  style={{
                    display: 'block',
                    padding: '10px',
                    background: colors.primary[500],
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📤 Upload Image
                </label>
                <input
                  id="bg-image-upload-modal"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Image must be under 5MB');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      handleConfigUpdate('backgroundImageUrl', base64);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>

              {/* Background Size */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: colors.text.secondary, display: 'block', marginBottom: '6px' }}>
                  Background Size
                </label>
                <select
                  value={config.backgroundSize || 'cover'}
                  onChange={(e) => handleConfigUpdate('backgroundSize', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                >
                  <option value="cover">Cover (fill area)</option>
                  <option value="contain">Contain (fit inside)</option>
                  <option value="fill">Fill (stretch)</option>
                </select>
              </div>
            </div>
          )}



          {/* Border Radius */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔲 Border Radius
            </h5>
            <div style={{ marginBottom: '8px' }}>
              <input
                type="range"
                min="0"
                max="50"
                value={typeof config.borderRadius === 'number' ? config.borderRadius : 16}
                onChange={(e) => handleConfigUpdate('borderRadius', parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 8, 16, 24].map((radius) => (
                <button
                  key={radius}
                  onClick={() => handleConfigUpdate('borderRadius', radius)}
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    backgroundColor: config.borderRadius === radius ? colors.gray[100] : 'white'
                  }}
                >
                  {radius}px
                </button>
              ))}
            </div>
          </div>

          {/* Elevation */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⬆️ Elevation
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleConfigUpdate('elevation', level)}
                  style={{
                    padding: '8px 4px',
                    border: `1px solid ${(config.elevation || 0) === level ? colors.primary[500] : colors.gray[200]}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    backgroundColor: (config.elevation || 0) === level ? colors.primary[50] : 'white',
                    color: (config.elevation || 0) === level ? colors.primary[600] : colors.text.secondary,
                    fontWeight: 500
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Overlay Settings */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎭 Overlay
            </h5>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>Show Overlay</span>
              <div
                onClick={() => handleNestedConfigUpdate('overlay', 'enabled', !config.overlay?.enabled)}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px',
                  background: config.overlay?.enabled ? colors.primary[500] : colors.gray[300],
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: config.overlay?.enabled ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
              </div>
            </div>
            {config.overlay?.enabled && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.overlay.opacity}
                    onChange={(e) => handleNestedConfigUpdate('overlay', 'opacity', parseFloat(e.target.value))}
                    style={{ width: '100%', marginBottom: '4px' }}
                  />
                  <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{Math.round((config.overlay.opacity || 0) * 100)}%</div>
                </div>
              </>
            )}
          </div>

          {/* Close Button Control */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              ❌ Close Button
            </h5>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.showCloseButton !== false}
                onChange={(e) => handleConfigUpdate('showCloseButton', e.target.checked)}
              />
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>Show Close Button</span>
            </label>
          </div>

          {/* Animation Settings */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              ✨ Animation
            </h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Type</label>
              <select
                value={config.animation?.type || 'pop'}
                onChange={(e) => handleNestedConfigUpdate('animation', 'type', e.target.value)}
                style={{ width: '100%', padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="pop">Pop (Scale)</option>
                <option value="fade">Fade</option>
                <option value="slide-up">Slide Up</option>
                <option value="slide-down">Slide Down</option>
                <option value="slide-left">Slide Left</option>
                <option value="slide-right">Slide Right</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Duration (ms)</label>
              <input
                type="number"
                value={config.animation?.duration || 300}
                onChange={(e) => handleNestedConfigUpdate('animation', 'duration', parseInt(e.target.value))}
                style={{ width: '100%', padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px' }}
              />
            </div>
          </div>
        </>
      );
    };

    // Banner Configuration
    const renderBannerConfig = () => {
      if (selectedNudgeType !== 'banner') return null;

      const config = currentCampaign?.bannerConfig || {
        mode: 'default',
        position: 'top',
        height: 'auto',
        backgroundColor: '#FFFFFF',
        borderRadius: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        opacity: 1,
        overlay: { enabled: false, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
        animation: { type: 'slide', duration: 300, easing: 'ease-out' }
      };

      const handleConfigUpdate = (field: string, value: any) => {
        updateBannerConfig({ [field]: value });
      };

      const handleNestedConfigUpdate = (parent: 'animation' | 'overlay', field: string, value: any) => {
        const parentObj = config[parent] as any;
        updateBannerConfig({ [parent]: { ...parentObj, [field]: value } });
      };

      // Show banner config when:
      // 1. Banner container is selected
      // 2. No layer is selected
      const isBannerSelected = selectedLayerObj?.type === 'container' && selectedLayerObj?.name === 'Banner Container';
      const shouldShowFullConfig = !selectedLayerObj || isBannerSelected;

      // ALWAYS show the mode toggle
      const modeToggleSection = (
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
            🎨 Banner Mode (UPDATED)
          </h5>
          <div style={{ background: 'red', color: 'white', padding: '4px', fontSize: '10px', marginBottom: '10px' }}>DEBUG: V2 LOADED</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => {
                handleConfigUpdate('mode', 'default');
                // Restore default container styles
                const bannerContainer = currentCampaign?.layers?.find((l: any) => l.type === 'container' && l.name === 'Banner Container');
                if (bannerContainer) {
                  updateLayerStyle(bannerContainer.id, {
                    backgroundColor: '#FFFFFF',
                    padding: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  });
                }
              }}
              style={{
                padding: '12px',
                border: `2px solid ${(config.mode || 'default') === 'default' ? colors.primary[500] : colors.gray[200]}`,
                borderRadius: '8px',
                background: (config.mode || 'default') === 'default' ? colors.primary[50] : 'white',
                color: (config.mode || 'default') === 'default' ? colors.primary[600] : colors.text.secondary,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center'
              }}
            >
              <LayoutGrid size={18} />
              <div>Default</div>
              <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.7 }}>
                Standard layout
              </div>
            </button>
            <button
              onClick={() => {
                handleConfigUpdate('mode', 'image-only');
                // Reset styles for image-only mode
                const bannerContainer = currentCampaign?.layers?.find((l: any) => l.type === 'container' && l.name === 'Banner Container');
                if (bannerContainer) {
                  updateLayerStyle(bannerContainer.id, {
                    backgroundColor: 'transparent',
                    padding: 0,
                    boxShadow: 'none'
                  });
                }
              }}
              style={{
                padding: '12px',
                border: `2px solid ${config.mode === 'image-only' ? colors.primary[500] : colors.gray[200]}`,
                borderRadius: '8px',
                background: config.mode === 'image-only' ? colors.primary[50] : 'white',
                color: config.mode === 'image-only' ? colors.primary[600] : colors.text.secondary,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center'
              }}
            >
              <ImageIcon size={18} />
              <div>Image Only</div>
              <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.7 }}>
                Full-width image
              </div>
            </button>
          </div>
          {!shouldShowFullConfig && (
            <button
              onClick={() => {
                const bannerContainer = currentCampaign?.layers?.find((l: any) => l.type === 'container' && l.name === 'Banner Container');
                if (bannerContainer) selectLayer(bannerContainer.id);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                marginTop: '8px',
                background: 'transparent',
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 500,
                color: colors.text.secondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Settings2 size={14} />
              More Banner Settings
            </button>
          )}
        </div>
      );

      if (!shouldShowFullConfig && selectedLayerObj) {
        return modeToggleSection;
      }

      return (
        <>
          {modeToggleSection}

          {/* Overlay Settings */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎭 Overlay (Background App)
            </h5>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>Show Overlay</span>
              <div
                onClick={() => handleNestedConfigUpdate('overlay', 'enabled', !config.overlay?.enabled)}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px',
                  background: config.overlay?.enabled ? colors.primary[500] : colors.gray[300],
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: config.overlay?.enabled ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
              </div>
            </div>
            {config.overlay?.enabled && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.overlay.opacity}
                    onChange={(e) => handleNestedConfigUpdate('overlay', 'opacity', parseFloat(e.target.value))}
                    style={{ width: '100%', marginBottom: '4px' }}
                  />
                  <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{Math.round((config.overlay.opacity || 0) * 100)}%</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Blur</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={config.overlay.blur || 0}
                    onChange={(e) => handleNestedConfigUpdate('overlay', 'blur', parseFloat(e.target.value))}
                    style={{ width: '100%', marginBottom: '4px' }}
                  />
                  <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{config.overlay.blur || 0}px</div>
                </div>
              </>
            )}
          </div>

          {/* Position Control */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              📍 Position
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleConfigUpdate('position', 'top')}
                style={{
                  padding: '8px',
                  border: `1px solid ${config.position === 'top' ? colors.primary[500] : colors.gray[200]}`,
                  borderRadius: '6px',
                  background: config.position === 'top' ? colors.primary[50] : 'white',
                  color: config.position === 'top' ? colors.primary[600] : colors.text.secondary,
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Top
              </button>
              <button
                onClick={() => handleConfigUpdate('position', 'bottom')}
                style={{
                  padding: '8px',
                  border: `1px solid ${config.position === 'bottom' ? colors.primary[500] : colors.gray[200]}`,
                  borderRadius: '6px',
                  background: config.position === 'bottom' ? colors.primary[50] : 'white',
                  color: config.position === 'bottom' ? colors.primary[600] : colors.text.secondary,
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Bottom
              </button>
            </div>
          </div>

          {/* Background Image (Image-Only Mode) */}
          {config.mode === 'image-only' && (
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
                🖼️ Banner Image
              </h5>

              {/* Image Preview */}
              {config.backgroundImageUrl && (
                <div style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                  border: `1px solid ${colors.gray[200]}`,
                  position: 'relative'
                }}>
                  <img
                    src={config.backgroundImageUrl}
                    alt="Banner preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    onClick={() => handleConfigUpdate('backgroundImageUrl', '')}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}

              {/* URL Input */}
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  value={config.backgroundImageUrl || ''}
                  onChange={(e) => handleConfigUpdate('backgroundImageUrl', e.target.value)}
                  placeholder="Image URL..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
              </div>

              {/* Upload Button */}
              <label
                style={{
                  display: 'block',
                  padding: '10px',
                  background: colors.primary[500],
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                📤 Upload Image
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Image must be under 5MB');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      handleConfigUpdate('backgroundImageUrl', event.target?.result);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
          )}

          {/* Height Control */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              📏 Height
            </h5>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => handleConfigUpdate('height', 'auto')}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: `1px solid ${config.height === 'auto' ? colors.primary[500] : colors.gray[200]}`,
                  borderRadius: '6px',
                  background: config.height === 'auto' ? colors.primary[50] : 'white',
                  color: config.height === 'auto' ? colors.primary[600] : colors.text.secondary,
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Auto
              </button>
              <button
                onClick={() => handleConfigUpdate('height', 100)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: `1px solid ${typeof config.height === 'number' ? colors.primary[500] : colors.gray[200]}`,
                  borderRadius: '6px',
                  background: typeof config.height === 'number' ? colors.primary[50] : 'white',
                  color: typeof config.height === 'number' ? colors.primary[600] : colors.text.secondary,
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Custom
              </button>
            </div>
            {typeof config.height === 'number' && (
              <input
                type="range"
                min="50"
                max="300"
                value={config.height}
                onChange={(e) => handleConfigUpdate('height', parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            )}
          </div>

          {/* Close Button Control */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              ❌ Close Button
            </h5>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.showCloseButton !== false}
                onChange={(e) => handleConfigUpdate('showCloseButton', e.target.checked)}
              />
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>Show Close Button</span>
            </label>
          </div>



          {/* Container Opacity */}
          {/* Banner Opacity */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              Banner Opacity
            </h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.opacity ?? 1}
                onChange={(e) => handleConfigUpdate('opacity', parseFloat(e.target.value))}
                style={{ width: '100%', marginBottom: '4px' }}
              />
              <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{Math.round((config.opacity ?? 1) * 100)}%</div>
            </div>
          </div>

          {/* Animation */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              ✨ Animation
            </h5>
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Type</label>
              <select
                value={config.animation?.type || 'slide'}
                onChange={(e) => handleNestedConfigUpdate('animation', 'type', e.target.value)}
                style={{ width: '100%', padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="slide">Slide</option>
                <option value="fade">Fade</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>
          </div>
        </>
      );
    };

    // Floater Configuration
    // Tooltip Configuration
    // Tooltip Configuration (Image-First Mode)
    function renderTooltipConfig() {
      if (selectedNudgeType !== 'tooltip') return null;

      const config = currentCampaign?.tooltipConfig || { mode: 'image' };

      const handleTooltipUpdate = (field: string, value: any) => {
        // Ensure we explicitly set mode to image if not present
        if (!config.mode) {
          useEditorStore.getState().updateTooltipConfig({ mode: 'image', [field]: value });
        } else {
          useEditorStore.getState().updateTooltipConfig({ [field]: value });
        }
      };

      // Helper to get selected page for elements
      const selectedPage = pages.find(p => p._id === config.targetPageId);

      // Wrapper for image upload to handle event type
      const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleImageUpload(e, 'tooltip_image_only');
      };

      return (
        <>
          {/* 1. Targeting (Preserved) */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎯 Target
            </h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Target Page</label>
              <select
                value={config.targetPageId || ''}
                onChange={(e) => handleTooltipUpdate('targetPageId', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="">Select a page...</option>
                {pages.map(page => (
                  <option key={page._id} value={page._id}>{page.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Target Element</label>
              <div style={{ position: 'relative' }}>
                {selectedPage && selectedPage.elements && selectedPage.elements.length > 0 ? (
                  <select
                    value={config.targetElementId || ''}
                    onChange={(e) => handleTooltipUpdate('targetElementId', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="">Select an element...</option>
                    {selectedPage.elements.map((el: any) => (
                      <option key={el.id} value={el.id}>
                        {el.id} {el.tagName ? `(${el.tagName})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: '8px 12px', border: `1px dashed ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', color: colors.text.secondary, background: colors.gray[50] }}>
                    {selectedPage ? 'No elements found on this page' : 'Select a page first'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. General (Name) */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>General</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Name</label>
              <input
                type="text"
                value={currentCampaign?.name || ''}
                onChange={(e) => updateCampaign({ name: e.target.value })}
                placeholder="Tooltip Campaign Name"
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          {/* 3. Image Content */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Image Content</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Image Source</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={config.imageUrl || ''}
                  onChange={(e) => handleTooltipUpdate('imageUrl', e.target.value)}
                  placeholder="https://example.com/tooltip.png"
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
                <label style={{ padding: '8px 12px', background: colors.primary[500], color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                  Upload
                  <input type="file" accept="image/*" onChange={onImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
            {config.imageUrl && (
              <div style={{ marginBottom: '12px', padding: '10px', background: colors.gray[50], borderRadius: '6px', border: `1px solid ${colors.gray[200]}` }}>
                <div style={{ height: '80px', backgroundImage: `url(${config.imageUrl})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', color: colors.text.secondary }}>Width</label>
                <span style={{ fontSize: '12px', color: colors.text.primary, fontWeight: 600 }}>{config.width || 150}px</span>
              </div>
              <input type="range" min="50" max="600" value={Number(config.width) || 150} onChange={(e) => handleTooltipUpdate('width', Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: colors.primary[500] }} />
            </div>
          </div>

          {/* 4. Positioning */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Positioning</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Placement</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['top', 'bottom', 'left', 'right'].map((pos) => (
                  <button key={pos} onClick={() => handleTooltipUpdate('position', pos)} style={{ padding: '8px', border: `1px solid ${config.position === pos ? colors.primary[500] : colors.gray[200]}`, borderRadius: '6px', background: config.position === pos ? colors.primary[50] : 'white', color: config.position === pos ? colors.primary[600] : colors.text.secondary, fontSize: '12px', fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>{pos}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Arrow</label>
                <select value={config.arrowPosition || 'auto'} onChange={(e) => handleTooltipUpdate('arrowPosition', e.target.value)} style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}>
                  <option value="auto">Auto</option><option value="center">Center</option><option value="left">Left</option><option value="right">Right</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Orientation</label>
                <select value={config.orientation || 'vertical'} onChange={(e) => handleTooltipUpdate('orientation', e.target.value)} style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}>
                  <option value="vertical">Vertical</option><option value="horizontal">Horizontal</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Offset X</label><input type="number" value={config.offsetX || 0} onChange={(e) => handleTooltipUpdate('offsetX', Number(e.target.value))} style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }} /></div>
              <div><label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Offset Y</label><input type="number" value={config.offsetY || 0} onChange={(e) => handleTooltipUpdate('offsetY', Number(e.target.value))} style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }} /></div>
            </div>
          </div>

          {/* 5. Appearance */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Appearance</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div><label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Roundness</label><input type="number" min="0" value={config.roundness ?? 8} onChange={(e) => handleTooltipUpdate('roundness', Number(e.target.value))} style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }} /></div>
              <div><label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Padding</label><input type="number" min="0" value={config.padding ?? 10} onChange={(e) => handleTooltipUpdate('padding', Number(e.target.value))} style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }} /></div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Background</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={config.backgroundColor || '#ffffff'} onChange={(e) => handleTooltipUpdate('backgroundColor', e.target.value)} style={{ width: '40px', height: '40px', border: '1px solid #e5e7eb', cursor: 'pointer', borderRadius: '4px', padding: 0 }} />
                <div style={{ flex: 1 }}>
                  <input type="range" min="0" max="1" step="0.1" value={config.backgroundOpacity ?? 1} onChange={(e) => handleTooltipUpdate('backgroundOpacity', Number(e.target.value))} style={{ width: '100%', accentColor: colors.primary[500] }} />
                  <div style={{ fontSize: '10px', color: colors.text.secondary, textAlign: 'right' }}>Opacity: {Math.round((config.backgroundOpacity ?? 1) * 100)}%</div>
                </div>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Shadow</label>
              <select value={config.shadow || 'none'} onChange={(e) => handleTooltipUpdate('shadow', e.target.value)} style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}>
                <option value="none">None</option><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option><option value="xl">Extra Large</option>
              </select>
            </div>
          </div>

          {/* 6. Behavior */}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Behavior</h5>
            {[
              { key: 'closeOnOutsideClick', label: 'Close on Outside Click' },
              { key: 'keepTargetClickable', label: 'Keep Target Clickable' },
              { key: 'closeOnTargetClick', label: 'Close on Target Click' }
            ].map(item => (
              <label key={item.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', cursor: 'pointer', padding: '4px 0' }}>
                <span style={{ fontSize: '12px', color: colors.text.secondary }}>{item.label}</span>
                <input type="checkbox" checked={!!config[item.key as keyof typeof config]} onChange={(e) => handleTooltipUpdate(item.key, e.target.checked)} style={{ accentColor: colors.primary[500] }} />
              </label>
            ))}
          </div>
        </>
      );
    }

    function renderTooltipConfig_LEGACY() {
      if (selectedNudgeType !== 'tooltip') return null;

      const config = currentCampaign?.tooltipConfig || {};

      const handleTooltipUpdate = (field: string, value: any) => {
        updateTooltipConfig({ [field]: value });
      };

      // Show tooltip config when:
      // 1. Tooltip container is selected
      // 2. No layer is selected
      const isTooltipContainer = selectedLayerObj?.type === 'container' && selectedLayerObj?.name === 'Tooltip Container';
      const shouldShowFullConfig = !selectedLayerObj || isTooltipContainer;

      if (!shouldShowFullConfig) return null;

      return (
        <>
          {/* Target Selection */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎯 Target
            </h5>

            {/* Page Selection */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Target Page</label>
              <select
                value={config.targetPageId || ''}
                onChange={(e) => handleTooltipUpdate('targetPageId', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="">Select a page...</option>
                {pages.map(page => (
                  <option key={page._id} value={page._id}>{page.name}</option>
                ))}
              </select>
            </div>

            {/* Element Selection */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Target Element</label>
              <div style={{ position: 'relative' }}>
                {selectedPage && selectedPage.elements && selectedPage.elements.length > 0 ? (
                  <select
                    value={config.targetElementId || ''}
                    onChange={(e) => handleTooltipUpdate('targetElementId', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="">Select an element...</option>
                    {selectedPage.elements.map((el: any) => (
                      <option key={el.id} value={el.id}>
                        {el.id} {el.tagName ? `(${el.tagName})` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: '8px 12px', border: `1px dashed ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', color: colors.text.secondary, background: colors.gray[50] }}>
                    {selectedPage ? 'No elements found on this page' : 'Select a page first'}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '11px', color: colors.text.secondary, marginTop: '4px' }}>
                Enter the ID of the EmbedWidgetWrapper in your app.
              </div>
            </div>

            {/* Position */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Position</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['top', 'bottom', 'left', 'right'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handleTooltipUpdate('position', pos)}
                    style={{
                      padding: '8px',
                      border: `1px solid ${config.position === pos ? colors.primary[500] : colors.gray[200]}`,
                      borderRadius: '6px',
                      background: config.position === pos ? colors.primary[50] : 'white',
                      color: config.position === pos ? colors.primary[600] : colors.text.secondary,
                      fontSize: '12px',
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
          </div>
          {/* Offsets (Fine Tuning) */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px dashed ${colors.gray[200]}` }}>
            <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '6px' }}>Fine Tune Position (px)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: colors.text.secondary, marginBottom: '2px' }}>Offset X</label>
                <input
                  type="number"
                  value={config.offsetX || 0}
                  onChange={(e) => handleTooltipUpdate('offsetX', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: colors.text.secondary, marginBottom: '2px' }}>Offset Y</label>
                <input
                  type="number"
                  value={config.offsetY || 0}
                  onChange={(e) => handleTooltipUpdate('offsetY', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Size */}
          {/* Size */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              📏 Size
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {['width', 'height'].map((field) => {
                const label = field.charAt(0).toUpperCase() + field.slice(1);
                // Safely access config value
                const val = (config as any)[field] || (field === 'width' ? 'max-content' : 'auto');

                // Determine current unit and numeric value
                const strVal = String(val);
                const isPercent = strVal.endsWith('%');
                const isPx = !isPercent; // Default to px for anything else (numbers, "px", "auto", etc.)

                // Extract number: "50%" -> 50, "100px" -> 100, 100 -> 100, "auto" -> ""
                const numVal = parseInt(strVal) || '';

                return (
                  <div key={field}>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '2px' }}>{label}</label>
                    <div style={{ display: 'flex', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', overflow: 'hidden' }}>
                      <input
                        type="number"
                        value={numVal}
                        placeholder={field === 'width' ? 'Auto' : 'Auto'}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          const unit = isPercent ? '%' : 'px';
                          // If empty, set to undefined/auto/max-content? Let's use empty string or null to fallback to default in renderer
                          // But renderer uses config.width || 'max-content'. So if I set '', it goes to default.
                          handleTooltipUpdate(field, newVal ? `${newVal}${unit}` : '');
                        }}
                        style={{ flex: 1, border: 'none', padding: '6px', fontSize: '12px', outline: 'none' }}
                      />
                      <div style={{ display: 'flex', borderLeft: `1px solid ${colors.gray[200]}` }}>
                        <button
                          onClick={() => handleTooltipUpdate(field, numVal ? `${numVal}px` : '300px')}
                          style={{
                            padding: '0 6px',
                            background: isPx ? colors.primary[50] : 'white',
                            color: isPx ? colors.primary[600] : colors.text.secondary,
                            border: 'none',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                        >
                          PX
                        </button>
                        <button
                          onClick={() => handleTooltipUpdate(field, numVal ? `${numVal}%` : '50%')}
                          style={{
                            padding: '0 6px',
                            background: isPercent ? colors.primary[50] : 'white',
                            color: isPercent ? colors.primary[600] : colors.text.secondary,
                            border: 'none',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            borderLeft: `1px solid ${colors.gray[200]}`
                          }}
                        >
                          %
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Content Mode (New Feature) */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🖼️ Content
            </h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Mode</label>
              <div style={{ display: 'flex', background: colors.gray[100], padding: '2px', borderRadius: '6px' }}>
                {['standard', 'image', 'advanced', 'html'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      handleTooltipUpdate('mode', mode);
                      if (mode === 'image') {
                        // Auto-clear background and shadow for cleaner PNG look
                        handleTooltipUpdate('backgroundColor', 'transparent');
                        handleTooltipUpdate('boxShadow', 'none');

                        // FIX: Explicitly clear layer styles too, as they now have priority over config
                        if (tooltipContainerLayer) {
                          updateLayer(tooltipContainerLayer.id, {
                            style: {
                              ...tooltipContainerLayer.style,
                              backgroundColor: undefined,
                              boxShadow: undefined,
                              border: undefined
                            }
                          });
                        }
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '6px',
                      border: 'none',
                      borderRadius: '4px',
                      background: (config.mode || 'standard') === mode ? 'white' : 'transparent',
                      color: (config.mode || 'standard') === mode ? colors.primary[600] : colors.text.secondary,
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      boxShadow: (config.mode || 'standard') === mode ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      textTransform: 'capitalize'
                    }}
                  >
                    {mode === 'standard' ? 'Standard (Layers)' : 'Image Only'}
                  </button>
                ))}
              </div>
            </div>

            {
              config.mode === 'image' && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Tooltip Image</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={config.imageUrl || ''}
                        onChange={(e) => handleTooltipUpdate('imageUrl', e.target.value)}
                        placeholder="Enter image URL..."
                        style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                      />
                      <label style={{
                        padding: '8px 12px',
                        background: colors.primary[500],
                        color: 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        whiteSpace: 'nowrap'
                      }}>
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            // Mock upload for now or reuse existing handler if possible, 
                            // but for this snippet I'll assumme a direct URL update logic or add a basic handler inline if simple.
                            // Leveraging handleImageUpload from parent scope if available? 
                            // Yes, handleImageUpload exists in scope.
                            handleImageUpload(e, 'tooltip_image_only');
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                    {config.imageUrl && (
                      <div style={{
                        width: '100%',
                        height: '100px',
                        borderRadius: '6px',
                        background: `url(${config.imageUrl}) center/cover no-repeat`,
                        border: `1px solid ${colors.gray[200]}`
                      }} />
                    )}
                  </div>

                </>
              )
            }
          </div>

          {/* Advanced Mode: Brand of the Day Panel */}
          {
            config.mode === 'advanced' && (
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✨ Advanced Style
                </h5>

                {/* Gradient */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Gradient Flow</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <input type="color" value={config.gradientWith || '#84cc16'} onChange={(e) => handleTooltipUpdate('gradientWith', e.target.value)} style={{ width: '100%', height: '30px' }} />
                    <input type="color" value={config.gradientTo || '#15803d'} onChange={(e) => handleTooltipUpdate('gradientTo', e.target.value)} style={{ width: '100%', height: '30px' }} />
                  </div>
                  <input type="range" min="0" max="360" value={config.gradientAngle || 45} onChange={(e) => handleTooltipUpdate('gradientAngle', Number(e.target.value))} style={{ width: '100%' }} />
                </div>

                {/* Arrow Style */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Arrow Style</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleTooltipUpdate('arrowStyle', 'triangle')}
                      style={{ padding: '6px', border: `1px solid ${config.arrowStyle === 'bubble' ? colors.gray[200] : colors.primary[500]}`, borderRadius: '4px', background: config.arrowStyle !== 'bubble' ? colors.primary[50] : 'white' }}
                    >Triangle</button>
                    <button
                      onClick={() => handleTooltipUpdate('arrowStyle', 'bubble')}
                      style={{ padding: '6px', border: `1px solid ${config.arrowStyle === 'bubble' ? colors.primary[500] : colors.gray[200]}`, borderRadius: '4px', background: config.arrowStyle === 'bubble' ? colors.primary[50] : 'white' }}
                    >Speech Bubble</button>
                  </div>
                </div>
              </div>
            )
          }

          {/* HTML Mode: Code Editor */}
          {
            config.mode === 'html' && (
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💻 Custom HTML
                </h5>
                <textarea
                  value={config.htmlContent || '<div style="padding:10px; background:white; color:black; border-radius:8px;">Hello World</div>'}
                  onChange={(e) => handleTooltipUpdate('htmlContent', e.target.value)}
                  style={{
                    width: '100%',
                    height: '200px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '8px',
                    border: `1px solid ${colors.gray[300]}`,
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                  placeholder="Enter HTML/CSS here..."
                />
              </div>
            )
          }

          {/* Appearance */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎨 Appearance
            </h5>

            {/* Roundness */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Roundness</label>
              <input
                type="range"
                min="0"
                max="24"
                value={config.borderRadius || 8}
                onChange={(e) => handleTooltipUpdate('borderRadius', parseInt(e.target.value))}
                style={{ width: '100%', marginBottom: '4px' }}
              />
              <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{config.borderRadius || 8}px</div>
            </div>

            {/* Padding */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Padding</label>
              <input
                type="range"
                min="0"
                max="32"
                value={config.padding || 12}
                onChange={(e) => handleTooltipUpdate('padding', parseInt(e.target.value))}
                style={{ width: '100%', marginBottom: '4px' }}
              />
              <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{config.padding || 12}px</div>
            </div>
          </div>



          {/* Overlay & Highlight */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎭 Overlay & Highlight
            </h5>

            {/* Overlay Color */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Overlay Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.overlayColor || '#000000'}
                  onChange={(e) => handleTooltipUpdate('overlayColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={config.overlayColor || '#000000'}
                  onChange={(e) => handleTooltipUpdate('overlayColor', e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Overlay Opacity */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Overlay Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.overlayOpacity ?? 0.5}
                onChange={(e) => handleTooltipUpdate('overlayOpacity', parseFloat(e.target.value))}
                style={{ width: '100%', marginBottom: '4px' }}
              />
              <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{Math.round((config.overlayOpacity ?? 0.5) * 100)}%</div>
            </div>

            {/* Target Highlight Color */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Highlight Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.targetHighlightColor || '#FFFFFF'}
                  onChange={(e) => handleTooltipUpdate('targetHighlightColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={config.targetHighlightColor || '#FFFFFF'}
                  onChange={(e) => handleTooltipUpdate('targetHighlightColor', e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            {/* Target Padding */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Highlight Padding</label>
              <input
                type="range"
                min="0"
                max="24"
                value={config.targetHighlightPadding || 4}
                onChange={(e) => handleTooltipUpdate('targetHighlightPadding', parseInt(e.target.value))}
                style={{ width: '100%', marginBottom: '4px' }}
              />
              <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{config.targetHighlightPadding || 4}px</div>
            </div>

            {/* Target Roundness */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Highlight Roundness</label>
              <input
                type="range"
                min="0"
                max="50"
                value={config.targetRoundness || 4}
                onChange={(e) => handleTooltipUpdate('targetRoundness', parseInt(e.target.value))}
                style={{ width: '100%', marginBottom: '4px' }}
              />
              <div style={{ fontSize: '12px', color: colors.text.primary, textAlign: 'right' }}>{config.targetRoundness || 4}px</div>
            </div>
          </div>
        </>
      );
    };

    const renderFloaterConfig = () => {
      if (selectedNudgeType !== 'floater') return null;

      const config = currentCampaign?.floaterConfig || {
        mode: 'default',
        shape: 'circle',
        position: 'bottom-right',
        width: 60,
        height: 60,
        backgroundColor: '#10B981',
        glassmorphism: { enabled: false, blur: 10, opacity: 0.2 },
        gradient: { enabled: false, startColor: '#10B981', endColor: '#059669', angle: 45 },
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
      };

      const handleConfigUpdate = (field: string, value: any) => {
        // If updating mode to image-only, ensure shape is circle by default or keep current?
        // If updating shape to circle, force width=height?
        const updates: any = { [field]: value };

        if (field === 'shape' && value === 'circle') {
          // If switching to circle, maybe sync width/height?
          // For now, let user decide or use defaults in renderer
        }

        // Update store
        useEditorStore.getState().updateFloaterConfig(updates);
      };

      const handleNestedConfigUpdate = (parent: 'glassmorphism' | 'gradient' | 'animation', field: string, value: any) => {
        const parentObj = config[parent] as any || {};
        useEditorStore.getState().updateFloaterConfig({ [parent]: { ...parentObj, [field]: value } });
      };

      return (
        <>
          {/* Mode Selection */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              🎨 Floater Mode
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleConfigUpdate('mode', 'default')}
                style={{
                  padding: '12px',
                  border: `2px solid ${(config.mode || 'default') === 'default' ? colors.primary[500] : colors.gray[200]}`,
                  borderRadius: '8px',
                  background: (config.mode || 'default') === 'default' ? colors.primary[50] : 'white',
                  color: (config.mode || 'default') === 'default' ? colors.primary[600] : colors.text.secondary,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Default
              </button>
              <button
                onClick={() => {
                  handleConfigUpdate('mode', 'image-only');
                  handleConfigUpdate('shape', 'rectangle'); // Auto-set to rectangle

                  // Reset container styles for image-only mode
                  const floaterContainer = currentCampaign?.layers?.find((l: any) => l.type === 'container' && l.name === 'Floater Container');
                  if (floaterContainer) {
                    updateLayerStyle(floaterContainer.id, {
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      borderRadius: 0
                    });
                  }
                }}
                style={{
                  padding: '12px',
                  border: `2px solid ${config.mode === 'image-only' ? colors.primary[500] : colors.gray[200]}`,
                  borderRadius: '8px',
                  background: config.mode === 'image-only' ? colors.primary[50] : 'white',
                  color: config.mode === 'image-only' ? colors.primary[600] : colors.text.secondary,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Image Only
              </button>
            </div>
          </div >

          {/* Background Image (Image-Only Mode) */}
          {
            config.mode === 'image-only' && (
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
                  🖼️ Floater Image
                </h5>

                {/* Image Preview */}
                {config.backgroundImageUrl && (
                  <div style={{
                    width: '100%',
                    height: '100px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '12px',
                    border: `1px solid ${colors.gray[200]}`,
                    position: 'relative'
                  }}>
                    <img
                      src={config.backgroundImageUrl}
                      alt="Floater preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        backgroundColor: '#f0f0f0'
                      }}
                    />
                    <button
                      onClick={() => handleConfigUpdate('backgroundImageUrl', '')}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  border: `2px dashed ${colors.gray[200]}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: colors.gray[50],
                  transition: 'all 0.2s'
                }}>
                  <Upload size={20} color={colors.text.secondary} style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '12px', color: colors.text.secondary, fontWeight: 500 }}>
                    {config.backgroundImageUrl ? 'Change Image' : 'Upload Image'}
                  </span>
                  <span style={{ fontSize: '10px', color: colors.text.secondary, marginTop: '4px' }}>
                    PNG, JPG, GIF (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      if (file.size > 5 * 1024 * 1024) {
                        // toast.error('Image size must be less than 5MB');
                        alert('Image size must be less than 5MB');
                        return;
                      }

                      const reader = new FileReader();
                      reader.onload = (event) => {
                        handleConfigUpdate('backgroundImageUrl', event.target?.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            )
          }

          {/* Image URL Input (Image-Only Mode) */}
          {
            config.mode === 'image-only' && (
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
                  🔗 Image URL
                </h5>
                <input
                  type="text"
                  placeholder="https://example.com/image.png"
                  value={config.backgroundImageUrl || ''}
                  onChange={(e) => handleConfigUpdate('backgroundImageUrl', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${colors.gray[200]}`,
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
              </div>
            )
          }

          {/* Size Control */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
                📏 Size
              </h5>
              <div style={{ display: 'flex', background: colors.gray[100], borderRadius: '4px', padding: '2px' }}>
                <button
                  onClick={() => handleConfigUpdate('sizeUnit', 'px')}
                  style={{
                    padding: '2px 8px',
                    fontSize: '10px',
                    borderRadius: '3px',
                    border: 'none',
                    background: (config.sizeUnit || 'px') === 'px' ? 'white' : 'transparent',
                    boxShadow: (config.sizeUnit || 'px') === 'px' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  PX
                </button>
                <button
                  onClick={() => handleConfigUpdate('sizeUnit', '%')}
                  style={{
                    padding: '2px 8px',
                    fontSize: '10px',
                    borderRadius: '3px',
                    border: 'none',
                    background: config.sizeUnit === '%' ? 'white' : 'transparent',
                    boxShadow: config.sizeUnit === '%' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  %
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                  Width {(config.sizeUnit || 'px') === '%' ? '(%)' : '(px)'}
                </label>
                <input
                  type="number"
                  value={config.width || 60}
                  onChange={(e) => handleConfigUpdate('width', Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                  Height {(config.sizeUnit || 'px') === '%' ? '(%)' : '(px)'}
                </label>
                <input
                  type="number"
                  value={config.height || 60}
                  onChange={(e) => handleConfigUpdate('height', Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Shape Selection - Hide in Image Only mode if user wants "no circle" */}
          {
            config.mode !== 'image-only' && (
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
                <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
                  📐 Shape
                </h5>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleConfigUpdate('shape', 'circle')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: `1px solid ${config.shape === 'circle' ? colors.primary[500] : colors.gray[200]}`,
                      borderRadius: '6px',
                      background: config.shape === 'circle' ? colors.primary[50] : 'white',
                      color: config.shape === 'circle' ? colors.primary[600] : colors.text.secondary,
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Circle (FAB)
                  </button>
                  <button
                    onClick={() => handleConfigUpdate('shape', 'rectangle')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: `1px solid ${config.shape === 'rectangle' ? colors.primary[500] : colors.gray[200]}`,
                      borderRadius: '6px',
                      background: config.shape === 'rectangle' ? colors.primary[50] : 'white',
                      color: config.shape === 'rectangle' ? colors.primary[600] : colors.text.secondary,
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Rectangle
                  </button>
                </div>
              </div>
            )
          }

          {/* Position Control */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              📍 Position
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              {['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center-left', 'center-right'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => handleConfigUpdate('position', pos)}
                  style={{
                    padding: '8px',
                    border: `1px solid ${config.position === pos ? colors.primary[500] : colors.gray[200]}`,
                    borderRadius: '6px',
                    background: config.position === pos ? colors.primary[50] : 'white',
                    color: config.position === pos ? colors.primary[600] : colors.text.secondary,
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {pos.replace('-', ' ')}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Offset X</label>
                <input type="number" value={config.offsetX || 20} onChange={(e) => handleConfigUpdate('offsetX', Number(e.target.value))} style={{ width: '100%', padding: '4px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Offset Y</label>
                <input type="number" value={config.offsetY || 20} onChange={(e) => handleConfigUpdate('offsetY', Number(e.target.value))} style={{ width: '100%', padding: '4px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px' }} />
              </div>
            </div>
          </div>

          {/* Styling - Glassmorphism & Gradient */}
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              ✨ Styling
            </h5>

            {/* Glassmorphism Toggle */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: colors.text.secondary }}>Glassmorphism</span>
                <input type="checkbox" checked={config.glassmorphism?.enabled} onChange={(e) => handleNestedConfigUpdate('glassmorphism', 'enabled', e.target.checked)} />
              </label>
              {config.glassmorphism?.enabled && (
                <div style={{ paddingLeft: '8px', borderLeft: `2px solid ${colors.gray[200]}` }}>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary }}>Blur ({config.glassmorphism.blur}px)</label>
                    <input type="range" min="0" max="20" value={config.glassmorphism.blur} onChange={(e) => handleNestedConfigUpdate('glassmorphism', 'blur', Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary }}>Opacity ({Math.round(config.glassmorphism.opacity * 100)}%)</label>
                    <input type="range" min="0" max="1" step="0.1" value={config.glassmorphism.opacity} onChange={(e) => handleNestedConfigUpdate('glassmorphism', 'opacity', Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Gradient Toggle */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: colors.text.secondary }}>Gradient Background</span>
                <input type="checkbox" checked={config.gradient?.enabled} onChange={(e) => handleNestedConfigUpdate('gradient', 'enabled', e.target.checked)} />
              </label>
              {config.gradient?.enabled && (
                <div style={{ paddingLeft: '8px', borderLeft: `2px solid ${colors.gray[200]}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary }}>Start</label>
                    <input type="color" value={config.gradient.startColor} onChange={(e) => handleNestedConfigUpdate('gradient', 'startColor', e.target.value)} style={{ width: '100%', height: '30px', border: 'none', padding: 0 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary }}>End</label>
                    <input type="color" value={config.gradient.endColor} onChange={(e) => handleNestedConfigUpdate('gradient', 'endColor', e.target.value)} style={{ width: '100%', height: '30px', border: 'none', padding: 0 }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary }}>Angle ({config.gradient.angle}deg)</label>
                    <input type="range" min="0" max="360" value={config.gradient.angle} onChange={(e) => handleNestedConfigUpdate('gradient', 'angle', Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      );
    };

    // PIP Configuration (Phase 13)
    function renderPipConfig() { // Converted to function declaration for hoisting
      if (selectedNudgeType !== 'pip') return null;

      const config = currentCampaign?.pipConfig || {};

      const handleConfigUpdate = (field: string, value: any) => {
        updatePipConfig({ [field]: value });
      };

      // Show PIP config when:
      // 1. PIP container is selected
      // 2. No layer is selected
      const isPipContainerSelected = selectedLayerObj?.type === 'container' && selectedLayerObj?.name === 'PIP Container';
      const shouldShowFullConfig = !selectedLayerObj || isPipContainerSelected;

      if (!shouldShowFullConfig) return null;

      return (
        <>
          <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${colors.gray[200]}` }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
              📺 PIP Settings
            </h5>

            {/* CTA Text - Removed (Use Button Layer Properties) */}
            {/* CTA URL - Removed (Use Button Layer Properties) */}

            {/* Position - Removed (Use Standard Layer Properties) */}

            {/* Background Color - Removed (Use Standard Layer Properties) */}
            {/* Corner Radius - Removed (Use Standard Layer Properties) */}

            {/* Show Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: colors.text.secondary }}>Show Close Button</span>
              <div
                onClick={() => handleConfigUpdate('showCloseButton', config.showCloseButton !== false ? false : true)}
                style={{
                  width: '44px', height: '24px', borderRadius: '12px',
                  background: config.showCloseButton !== false ? colors.primary[500] : colors.gray[300],
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: config.showCloseButton !== false ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
              </div>
            </div>
          </div>
        </>
      );
    };

    // Helper to render Size controls
    const renderSizeControls = () => {
      const parseValue = (val: any) => {
        if (val === 'auto' || val === undefined) return { num: '', unit: 'auto' };
        if (val === '100%') return { num: '100', unit: '%' };
        const str = String(val);
        if (str.endsWith('%')) return { num: parseFloat(str), unit: '%' };
        return { num: parseFloat(str), unit: 'px' };
      };

      return (
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Size</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {/* Width */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: colors.text.secondary, marginBottom: '2px' }}>Width</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <select
                  value={(() => {
                    const w = selectedLayerObj?.style?.width;
                    if (w === 'auto' || w === undefined) return 'auto';
                    return 'custom';
                  })()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'auto') handleStyleUpdate('width', 'auto');
                    else if (val === 'custom') {
                      const current = parseValue(selectedLayerObj?.style?.width);
                      handleStyleUpdate('width', current.num ? `${current.num}${current.unit === 'auto' ? 'px' : current.unit}` : 200);
                    }
                  }}
                  style={{ flex: 1, padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                >
                  <option value="auto">Auto</option>
                  <option value="custom">Custom</option>
                </select>
                {selectedLayerObj?.style?.width !== 'auto' && selectedLayerObj?.style?.width !== undefined && (
                  <>
                    <input
                      type="number"
                      value={parseValue(selectedLayerObj?.style?.width).num}
                      onChange={(e) => {
                        const unit = parseValue(selectedLayerObj?.style?.width).unit;
                        handleStyleUpdate('width', `${e.target.value}${unit === 'auto' ? 'px' : unit}`);
                      }}
                      style={{ width: '50px', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                    />
                    <select
                      value={parseValue(selectedLayerObj?.style?.width).unit}
                      onChange={(e) => {
                        const num = parseValue(selectedLayerObj?.style?.width).num || 0;
                        handleStyleUpdate('width', `${num}${e.target.value}`);
                      }}
                      style={{ width: '45px', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                    >
                      <option value="px">px</option>
                      <option value="%">%</option>
                    </select>
                  </>
                )}
              </div>
            </div>

            {/* Height */}
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: colors.text.secondary, marginBottom: '2px' }}>Height</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <select
                  value={(() => {
                    const h = selectedLayerObj?.style?.height;
                    if (h === 'auto' || h === undefined) return 'auto';
                    return 'custom';
                  })()}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'auto') handleStyleUpdate('height', 'auto');
                    else if (val === 'custom') {
                      const current = parseValue(selectedLayerObj?.style?.height);
                      handleStyleUpdate('height', current.num ? `${current.num}${current.unit === 'auto' ? 'px' : current.unit}` : 48);
                    }
                  }}
                  style={{ flex: 1, padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                >
                  <option value="auto">Auto</option>
                  <option value="custom">Custom</option>
                </select>
                {selectedLayerObj?.style?.height !== 'auto' && selectedLayerObj?.style?.height !== undefined && (
                  <>
                    <input
                      type="number"
                      value={parseValue(selectedLayerObj?.style?.height).num}
                      onChange={(e) => {
                        const unit = parseValue(selectedLayerObj?.style?.height).unit;
                        handleStyleUpdate('height', `${e.target.value}${unit === 'auto' ? 'px' : unit}`);
                      }}
                      style={{ width: '50px', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                    />
                    <select
                      value={parseValue(selectedLayerObj?.style?.height).unit}
                      onChange={(e) => {
                        const num = parseValue(selectedLayerObj?.style?.height).num || 0;
                        handleStyleUpdate('height', `${num}${e.target.value}`);
                      }}
                      style={{ width: '45px', padding: '6px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                    >
                      <option value="px">px</option>
                      <option value="%">%</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    };

    // Common style properties
    const renderCommonStyles = () => {
      const bgColor = selectedLayerObj?.style?.backgroundColor || '#FFFFFF';
      const hasBorder = selectedLayerObj?.style?.borderWidth
        ? typeof selectedLayerObj.style.borderWidth === 'number'
          ? selectedLayerObj.style.borderWidth > 0
          : (selectedLayerObj.style.borderWidth.top > 0 ||
            selectedLayerObj.style.borderWidth.right > 0 ||
            selectedLayerObj.style.borderWidth.bottom > 0 ||
            selectedLayerObj.style.borderWidth.left > 0)
        : false;
      const positionType = selectedLayerObj?.position?.type || 'relative';
      const posX = selectedLayerObj?.position?.x || 0;
      const posY = selectedLayerObj?.position?.y || 0;

      const parentLayer = campaignLayers.find(l => l.id === selectedLayerObj.parent);
      const isPipLayer = parentLayer?.name === 'PIP Container';
      const isTooltipContainer = selectedLayerObj?.name === 'Tooltip Container' && selectedNudgeType === 'tooltip';

      return (
        <>
          {/* Position Controls (Fix 6) */}
          {!isTooltipContainer && (
            <div style={{ borderTop: `1px solid ${colors.gray[200]}`, paddingTop: '16px', marginBottom: '20px' }}>
              <PositionEditor
                style={selectedLayerObj.style || {}}
                onChange={(updates) => updateLayerStyle(selectedLayerId!, updates)}
                colors={colors}
                showZIndex={!isPipLayer}
                showCoordinates={!isPipLayer}
                showPositionType={!isPipLayer}
              />
            </div>
          )}

          <div style={{ borderTop: `1px solid ${colors.gray[200]}`, paddingTop: '16px', marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Background</h5>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                style={{ width: '40px', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Shape Editor (Added to Common Styles) */}
          <div style={{ borderTop: `1px solid ${colors.gray[200]}`, paddingTop: '16px', marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Shapes & Borders</h5>
            <ShapeEditor
              style={selectedLayerObj.style || {}}
              onChange={(updates) => updateLayerStyle(selectedLayerId!, updates)}
              colors={colors}
            />
          </div>

          <div style={{ borderTop: `1px solid ${colors.gray[200]}`, paddingTop: '16px', marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Border</h5>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: colors.text.primary }}>Add Border</span>
              <div
                onClick={() => handleStyleUpdate('borderWidth', hasBorder ? 0 : 1)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: hasBorder ? colors.primary[500] : colors.gray[300],
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: '2px',
                  left: hasBorder ? '22px' : '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s'
                }} />
              </div>
            </div>
            {hasBorder && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                    Border Width: {typeof selectedLayerObj?.style?.borderWidth === 'number' ? selectedLayerObj.style.borderWidth : 1}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={typeof selectedLayerObj?.style?.borderWidth === 'number' ? selectedLayerObj.style.borderWidth : 1}
                    onChange={(e) => handleStyleUpdate('borderWidth', Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Border Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={selectedLayerObj?.style?.borderColor || '#000000'}
                      onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                      style={{ width: '40px', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={selectedLayerObj?.style?.borderColor || '#000000'}
                      onChange={(e) => handleStyleUpdate('borderColor', e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Border Style</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {['solid', 'dashed', 'dotted'].map((style) => (
                      <button
                        key={style}
                        onClick={() => handleStyleUpdate('borderStyle', style)}
                        style={{
                          padding: '8px',
                          border: `1px solid ${(selectedLayerObj?.style?.borderStyle || 'solid') === style ? colors.primary[500] : colors.gray[200]}`,
                          borderRadius: '6px',
                          background: (selectedLayerObj?.style?.borderStyle || 'solid') === style ? colors.primary[50] : 'white',
                          color: (selectedLayerObj?.style?.borderStyle || 'solid') === style ? colors.primary[600] : colors.text.secondary,
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Filter Controls (Feature 5) */}
          <div style={{ borderTop: `1px solid ${colors.gray[200]}`, paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Filters</h5>
              {(selectedLayerObj?.style?.filter?.blur || selectedLayerObj?.style?.filter?.brightness || selectedLayerObj?.style?.filter?.contrast || selectedLayerObj?.style?.filter?.grayscale) && (
                <button
                  onClick={() => handleStyleUpdate('filter', {})}
                  style={{
                    padding: '4px 8px',
                    border: `1px solid ${colors.gray[200]}`,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: colors.text.secondary
                  }}
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Blur */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Blur: {selectedLayerObj?.style?.filter?.blur || 0}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={selectedLayerObj?.style?.filter?.blur || 0}
                onChange={(e) => {
                  const currentFilter = selectedLayerObj?.style?.filter || {};
                  handleStyleUpdate('filter', { ...currentFilter, blur: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Brightness */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Brightness: {selectedLayerObj?.style?.filter?.brightness || 100}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={selectedLayerObj?.style?.filter?.brightness || 100}
                onChange={(e) => {
                  const currentFilter = selectedLayerObj?.style?.filter || {};
                  handleStyleUpdate('filter', { ...currentFilter, brightness: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Contrast */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Contrast: {selectedLayerObj?.style?.filter?.contrast || 100}%
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={selectedLayerObj?.style?.filter?.contrast || 100}
                onChange={(e) => {
                  const currentFilter = selectedLayerObj?.style?.filter || {};
                  handleStyleUpdate('filter', { ...currentFilter, contrast: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Grayscale */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Grayscale: {selectedLayerObj?.style?.filter?.grayscale || 0}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedLayerObj?.style?.filter?.grayscale || 0}
                onChange={(e) => {
                  const currentFilter = selectedLayerObj?.style?.filter || {};
                  handleStyleUpdate('filter', { ...currentFilter, grayscale: Number(e.target.value) });
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Transform Controls (Feature 6) */}
          <div style={{ borderTop: `1px solid ${colors.gray[200]}`, paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Transform</h5>
              {(selectedLayerObj?.style?.transform?.rotate || selectedLayerObj?.style?.transform?.scale || selectedLayerObj?.style?.transform?.translateX || selectedLayerObj?.style?.transform?.translateY) && (
                <button
                  onClick={() => handleStyleUpdate('transform', {})}
                  style={{
                    padding: '4px 8px',
                    border: `1px solid ${colors.gray[200]}`,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: colors.text.secondary
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Rotation */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Rotate: {selectedLayerObj?.style?.transform?.rotate || 0}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={selectedLayerObj?.style?.transform?.rotate || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const currentTransform = selectedLayerObj?.style?.transform || {};
                  handleStyleUpdate('transform', { ...currentTransform, rotate: val });
                  // Sync to main config for SDK compatibility
                  if (selectedLayerObj.name === 'Tooltip Container') {
                    handleTooltipUpdate('rotate', val);
                  }
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {[-90, -45, 0, 45, 90, 180].map(angle => (
                  <button
                    key={angle}
                    onClick={() => {
                      const currentTransform = selectedLayerObj?.style?.transform || {};
                      handleStyleUpdate('transform', { ...currentTransform, rotate: angle });
                      // Sync to main config for SDK compatibility
                      if (selectedLayerObj.name === 'Tooltip Container') {
                        handleTooltipUpdate('rotate', angle);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      border: `1px solid ${colors.gray[200]}`,
                      borderRadius: '4px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      backgroundColor: (selectedLayerObj?.style?.transform?.rotate || 0) === angle ? colors.gray[100] : 'transparent'
                    }}
                  >
                    {angle}°
                  </button>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Scale: {selectedLayerObj?.style?.transform?.scale || 1}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={selectedLayerObj?.style?.transform?.scale || 1}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const currentTransform = selectedLayerObj?.style?.transform || {};
                  handleStyleUpdate('transform', { ...currentTransform, scale: val });
                  // Sync to main config for SDK compatibility
                  if (selectedLayerObj.name === 'Tooltip Container') {
                    handleTooltipUpdate('scale', val);
                  }
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>


          </div>

          {/* Advanced Shadow Builder (Feature 7) */}
          <div style={{ borderTop: `1px solid ${colors.gray[200]}`, paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Box Shadow</h5>
              {selectedLayerObj?.style?.boxShadow && (
                <button
                  onClick={() => handleStyleUpdate('boxShadow', undefined)}
                  style={{
                    padding: '4px 8px',
                    border: `1px solid ${colors.gray[200]}`,
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: colors.text.secondary
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Shadow Presets */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Quick Presets</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[
                  { name: 'Soft', value: '0 2px 8px rgba(0,0,0,0.1)' },
                  { name: 'Medium', value: '0 4px 12px rgba(0,0,0,0.15)' },
                  { name: 'Hard', value: '0 8px 24px rgba(0,0,0,0.25)' },
                  { name: 'Glow', value: '0 0 20px rgba(99, 102, 241, 0.5)' },
                  { name: 'Inner', value: 'inset 0 2px 4px rgba(0,0,0,0.1)' },
                  { name: 'Lifted', value: '0 10px 40px rgba(0,0,0,0.2)' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleStyleUpdate('boxShadow', preset.value)}
                    style={{
                      padding: '8px 12px',
                      border: `1px solid ${colors.gray[200]}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: selectedLayerObj?.style?.boxShadow === preset.value ? colors.primary[50] : 'white',
                      color: selectedLayerObj?.style?.boxShadow === preset.value ? colors.primary[600] : colors.text.primary,
                      boxShadow: preset.value,
                      transition: 'all 0.2s'
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Shadow Builder */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '6px' }}>Custom Shadow</label>
              <div style={{
                padding: '12px',
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: '8px',
                backgroundColor: colors.gray[50]
              }}>
                {/* X Offset */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                    X Offset: 0px
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    defaultValue="0"
                    onChange={(e) => {
                      const xOffset = Number(e.target.value);
                      handleStyleUpdate('boxShadow', `${xOffset}px 4px 12px rgba(0,0,0,0.15)`);
                    }}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Y Offset */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                    Y Offset: 4px
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    defaultValue="4"
                    onChange={(e) => {
                      const yOffset = Number(e.target.value);
                      handleStyleUpdate('boxShadow', `0px ${yOffset}px 12px rgba(0,0,0,0.15)`);
                    }}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Blur Radius */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                    Blur: 12px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    defaultValue="12"
                    onChange={(e) => {
                      const blur = Number(e.target.value);
                      handleStyleUpdate('boxShadow', `0px 4px ${blur}px rgba(0,0,0,0.15)`);
                    }}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Shadow Color */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                    Shadow Color
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="color"
                      defaultValue="#000000"
                      onChange={(e) => {
                        const color = e.target.value;
                        handleStyleUpdate('boxShadow', `0px 4px 12px ${color}26`);
                      }}
                      style={{ width: '36px', height: '32px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      placeholder="rgba(0,0,0,0.15)"
                      defaultValue="rgba(0,0,0,0.15)"
                      onChange={(e) => {
                        handleStyleUpdate('boxShadow', `0px 4px 12px ${e.target.value}`);
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        border: `1px solid ${colors.gray[200]}`,
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                {/* Preview */}
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '6px' }}>Preview</label>
                  <div style={{
                    width: '100%',
                    height: '60px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: selectedLayerObj?.style?.boxShadow || '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: colors.text.secondary
                  }}>
                    Shadow Preview
                  </div>
                </div>
              </div>
            </div>
          </div>

        </>
      );
    };

    // Media/Image properties
    if (selectedLayerObj.type === 'media' || selectedLayerObj.type === 'video' || selectedLayerObj.type === 'icon' || selectedLayerObj.type === 'overlay') {
      const imageUrl = selectedLayerObj?.content?.imageUrl || selectedLayerObj?.content?.videoUrl || '';
      const width = selectedLayerObj?.size?.width || 720;
      const height = selectedLayerObj?.size?.height || 640;
      const hasUrl = !!imageUrl;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Media Properties</h5>
            <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', border: `1px solid ${colors.gray[200]}`, backgroundColor: colors.gray[100] }}>
              {imageUrl ? (
                <img src={imageUrl} alt="Media preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.text.secondary, fontSize: '13px' }}>
                  Upload Image
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: colors.text.primary }}>Add URL</span>
              <div
                onClick={() => {
                  // Toggle URL input visibility (for now just toggle state)
                }}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: hasUrl ? colors.primary[500] : colors.gray[300],
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: '2px',
                  left: hasUrl ? '22px' : '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => handleContentUpdate(selectedLayerObj.type === 'video' ? 'videoUrl' : 'imageUrl', e.target.value)}
                placeholder="https://example.com/image.png"
                style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
              <label style={{
                padding: '8px 16px',
                background: colors.primary[500],
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap'
              }}>
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'layer')}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            {renderSizeControls()}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleContentUpdate('imageSize', { width: Number(e.target.value), height })}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <Lock size={16} color={colors.gray[400]} style={{ marginTop: '20px' }} />
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleContentUpdate('imageSize', { width, height: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Text properties
    if (selectedLayerObj.type === 'text') {
      const textContent = selectedLayerObj?.content?.text || '';
      const fontSize = selectedLayerObj?.content?.fontSize || 16;
      const fontWeight = selectedLayerObj?.content?.fontWeight || 'semibold';
      const textColor = selectedLayerObj?.content?.textColor || '#111827';
      const textAlign = selectedLayerObj?.content?.textAlign || 'center';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Text Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Content</label>
              <textarea
                placeholder="Enter text content..."
                value={textContent}
                onChange={(e) => handleContentUpdate('text', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none', minHeight: '80px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Weight</label>
                <select
                  value={fontWeight}
                  onChange={(e) => handleContentUpdate('fontWeight', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Align</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => handleStyleUpdate('textAlign', align)}
                    style={{
                      padding: '8px',
                      border: `1px solid ${align === textAlign ? colors.primary[500] : colors.gray[200]}`,
                      borderRadius: '6px',
                      background: align === textAlign ? colors.primary[50] : 'transparent',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: align === textAlign ? colors.primary[500] : colors.text.secondary,
                      textTransform: 'capitalize'
                    }}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
            {renderSizeControls()}
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Button/CTA properties
    if (selectedLayerObj.type === 'button') {
      const buttonText = selectedLayerObj?.content?.label || 'Got it';
      const buttonStyle = selectedLayerObj?.content?.buttonStyle || 'primary';
      const buttonColor = selectedLayerObj?.style?.backgroundColor || '#6366F1';
      const buttonTextColor = selectedLayerObj?.content?.textColor || '#FFFFFF';
      const buttonBorderRadius = typeof selectedLayerObj?.style?.borderRadius === 'number'
        ? selectedLayerObj.style.borderRadius
        : 8;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Button Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => handleContentUpdate('label', e.target.value)}
                placeholder="Enter button text"
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Size</label>
                <input
                  type="number"
                  value={selectedLayerObj?.content?.fontSize || 14}
                  onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Weight</label>
                <select
                  value={selectedLayerObj?.content?.fontWeight || 'medium'}
                  onChange={(e) => handleContentUpdate('fontWeight', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>

            {renderSizeControls()}

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Button Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                {['primary', 'secondary'].map(style => (
                  <button
                    key={style}
                    onClick={() => handleContentUpdate('buttonStyle', style)}
                    style={{
                      padding: '8px',
                      border: `1px solid ${style === buttonStyle ? colors.primary[500] : colors.gray[200]}`,
                      borderRadius: '6px',
                      background: style === buttonStyle ? colors.primary[50] : 'transparent',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: style === buttonStyle ? colors.primary[500] : colors.text.secondary
                    }}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Style Variant</label>
              <select
                value={selectedLayerObj.content?.buttonVariant || 'primary'}
                onChange={(e) => handleContentUpdate('buttonVariant', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="primary">Primary (Solid)</option>
                <option value="secondary">Secondary (Soft)</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
                <option value="soft">Soft</option>
                <option value="glass">Glass</option>
                <option value="gradient">Gradient</option>
                <option value="shine">Shine</option>
                <option value="3d">3D</option>
                <option value="elevated">Elevated</option>
                <option value="neumorphic">Neumorphic</option>
                <option value="pill">Pill</option>
                <option value="underline">Underline</option>
                <option value="glow">Glow</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="two-tone">Two Tone</option>
                <option value="comic">Comic</option>
                <option value="skeuomorphic">Skeuomorphic</option>
                <option value="liquid">Liquid</option>
                <option value="block">Block</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Icon</label>
                <select
                  value={selectedLayerObj.content?.buttonIcon || ''}
                  onChange={(e) => handleContentUpdate('buttonIcon', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="">None</option>
                  <option value="ArrowRight">Arrow Right</option>
                  <option value="ArrowLeft">Arrow Left</option>
                  <option value="Play">Play</option>
                  <option value="Search">Search</option>
                  <option value="Home">Home</option>
                  <option value="Check">Check</option>
                  <option value="X">X</option>
                  <option value="Download">Download</option>
                  <option value="Upload">Upload</option>
                  <option value="User">User</option>
                  <option value="Settings">Settings</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Position</label>
                <select
                  value={selectedLayerObj.content?.buttonIconPosition || 'right'}
                  onChange={(e) => handleContentUpdate('buttonIconPosition', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Theme Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={selectedLayerObj.content?.themeColor || '#6366F1'}
                  onChange={(e) => handleContentUpdate('themeColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={selectedLayerObj.content?.themeColor || '#6366F1'}
                  onChange={(e) => handleContentUpdate('themeColor', e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Button Color</label>
                <input
                  type="color"
                  value={buttonColor}
                  onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                  style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
                <input
                  type="color"
                  value={buttonTextColor}
                  onChange={(e) => handleContentUpdate('color', e.target.value)}
                  style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                <span>Border Radius</span>
                <span style={{ fontWeight: 600, color: colors.text.primary }}>{buttonBorderRadius}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="40"
                value={buttonBorderRadius}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setBorderRadiusValue(value);
                  handleStyleUpdate('borderRadius', value);
                }}
                style={{ width: '100%', accentColor: colors.primary[500] }}
              />
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Progress Bar properties (Phase 2)
    if (selectedLayerObj.type === 'progress-bar') {
      const value = selectedLayerObj.content?.value || 0;
      const max = selectedLayerObj.content?.max || 100;
      const showPercentage = selectedLayerObj.content?.showPercentage || false;
      const barColor = selectedLayerObj.style?.backgroundColor || '#22C55E';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Progress Bar Properties</h5>
            {renderSizeControls()}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Current Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleContentUpdate('value', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Max Value</label>
              <input
                type="number"
                value={max}
                onChange={(e) => handleContentUpdate('max', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Style Variant</label>
              <select
                value={selectedLayerObj.content?.progressBarVariant || 'simple'}
                onChange={(e) => handleContentUpdate('progressBarVariant', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="simple">Simple</option>
                <option value="rounded">Rounded</option>
                <option value="striped">Striped</option>
                <option value="animated">Animated Striped</option>
                <option value="gradient">Gradient</option>
                <option value="segmented">Segmented</option>
                <option value="glow">Glow</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Theme Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={selectedLayerObj.content?.themeColor || '#22C55E'}
                  onChange={(e) => handleContentUpdate('themeColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={selectedLayerObj.content?.themeColor || '#22C55E'}
                  onChange={(e) => handleContentUpdate('themeColor', e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Bar Color (Legacy)</label>
              <input
                type="color"
                value={barColor}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('showPercentage', !showPercentage)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: showPercentage ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: showPercentage ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Show Percentage</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Progress Circle properties (Phase 2)
    if (selectedLayerObj.type === 'progress-circle') {
      const value = selectedLayerObj.content?.value || 0;
      const max = selectedLayerObj.content?.max || 100;
      const showPercentage = selectedLayerObj.content?.showPercentage !== false;
      const circleColor = selectedLayerObj.style?.backgroundColor || '#6366F1';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Progress Circle Properties</h5>
            {renderSizeControls()}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Current Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleContentUpdate('value', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Style Variant</label>
              <select
                value={selectedLayerObj.content?.progressVariant || 'simple'}
                onChange={(e) => handleContentUpdate('progressVariant', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="simple">Simple Ring</option>
                <option value="semicircle">Semicircle (Gauge)</option>
                <option value="thick">Thick Ring (Donut)</option>
                <option value="dashed">Dashed Ring</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Max Value</label>
              <input
                type="number"
                value={max}
                onChange={(e) => handleContentUpdate('max', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Theme Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={selectedLayerObj.content?.themeColor || '#6366F1'}
                  onChange={(e) => handleContentUpdate('themeColor', e.target.value)}
                  style={{ width: '40px', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={selectedLayerObj.content?.themeColor || '#6366F1'}
                  onChange={(e) => handleContentUpdate('themeColor', e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Circle Color (Legacy)</label>
              <input
                type="color"
                value={circleColor}
                onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('showPercentage', !showPercentage)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: showPercentage ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: showPercentage ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Show Percentage</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }



    // List properties (Phase 2)
    if (selectedLayerObj.type === 'list') {
      const items = selectedLayerObj.content?.items || [];
      const listStyle = selectedLayerObj.content?.listStyle || 'bullet';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>List Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>List Style</label>
              <select
                value={listStyle}
                onChange={(e) => handleContentUpdate('listStyle', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none', background: 'white' }}
              >
                <option value="bullet">Bullet</option>
                <option value="numbered">Numbered</option>
                <option value="checkmark">Checkmark</option>
              </select>
            </div>
            {renderSizeControls()}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>List Items</label>
              {items.map((item: string, index: number) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index] = e.target.value;
                      handleContentUpdate('items', newItems);
                    }}
                    style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                    placeholder={`Item ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = items.filter((_: any, i: number) => i !== index);
                      handleContentUpdate('items', newItems);
                    }}
                    style={{ padding: '8px', border: 'none', background: colors.gray[100], borderRadius: '6px', cursor: 'pointer', color: colors.gray[600] }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleContentUpdate('items', [...items, ''])}
                style={{ width: '100%', padding: '8px 12px', border: `1px dashed ${colors.gray[200]}`, borderRadius: '6px', background: 'transparent', fontSize: '13px', color: colors.text.secondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Input properties (Phase 2)
    if (selectedLayerObj.type === 'input') {
      const inputType = selectedLayerObj.content?.inputType || 'text';
      const placeholder = selectedLayerObj.content?.placeholder || '';
      const required = selectedLayerObj.content?.required || false;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Input Field Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Input Type</label>
              <select
                value={inputType}
                onChange={(e) => handleContentUpdate('inputType', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none', background: 'white' }}
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="textarea">Textarea</option>
              </select>
            </div>
            {renderSizeControls()}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Placeholder Text</label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => handleContentUpdate('placeholder', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('required', !required)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: required ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: required ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Required Field</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Checkbox properties
    if (selectedLayerObj.type === 'checkbox') {
      const checkboxLabel = selectedLayerObj.content?.checkboxLabel || 'I agree to terms';
      const checked = selectedLayerObj.content?.checked || false;
      const checkboxColor = selectedLayerObj.content?.checkboxColor || '#6366F1';
      const fontSize = selectedLayerObj.content?.fontSize || 14;
      const textColor = selectedLayerObj.content?.textColor || '#374151';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Checkbox Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Label Text</label>
              <input
                type="text"
                value={checkboxLabel}
                onChange={(e) => handleContentUpdate('checkboxLabel', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('checked', !checked)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: checked ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: checked ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Checked by Default</span>
              </label>
            </div>
            {renderSizeControls()}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Checkbox Color</label>
              <input
                type="color"
                value={checkboxColor}
                onChange={(e) => handleContentUpdate('checkboxColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                  style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Statistic properties (Phase 2)
    if (selectedLayerObj.type === 'statistic') {
      const value = selectedLayerObj.content?.value || 0;
      const prefix = selectedLayerObj.content?.prefix || '';
      const suffix = selectedLayerObj.content?.suffix || '';
      const animateOnLoad = selectedLayerObj.content?.animateOnLoad !== false;
      const fontSize = selectedLayerObj.content?.fontSize || 36;
      const textColor = selectedLayerObj.content?.textColor || '#111827';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Statistic Properties</h5>
            {renderSizeControls()}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleContentUpdate('value', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => handleContentUpdate('prefix', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  placeholder="₹"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => handleContentUpdate('suffix', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  placeholder="saved"
                />
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('animateOnLoad', !animateOnLoad)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: animateOnLoad ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: animateOnLoad ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Animate on Load</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Rating properties (Phase 3.5)
    if (selectedLayerObj.type === 'rating') {
      const maxStars = selectedLayerObj.content?.maxStars || 5;
      const rating = selectedLayerObj.content?.rating || 0;
      const reviewCount = selectedLayerObj.content?.reviewCount || 0;
      const showReviewCount = selectedLayerObj.content?.showReviewCount !== false;
      const starColor = selectedLayerObj.style?.starColor || '#FFB800';
      const starSize = selectedLayerObj.style?.starSize || 20;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>⭐ Rating Properties</h5>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Rating Value (0-5)</label>
              <input
                type="number"
                min="0"
                max={maxStars}
                step="0.5"
                value={rating}
                onChange={(e) => handleContentUpdate('rating', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            {renderSizeControls()}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Max Stars</label>
              <input
                type="number"
                min="3"
                max="10"
                value={maxStars}
                onChange={(e) => handleContentUpdate('maxStars', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Review Count</label>
              <input
                type="number"
                value={reviewCount}
                onChange={(e) => handleContentUpdate('reviewCount', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                placeholder="2847"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Star Color</label>
              <input
                type="color"
                value={starColor}
                onChange={(e) => handleStyleUpdate('starColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Star Size (px)</label>
              <input
                type="number"
                value={starSize}
                onChange={(e) => handleStyleUpdate('starSize', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('showReviewCount', !showReviewCount)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: showReviewCount ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: showReviewCount ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Show Review Count</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Badge properties (Phase 3.5)
    if (selectedLayerObj.type === 'badge') {
      const badgeText = selectedLayerObj.content?.badgeText || 'NEW';
      const badgeVariant = selectedLayerObj.content?.badgeVariant || 'custom';
      const pulse = selectedLayerObj.content?.pulse !== false;
      const badgeBackgroundColor = selectedLayerObj.style?.badgeBackgroundColor || '#EF4444';
      const badgeTextColor = selectedLayerObj.style?.badgeTextColor || '#FFFFFF';
      const badgeBorderRadius = selectedLayerObj.style?.badgeBorderRadius || 12;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>🏷️ Badge Properties</h5>
            {renderSizeControls()}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Badge Text</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => handleContentUpdate('badgeText', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                placeholder="30% OFF"
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Variant</label>
              <select
                value={badgeVariant}
                onChange={(e) => handleContentUpdate('badgeVariant', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="success">Success (Green)</option>
                <option value="error">Error (Red)</option>
                <option value="warning">Warning (Orange)</option>
                <option value="info">Info (Blue)</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {badgeVariant === 'custom' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Background Color</label>
                  <input
                    type="color"
                    value={badgeBackgroundColor}
                    onChange={(e) => handleStyleUpdate('badgeBackgroundColor', e.target.value)}
                    style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
                  <input
                    type="color"
                    value={badgeTextColor}
                    onChange={(e) => handleStyleUpdate('badgeTextColor', e.target.value)}
                    style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
                  />
                </div>
              </>
            )}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Border Radius</label>
              <input
                type="number"
                value={badgeBorderRadius}
                onChange={(e) => handleStyleUpdate('badgeBorderRadius', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text.secondary, cursor: 'pointer' }}>
                <div
                  onClick={() => handleContentUpdate('pulse', !pulse)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: pulse ? colors.primary[500] : colors.gray[300],
                    position: 'relative',
                    transition: 'background 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: pulse ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span>Pulse Animation</span>
              </label>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Gradient Overlay properties (Feature 4 - Gradient Builder UI)
    if (selectedLayerObj.type === 'gradient-overlay') {
      const gradientType = selectedLayerObj.content?.gradientType || 'linear';
      const gradientDirection = selectedLayerObj.content?.gradientDirection || 180;
      const gradientStops = selectedLayerObj.content?.gradientStops || [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
      ];

      const addGradientStop = () => {
        const newStops = [...gradientStops, { color: '#000000', position: 50 }].sort((a, b) => a.position - b.position);
        handleContentUpdate('gradientStops', newStops);
      };

      const removeGradientStop = (index: number) => {
        if (gradientStops.length > 2) { // Minimum 2 stops
          const newStops = gradientStops.filter((_, i) => i !== index);
          handleContentUpdate('gradientStops', newStops);
        }
      };

      const updateGradientStop = (index: number, field: 'color' | 'position', value: any) => {
        const newStops = [...gradientStops];
        newStops[index] = { ...newStops[index], [field]: value };
        if (field === 'position') {
          newStops.sort((a, b) => a.position - b.position);
        }
        handleContentUpdate('gradientStops', newStops);
      };

      // Generate gradient preview
      const gradientPreview = gradientType === 'linear'
        ? `linear-gradient(${typeof gradientDirection === 'number' ? gradientDirection + 'deg' : gradientDirection}, ${gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`
        : `radial-gradient(circle, ${gradientStops.map(s => `${s.color} ${s.position}%`).join(', ')})`;

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>🌈 Gradient Properties</h5>

            {/* Gradient Type */}
            {renderSizeControls()}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Gradient Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleContentUpdate('gradientType', 'linear')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: `1px solid ${gradientType === 'linear' ? colors.primary[500] : colors.gray[200]}`,
                    backgroundColor: gradientType === 'linear' ? colors.primary[50] : 'transparent',
                    color: gradientType === 'linear' ? colors.primary[600] : colors.text.primary,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Linear
                </button>
                <button
                  onClick={() => handleContentUpdate('gradientType', 'radial')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: `1px solid ${gradientType === 'radial' ? colors.primary[500] : colors.gray[200]}`,
                    backgroundColor: gradientType === 'radial' ? colors.primary[50] : 'transparent',
                    color: gradientType === 'radial' ? colors.primary[600] : colors.text.primary,
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Radial
                </button>
              </div>
            </div>

            {/* Angle/Direction (for linear) */}
            {gradientType === 'linear' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>
                  Angle: {typeof gradientDirection === 'number' ? gradientDirection : 0}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={typeof gradientDirection === 'number' ? gradientDirection : 180}
                  onChange={(e) => handleContentUpdate('gradientDirection', Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  {[0, 90, 180, 270].map(angle => (
                    <button
                      key={angle}
                      onClick={() => handleContentUpdate('gradientDirection', angle)}
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        border: `1px solid ${colors.gray[200]}`,
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        backgroundColor: gradientDirection === angle ? colors.gray[100] : 'transparent'
                      }}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Preview */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Preview</label>
              <div style={{
                width: '100%',
                height: '80px',
                borderRadius: '8px',
                background: gradientPreview,
                border: `1px solid ${colors.gray[200]}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }} />
            </div>

            {/* Color Stops */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: colors.text.secondary }}>Color Stops</label>
                <button
                  onClick={addGradientStop}
                  style={{
                    padding: '4px 12px',
                    border: `1px solid ${colors.primary[500]}`,
                    backgroundColor: colors.primary[50],
                    color: colors.primary[600],
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  + Add Stop
                </button>
              </div>

              {gradientStops.map((stop, index) => (
                <div key={index} style={{
                  marginBottom: '12px',
                  padding: '12px',
                  border: `1px solid ${colors.gray[200]}`,
                  borderRadius: '6px',
                  backgroundColor: colors.gray[50]
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                      style={{ width: '40px', height: '32px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                      style={{ flex: 1, padding: '6px 10px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                    {gradientStops.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeGradientStop(index)}
                        style={{
                          padding: '6px 10px',
                          border: `1px solid ${colors.gray[200]}`,
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: colors.text.secondary
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>
                      Position: {stop.position}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={(e) => updateGradientStop(index, 'position', Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Preset Gradients */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Presets</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { name: 'Sunset', stops: [{ color: '#ff6b6b', position: 0 }, { color: '#feca57', position: 100 }] },
                  { name: 'Ocean', stops: [{ color: '#1e3c72', position: 0 }, { color: '#2a5298', position: 100 }] },
                  { name: 'Purple', stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
                  { name: 'Fire', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
                  { name: 'Ice', stops: [{ color: '#74ebd5', position: 0 }, { color: '#ACB6E5', position: 100 }] },
                  { name: 'Aurora', stops: [{ color: '#00c6ff', position: 0 }, { color: '#0072ff', position: 100 }] }
                ].map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => handleContentUpdate('gradientStops', preset.stops)}
                    style={{
                      padding: '8px',
                      border: `1px solid ${colors.gray[200]}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'white'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '24px',
                      borderRadius: '4px',
                      background: `linear-gradient(90deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                    }} />
                    <span style={{ fontSize: '10px', color: colors.text.secondary }}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }

    // Countdown properties
    if (selectedLayerObj.type === 'countdown') {
      const endTime = selectedLayerObj.content?.endTime || new Date(Date.now() + 86400000).toISOString();
      const format = selectedLayerObj.content?.format || 'HH:MM:SS';
      const urgencyThreshold = selectedLayerObj.content?.urgencyThreshold || 3600;
      const fontSize = selectedLayerObj.content?.fontSize || 24;
      const fontWeight = selectedLayerObj.content?.fontWeight || 'bold';
      const textColor = selectedLayerObj.content?.textColor || '#111827';

      return (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>⏳ Countdown Properties</h5>
            {renderSizeControls()}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>End Time</label>
              <input
                type="datetime-local"
                value={endTime.slice(0, 16)}
                onChange={(e) => handleContentUpdate('endTime', new Date(e.target.value).toISOString())}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Style Variant</label>
              <select
                value={selectedLayerObj.content?.timerVariant || 'text'}
                onChange={(e) => handleContentUpdate('timerVariant', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="text">Simple Text</option>
                <option value="card">Card (Boxed)</option>
                <option value="circular">Circular Progress</option>
                <option value="flip">Flip Clock</option>
                <option value="digital">Digital (LED)</option>
                <option value="bubble">Bubble (Round)</option>
                <option value="minimal">Minimal (Clean)</option>
                <option value="neon">Neon Glow</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Format</label>
              <select
                value={format}
                onChange={(e) => handleContentUpdate('format', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="HH:MM:SS">HH:MM:SS</option>
                <option value="MM:SS">MM:SS</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Urgency Threshold (seconds)</label>
              <input
                type="number"
                value={urgencyThreshold}
                onChange={(e) => handleContentUpdate('urgencyThreshold', Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Size</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => handleContentUpdate('fontSize', Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Weight</label>
                <select
                  value={fontWeight}
                  onChange={(e) => handleContentUpdate('fontWeight', e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => handleContentUpdate('textColor', e.target.value)}
                style={{ width: '100%', height: '40px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', cursor: 'pointer' }}
              />
            </div>
          </div>
          {renderCommonStyles()}
        </>
      );
    }







    // Container properties
    if (selectedLayerObj.type === 'container') {
      const containerPosition = (selectedLayerObj.content as any)?.containerPosition || 'bottom-center';

      // Size properties from layer.size
      const currentWidth = selectedLayerObj.size?.width || '100%';
      const currentHeight = selectedLayerObj.size?.height || 'auto';

      const padding = selectedLayerObj.style?.padding || { top: 16, right: 16, bottom: 16, left: 16 };
      const paddingObj = typeof padding === 'object' ? padding : { top: padding, right: padding, bottom: padding, left: padding };
      const paddingTop = paddingObj.top || 16;
      const paddingRight = paddingObj.right || 16;
      const paddingBottom = paddingObj.bottom || 16;
      const paddingLeft = paddingObj.left || 16;

      return (
        <>
          {selectedLayerObj.name === 'Modal Container' && renderModalConfig()}
          {selectedLayerObj.name === 'Banner Container' && renderBannerConfig()}
          {selectedLayerObj.name === 'Floater Container' && renderFloaterConfig()}
          {selectedLayerObj.name === 'Bottom Sheet' && renderBottomSheetConfig()}
          {selectedLayerObj.name === 'PIP Container' && renderPipConfig()}
          {selectedLayerObj.name === 'Tooltip Container' && renderTooltipConfig()}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>
              {selectedLayerObj.name === 'Tooltip Container' && selectedNudgeType === 'tooltip' ? 'Internal Layout' : 'Container Properties'}
            </h5>

            {/* Width & Height - Removed (Use Standard Size Controls below) */}



            {/* Opacity Control */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>
                Opacity: {Math.round((selectedLayerObj.style?.opacity ?? 1) * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedLayerObj.style?.opacity ?? 1}
                onChange={(e) => handleStyleUpdate('opacity', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>



            {/* Typography Controls */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Font Family</label>
              <select
                value={selectedLayerObj.style?.fontFamily || 'Inter'}
                onChange={(e) => handleStyleUpdate('fontFamily', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="Inter">Inter (Default)</option>
                <option value="Roboto">Roboto</option>
                <option value="Poppins">Poppins</option>
                <option value="Caveat">Caveat (Handwritten)</option>
                <option value="Dancing Script">Dancing Script (Cursive)</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
              </select>
            </div>

            {/* Display Mode */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Display Mode</label>
              <select
                value={selectedLayerObj.style?.display || 'flex'}
                onChange={(e) => handleStyleUpdate('display', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="flex">Flex</option>
                <option value="block">Block</option>
                <option value="inline-block">Inline Block</option>
                <option value="grid">Grid</option>
              </select>
            </div>

            {/* Flexbox Controls (when display is flex) */}
            {selectedLayerObj.style?.display === 'flex' && (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Flex Direction</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['row', 'column'].map((dir) => (
                      <button
                        type="button"
                        key={dir}
                        onClick={() => handleStyleUpdate('flexDirection', dir)}
                        style={{
                          padding: '8px',
                          border: `1px solid ${(selectedLayerObj.style?.flexDirection || 'column') === dir ? colors.primary[500] : colors.gray[200]}`,
                          borderRadius: '6px',
                          background: (selectedLayerObj.style?.flexDirection || 'column') === dir ? colors.primary[50] : 'white',
                          color: (selectedLayerObj.style?.flexDirection || 'column') === dir ? colors.primary[600] : colors.text.secondary,
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Align Items</label>
                  <select
                    value={selectedLayerObj.style?.alignItems || 'flex-start'}
                    onChange={(e) => handleStyleUpdate('alignItems', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Justify Content</label>
                  <select
                    value={selectedLayerObj.style?.justifyContent || 'flex-start'}
                    onChange={(e) => handleStyleUpdate('justifyContent', e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                    <option value="space-between">Space Between</option>
                    <option value="space-around">Space Around</option>
                    <option value="space-evenly">Space Evenly</option>
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Gap (px)</label>
                  <input
                    type="number"
                    value={selectedLayerObj.style?.gap || 0}
                    onChange={(e) => handleStyleUpdate('gap', Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </>
            )}

            {/* Overflow Control */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Overflow</label>
              <select
                value={selectedLayerObj.style?.overflow || 'visible'}
                onChange={(e) => handleStyleUpdate('overflow', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
                <option value="scroll">Scroll</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            {/* Cursor Control */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>Cursor Style</label>
              <select
                value={selectedLayerObj.style?.cursor || 'default'}
                onChange={(e) => handleStyleUpdate('cursor', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              >
                <option value="default">Default</option>
                <option value="pointer">Pointer</option>
                <option value="not-allowed">Not Allowed</option>
                <option value="grab">Grab</option>
                <option value="text">Text</option>
                <option value="move">Move</option>
              </select>
            </div>

            {/* Background Image Controls */}
            {/* Background Image Controls - HIDDEN for Bottom Sheet Container */}
            <div style={{ marginBottom: '16px', padding: '12px', background: colors.gray[50], borderRadius: '6px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: colors.text.primary, marginBottom: '8px' }}>Background Image</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={selectedLayerObj.style?.backgroundImage?.replace(/^url\(['"]?|['"]?\)$/g, '') || ''}
                  onChange={(e) => handleStyleUpdate('backgroundImage', e.target.value ? `url('${e.target.value}')` : undefined)}
                  placeholder="Enter image URL"
                  style={{ flex: 1, padding: '8px 12px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                />
                <label style={{
                  padding: '8px 16px',
                  background: colors.primary[500],
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'background')}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Size</label>
                  <select
                    value={(() => {
                      const size = selectedLayerObj.style?.backgroundSize;
                      if (!size || size === 'cover' || size === 'contain' || size === 'auto' || size === '100% 100%') return size || 'cover';
                      return 'custom';
                    })()}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        handleStyleUpdate('backgroundSize', '100% auto');
                      } else {
                        handleStyleUpdate('backgroundSize', e.target.value);
                      }
                    }}
                    style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="auto">Auto</option>
                    <option value="100% 100%">Stretch</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Repeat</label>
                  <select
                    value={selectedLayerObj.style?.backgroundRepeat || 'no-repeat'}
                    onChange={(e) => handleStyleUpdate('backgroundRepeat', e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="no-repeat">No Repeat</option>
                    <option value="repeat">Repeat</option>
                    <option value="repeat-x">Repeat X</option>
                    <option value="repeat-y">Repeat Y</option>
                  </select>
                </div>
              </div>

              {/* Custom Size Controls */}
              {(() => {
                const size = selectedLayerObj.style?.backgroundSize;
                const isCustom = size && typeof size === 'string' && !['cover', 'contain', 'auto', '100% 100%'].includes(size);
                return isCustom ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Width (px or %)</label>
                      <input
                        type="text"
                        value={(() => {
                          if (typeof size === 'string') {
                            const parts = size.split(' ');
                            return parts[0] || '100%';
                          }
                          return '100%';
                        })()}
                        onChange={(e) => {
                          const parts = typeof size === 'string' ? size.split(' ') : ['100%', 'auto'];
                          const newValue = e.target.value.trim() || '100%';
                          handleStyleUpdate('backgroundSize', `${newValue} ${parts[1] || 'auto'}`);
                        }}
                        placeholder="100% or 200px"
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Height (px or %)</label>
                      <input
                        type="text"
                        value={(() => {
                          if (typeof size === 'string') {
                            const parts = size.split(' ');
                            return parts[1] || 'auto';
                          }
                          return 'auto';
                        })()}
                        onChange={(e) => {
                          const parts = typeof size === 'string' ? size.split(' ') : ['100%', 'auto'];
                          const newValue = e.target.value.trim() || 'auto';
                          handleStyleUpdate('backgroundSize', `${parts[0] || '100%'} ${newValue}`);
                        }}
                        placeholder="auto or 200px"
                        style={{ width: '100%', padding: '6px 8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '4px', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                  </div>
                ) : null;
              })()}

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: colors.text.secondary, marginBottom: '4px' }}>Position Presets</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '8px' }}>
                  {['left top', 'center top', 'right top', 'left center', 'center center', 'right center', 'left bottom', 'center bottom', 'right bottom'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => handleStyleUpdate('backgroundPosition', pos)}
                      style={{
                        padding: '6px',
                        border: `1px solid ${selectedLayerObj.style?.backgroundPosition === pos ? colors.primary[500] : colors.gray[200]}`,
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        background: selectedLayerObj.style?.backgroundPosition === pos ? colors.primary[50] : 'white',
                        color: selectedLayerObj.style?.backgroundPosition === pos ? colors.primary[700] : colors.text.secondary
                      }}
                    >
                      {pos.split(' ').map(w => w[0].toUpperCase()).join('')}
                    </button>
                  ))}
                </div>
              </div>
            </div>


            {/* Padding Controls */}
            {!(selectedLayerObj.name === 'Tooltip Container' && selectedNudgeType === 'tooltip') && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Padding</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <input
                      type="number"
                      value={paddingTop}
                      onChange={(e) => handleStyleUpdate('padding', { ...paddingObj, top: Number(e.target.value) })}
                      placeholder="Top"
                      style={{ padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                    />
                    <input
                      type="number"
                      value={paddingRight}
                      onChange={(e) => handleStyleUpdate('padding', { ...paddingObj, right: Number(e.target.value) })}
                      placeholder="Right"
                      style={{ padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                    />
                    <input
                      type="number"
                      value={paddingBottom}
                      onChange={(e) => handleStyleUpdate('padding', { ...paddingObj, bottom: Number(e.target.value) })}
                      placeholder="Bottom"
                      style={{ padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                    />
                    <input
                      type="number"
                      value={paddingLeft}
                      onChange={(e) => handleStyleUpdate('padding', { ...paddingObj, left: Number(e.target.value) })}
                      placeholder="Left"
                      style={{ padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Margin Controls */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>Margin</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <input
                      type="number"
                      value={(selectedLayerObj.style?.margin as any)?.top || 0}
                      onChange={(e) => {
                        const marginObj = typeof selectedLayerObj.style?.margin === 'object' ? selectedLayerObj.style.margin : { top: 0, right: 0, bottom: 0, left: 0 };
                        handleStyleUpdate('margin', { ...marginObj, top: Number(e.target.value) });
                      }}
                      placeholder="Top"
                      style={{ padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                    />
                    <input
                      type="number"
                      value={(selectedLayerObj.style?.margin as any)?.right || 0}
                      onChange={(e) => {
                        const marginObj = typeof selectedLayerObj.style?.margin === 'object' ? selectedLayerObj.style.margin : { top: 0, right: 0, bottom: 0, left: 0 };
                        handleStyleUpdate('margin', { ...marginObj, right: Number(e.target.value) });
                      }}
                      placeholder="Right"
                      style={{ padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                    />
                    <input
                      type="number"
                      value={(selectedLayerObj.style?.margin as any)?.bottom || 0}
                      onChange={(e) => {
                        const marginObj = typeof selectedLayerObj.style?.margin === 'object' ? selectedLayerObj.style.margin : { top: 0, right: 0, bottom: 0, left: 0 };
                        handleStyleUpdate('margin', { ...marginObj, bottom: Number(e.target.value) });
                      }}
                      placeholder="Bottom"
                      style={{ padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                    />
                    <input
                      type="number"
                      value={(selectedLayerObj.style?.margin as any)?.left || 0}
                      onChange={(e) => {
                        const marginObj = typeof selectedLayerObj.style?.margin === 'object' ? selectedLayerObj.style.margin : { top: 0, right: 0, bottom: 0, left: 0 };
                        handleStyleUpdate('margin', { ...marginObj, left: Number(e.target.value) });
                      }}
                      placeholder="Left"
                      style={{ padding: '8px', border: `1px solid ${colors.gray[200]}`, borderRadius: '6px', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                    />
                  </div>
                </div>
              </>
            )}

            {!(selectedLayerObj.name === 'Tooltip Container' && selectedNudgeType === 'tooltip') && renderSizeControls()}
            {renderCommonStyles()}
          </div>
        </>
      );
    }

    // Default properties
    return (
      <>

        {renderModalConfig()}
        {renderPipConfig()}
        {renderTooltipConfig()}
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: colors.text.primary }}>Layer Properties</h5>
          <p style={{ fontSize: '13px', color: colors.text.secondary }}>Select a layer to edit its properties</p>
        </div>
        {renderCommonStyles()}
      </>
    );

  };



  // Handler for template selection
  const handleTemplateSelect = async (templateId: string) => {
    const template = BOTTOM_SHEET_TEMPLATES.find(t => t.id === templateId);

    if (!template) {
      toast.error('Template not found');
      return;
    }

    try {
      // Create campaign first
      createCampaign(
        selectedExperience as any || 'nudges',
        'bottomsheet' as any
      );

      // FIX: Apply template CORRECTLY (passing full object, not just layers)
      // And await it to ensure store is updated
      await loadTemplate(template);

      // FIX: Save campaign to backend BEFORE navigating
      // This ensures loadCampaign(id) succeeds on the new route
      await saveCampaign();

      // Navigate to the new campaign ID
      const { currentCampaign } = useEditorStore.getState();
      if (currentCampaign?.id) {
        navigate(`/campaign-builder?id=${currentCampaign.id}&experience=${selectedExperience || 'nudges'}`, { replace: true });
        toast.success(`Template "${template.name}" loaded successfully!`);
      }

      setTemplateModalOpen(false);
      setShowEditor(true);

    } catch (error) {
      console.error('Template selection error:', error);
      toast.error('Failed to apply template');
    }
  };

  // Handler for starting from scratch
  const handleStartFromScratch = () => {
    createCampaign(
      selectedExperience as any || 'nudges',
      'bottomsheet' as any
    );

    // FIX: Navigate to the new campaign ID immediately
    const { currentCampaign } = useEditorStore.getState();
    if (currentCampaign?.id) {
      navigate(`/campaign-builder?id=${currentCampaign.id}&experience=${selectedExperience || 'nudges'}`, { replace: true });
    }

    setTemplateModalOpen(false);
    setShowEditor(true);
    toast.info('Starting with blank canvas...');
  };

  // Handler for saving campaign
  const handleSaveCampaign = async () => {
    if (!currentCampaign) {
      toast.error('No campaign to save');
      return;
    }

    // FIX #5: Validate before save
    if (!currentCampaign.name || currentCampaign.name.trim() === '') {
      toast.error('Please enter a campaign name');
      return;
    }

    if (!currentCampaign.layers || currentCampaign.layers.length === 0) {
      toast.error('Campaign must have at least one layer');
      return;
    }

    try {
      const oldId = currentCampaign.id;
      await saveCampaign();
      toast.success('Campaign saved successfully!');

      // FIX #2: Update URL parameter if campaign ID changed
      const { currentCampaign: updatedCampaign } = useEditorStore.getState();
      const newId = updatedCampaign?.id;
      if (newId && newId !== oldId) {
        navigate(`/campaign-builder?id=${newId}`, { replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save campaign');
    }
  };

  // Handler for loading campaign (for testing)
  const handleLoadCampaign = async () => {
    const campaignId = prompt('Enter campaign ID to load:');
    if (!campaignId) return;

    try {
      const { loadCampaign } = useEditorStore.getState();
      await loadCampaign(campaignId);
      toast.success('Campaign loaded successfully!');
    } catch (error) {
      toast.error('Failed to load campaign');
      console.error('Load error:', error);
    }
  };

  // Handler for launching campaign
  const handleLaunchCampaign = async () => {
    if (!currentCampaign) {
      toast.error('No campaign to launch');
      return;
    }

    // FIX #5: Validate before launch
    if (!currentCampaign.name || currentCampaign.name.trim() === '') {
      toast.error('Please enter a campaign name before launching');
      return;
    }

    if (!currentCampaign.layers || currentCampaign.layers.length === 0) {
      toast.error('Campaign must have at least one layer');
      return;
    }

    try {
      // Update campaign status to active in the store
      updateStatus('active');

      // Save the campaign with active status
      await saveCampaign();

      toast.success('🚀 Campaign launched successfully!');

      // Navigate to campaigns page after short delay
      setTimeout(() => {
        navigate('/campaigns');
      }, 1500);
    } catch (error) {
      console.error('Launch campaign error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to launch campaign');
    }
  };

  // Early return for campaign creation flow - AFTER all hooks
  if (!showEditor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/campaigns')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Create New Campaign</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Target Page Context Selection (New Feature) */}
            {!searchParams.get('experience') && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Page Context</h2>
                <p className="text-sm text-gray-500 mb-4">Select an App Screen to visualize and target specific elements.</p>
                <div className="w-full max-w-md">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={selectedPageId || ''}
                    onChange={(e) => setSelectedPageId(e.target.value)}
                  >
                    <option value="">-- Select an App Screen --</option>
                    {pages.map((page) => (
                      <option key={page._id} value={page._id}>
                        {page.name} ({page.pageTag})
                      </option>
                    ))}
                  </select>
                </div>
              </section>
            )}

            {/* Experience Selection */}
            {/* Experience Selection - Only show if not pre-selected via URL */}
            {!searchParams.get('experience') && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Experience</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {experienceTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => handleExperienceSelect(type.id)}
                      className={`
                      relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                      ${selectedExperience === type.id
                          ? 'border-indigo-600 bg-indigo-50 shadow-md'
                          : 'border-white bg-white hover:border-indigo-200 hover:shadow-lg'}
                    `}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white shadow-sm"
                        style={{ background: type.gradient }}
                      >
                        <type.Icon size={24} />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{type.label}</h3>
                      <p className="text-sm text-gray-500">Create engaging {type.label.toLowerCase()} for your users</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Nudge Type Selection (Only if Nudges is selected) */}
            {/* Nudge Type Selection - Show for ANY experience that has mapped types */}
            {(selectedExperience && EXPERIENCE_MAPPING[selectedExperience]) && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Nudge Type</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {nudgeTypes
                    .filter(type => {
                      // FIX: Filter based on selected experience mapping
                      if (!selectedExperience) return false;
                      const allowedTypes = EXPERIENCE_MAPPING[selectedExperience];
                      // If no explicit mapping, show none or all? User requested strict mapping.
                      // If allowedTypes is undefined (e.g. unknown experience), show nothing.
                      return allowedTypes?.includes(type.id);
                    })
                    .map((type) => (
                      <div
                        key={type.id}
                        onClick={() => handleNudgeTypeSelect(type.id)}
                        className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg cursor-pointer transition-all duration-200 group"
                      >
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: type.bg, color: type.iconColor }}
                        >
                          <type.Icon size={24} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{type.label}</h3>
                        <p className="text-sm text-gray-500">Select to create a {type.label.toLowerCase()}</p>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Template Gallery Modal */}
        <TemplateGallery
          isOpen={isTemplateModalOpen}
          onClose={() => setTemplateModalOpen(false)}
          onSelectTemplate={(template) => {
            // Create campaign with template
            // FIX: Use template type instead of hardcoded 'bottomsheet'
            const type = template.type || template.config?.nudgeType || template.config?.type || 'bottomsheet';
            createCampaign(
              (selectedExperience || selectedExperienceType) as any || 'nudges',
              type as any
            );

            // Load template
            loadTemplate(template);

            // Navigate to editor
            const { currentCampaign } = useEditorStore.getState();
            if (currentCampaign?.id) {
              navigate(`/campaign-builder?id=${currentCampaign.id}&experience=${selectedExperience || selectedExperienceType || 'nudges'}`, { replace: true });
            }

            setShowEditor(true);
            toast.success('Template loaded successfully');
          }}
          onStartBlank={() => {
            // Create campaign without template
            // FIX: Use selectedNudgeType or default to modal (safer default for blank)
            const typeToUse = selectedNudgeType || currentCampaign?.nudgeType || 'modal';
            createCampaign(
              (selectedExperience || selectedExperienceType) as any || 'nudges',
              typeToUse as any
            );

            // Navigate to editor
            const { currentCampaign: updatedCampaign } = useEditorStore.getState();
            if (updatedCampaign?.id) {
              navigate(`/campaign-builder?id=${updatedCampaign.id}&experience=${selectedExperience || selectedExperienceType || 'nudges'}`, { replace: true });
            }

            setShowEditor(true);
            toast.success('Started with blank canvas');
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">



      {/* Template Gallery */}
      <TemplateGallery
        isOpen={isTemplateModalOpen}
        nudgeType={selectedNudgeType} // Filter templates by current type
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={(template) => {
          // If creating new, don't confirm
          if (isCreating) {
            loadTemplate(template);
            setIsCreating(false);
            // Also set the nudge type based on the template
            // Fix: Safely access nudgeType, fallback to template.type (which matches backend schema)
            const type = template.config?.nudgeType || template.type;
            if (type) {
              setSelectedNudgeType(type);
            }
            toast.success('Template loaded successfully');
          } else {
            // Existing flow
            if (window.confirm('Loading a template will overwrite your current design. Continue?')) {
              loadTemplate(template);
              toast.success('Template loaded successfully');
            }
          }
        }}
        onStartBlank={() => {
          setTemplateModalOpen(false);
          if (isCreating) {
            setIsCreating(false);
            // FIX: Robustly determine nudge type
            if (!selectedNudgeType) {
              if (currentCampaign?.nudgeType) {
                setSelectedNudgeType(currentCampaign.nudgeType);
              } else {
                setSelectedNudgeType('modal');
              }
            }
            toast.success('Started with blank canvas');
          }
        }}
      />

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setSaveTemplateModalOpen(false)}
        config={currentCampaign}
        nudgeType={selectedNudgeType || 'unknown'}
      />





      <ErrorBoundary>
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* Design Tab - Nudge Selection Flow */}
            {(() => {
              console.log('DesignStep Render: selectedNudgeType=', selectedNudgeType, 'isCreating=', isCreating);
              return null; // Just for logging
            })()}
            {!selectedNudgeType && (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[50] }}>

                {/* 1. Empty State (Image 3) */}
                {!isCreating && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      margin: '0 auto 24px',
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}>
                      <Layout size={32} color={colors.gray[400]} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: colors.text.primary }}>
                      No interfaces found
                    </h3>
                    <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: colors.text.secondary }}>
                      Begin by adding an interface.
                    </p>
                    <button
                      onClick={() => setIsCreating(true)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: colors.gray[100],
                        color: colors.text.primary,
                        border: `1px solid ${colors.gray[200]}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.gray[200]; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.gray[100]; }}
                    >
                      <Plus size={16} />
                      Create Interface
                    </button>
                  </div>
                )}

                {/* 2. Selection State (Image 4) */}
                {isCreating && (
                  <div style={{ width: '100%', height: '100%', padding: '40px', overflowY: 'auto', backgroundColor: 'white' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                      <div style={{ marginBottom: '32px' }}>
                        <button
                          onClick={() => setIsCreating(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'none',
                            border: 'none',
                            color: colors.text.secondary,
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginBottom: '16px'
                          }}
                        >
                          <ArrowLeft size={16} /> Back
                        </button>
                        <h2 style={{ fontSize: '24px', fontWeight: 600, color: colors.text.primary, marginBottom: '8px' }}>
                          Create a Design
                        </h2>
                      </div>

                      {/* Dynamic Filter Bar */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', flexWrap: 'wrap' }}>
                        {DESIGN_CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setFilterCategory(category.id)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              backgroundColor: filterCategory === category.id ? colors.gray[900] : colors.gray[100],
                              color: filterCategory === category.id ? 'white' : colors.text.secondary,
                              border: 'none',
                              fontSize: '14px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>

                      {/* Dynamic Type Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                        {DESIGN_TYPES
                          .filter(type => filterCategory === 'all' || type.category === filterCategory)
                          .map((type) => {
                            const Icon = type.icon;
                            return (
                              <div
                                key={type.id}
                                onClick={() => handleNudgeTypeSelect(type.id)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div style={{
                                  aspectRatio: '9/16',
                                  backgroundColor: type.bg || colors.primary[50],
                                  borderRadius: '12px',
                                  border: `1px solid ${type.iconBg || colors.primary[100]}`,
                                  marginBottom: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  transition: 'all 0.2s'
                                }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = type.color; e.currentTarget.style.boxShadow = `0 4px 12px ${type.color}20`; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = type.iconBg || colors.primary[100]; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                  {/* Visual representation based on type */}
                                  {type.id === 'fullpage' && <div style={{ width: '100%', height: '100%', backgroundColor: type.iconBg }} />}
                                  {type.id === 'bottomsheet' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: type.color, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} />}
                                  {type.id === 'modal' && <div style={{ width: '70%', height: '30%', backgroundColor: type.color, borderRadius: '8px' }} />}
                                  {type.id === 'banner' && <div style={{ position: 'absolute', top: '20px', left: '10px', right: '10px', height: '60px', backgroundColor: type.color, borderRadius: '8px' }} />}
                                  {type.id === 'floater' && <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '48px', height: '48px', backgroundColor: type.color, borderRadius: '50%' }} />}
                                  {type.id === 'pip' && <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '80px', height: '45px', backgroundColor: type.color, borderRadius: '8px' }} />}

                                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="group-hover:opacity-100">
                                    <div style={{ backgroundColor: 'white', padding: '8px 16px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 600, color: type.color }}>
                                      Select
                                    </div>
                                  </div>
                                </div>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: colors.text.primary }}>{type.label}</h4>
                              </div>
                            );
                          })}
                      </div>

                      {/* Dynamic Template Grid */}
                      <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: colors.text.primary, marginBottom: '24px' }}>
                          Start with a template
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                          {TEMPLATES
                            .filter(template => {
                              if (filterCategory === 'all') return true;
                              const type = DESIGN_TYPES.find(t => t.id === template.typeId);
                              return type?.category === filterCategory;
                            })
                            .map((template) => (
                              <div
                                key={template.id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleNudgeTypeSelect(template.typeId)} // For now, just selects the type
                              >
                                <div style={{
                                  aspectRatio: '3/4',
                                  backgroundColor: colors.gray[100],
                                  borderRadius: '12px',
                                  marginBottom: '12px',
                                  overflow: 'hidden',
                                  position: 'relative',
                                  border: `1px solid ${colors.gray[200]}`,
                                  transition: 'all 0.2s'
                                }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary[500]; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.gray[200]; e.currentTarget.style.transform = 'none'; }}
                                >
                                  {/* Placeholder content */}
                                  <div style={{ position: 'absolute', inset: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ height: '60%', backgroundColor: colors.gray[200], borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }} />
                                    <div style={{ padding: '12px' }}>
                                      <div style={{ height: '8px', width: '80%', backgroundColor: colors.gray[200], borderRadius: '4px', marginBottom: '8px' }} />
                                      <div style={{ height: '8px', width: '50%', backgroundColor: colors.gray[200], borderRadius: '4px' }} />
                                    </div>
                                  </div>
                                </div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 500, color: colors.text.primary }}>{template.label}</h4>
                                <p style={{ margin: 0, fontSize: '12px', color: colors.text.secondary }}>{template.description}</p>
                              </div>
                            ))}

                          {/* Browse More Templates Card */}
                          <div
                            onClick={() => setTemplateModalOpen(true)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div style={{
                              aspectRatio: '3/4',
                              backgroundColor: 'white',
                              borderRadius: '12px',
                              marginBottom: '12px',
                              overflow: 'hidden',
                              position: 'relative',
                              border: `2px dashed ${colors.primary[200]}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                              gap: '12px',
                              transition: 'all 0.2s'
                            }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary[500]; e.currentTarget.style.backgroundColor = colors.primary[50]; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.primary[200]; e.currentTarget.style.backgroundColor = 'white'; }}
                            >
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: colors.primary[100],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <LayoutGrid size={24} color={colors.primary[600]} />
                              </div>
                              <div style={{ textAlign: 'center', padding: '0 16px' }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: colors.primary[700] }}>Browse All</h4>
                                <p style={{ margin: 0, fontSize: '12px', color: colors.primary[600] }}>View System & My Templates</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Design Tab - Editor (Screenshot 9) */}
            {/* Design Tab - Editor (Screenshot 9) */}
            {selectedNudgeType && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: colors.background.page }}>
                <style>
                  {`
                    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&display=swap');
                  `}
                </style>
                {/* Editor Header */}


                {/* Main Editor Area */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  {/* Left Panel - Layers */}
                  <div style={{ width: '280px', borderRight: `1px solid ${colors.gray[200]}`, backgroundColor: colors.background.card, display: 'flex', flexDirection: 'column' }}>
                    {/* Determine root container ID based on nudge type */}
                    {(() => {
                      // Find the root container layer based on nudge type
                      const getRootContainerId = () => {
                        const containerNames: Record<string, string> = {
                          'bottomsheet': 'Bottom Sheet',
                          'modal': 'Modal Container',
                          'banner': 'Banner Container',
                          'tooltip': 'Tooltip Container',
                          'pip': 'PIP Container'
                        };

                        // Robustly determine type
                        const type = selectedNudgeType || currentCampaign?.nudgeType || '';
                        const containerName = containerNames[type];

                        if (!containerName) return null;

                        const rootContainer = currentCampaign?.layers?.find(
                          (l: any) => l.type === 'container' && l.name === containerName
                        );

                        return rootContainer?.id || null;
                      };

                      const rootContainerId = getRootContainerId();

                      return (
                        <>
                          <div style={{ padding: '16px', borderBottom: `1px solid ${colors.gray[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                              Layers ({campaignLayers.length})
                              <span style={{ fontSize: '10px', color: 'red', marginLeft: '5px' }}>
                                Roots: {campaignLayers.filter(l => !l.parent || l.parent === 'null').length}
                              </span>
                            </h4>
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={() => setShowLayerMenu(!showLayerMenu)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary[500], display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Add new layer"
                              >
                                <Plus size={18} />
                              </button>

                              {/* Layer Type Dropdown Menu - Phase 2 */}
                              {showLayerMenu && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  marginTop: '4px',
                                  backgroundColor: 'white',
                                  border: `1px solid ${colors.gray[200]}`,
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  zIndex: 50,
                                  minWidth: '200px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{ padding: '8px 12px', borderBottom: `1px solid ${colors.gray[200]}`, backgroundColor: colors.gray[50] }}>
                                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: colors.text.secondary, letterSpacing: '0.5px' }}>Add Layer</p>
                                  </div>

                                  {/* Basic Layers */}
                                  <div style={{ padding: '4px' }}>

                                    <button type="button" onClick={() => { addLayer('container', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <Layout size={16} color={colors.gray[600]} />
                                      Container
                                    </button>
                                    <button type="button" onClick={() => { addLayer('media', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <ImageIcon size={16} color={colors.gray[600]} />
                                      Image
                                    </button>
                                    <button type="button" onClick={() => { addLayer('text', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <Type size={16} color={colors.gray[600]} />
                                      Text
                                    </button>
                                    <button type="button" onClick={() => { addLayer('button', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <Square size={16} color={colors.gray[600]} />
                                      Button
                                    </button>
                                  </div>

                                  {/* Divider */}
                                  <div style={{ height: '1px', backgroundColor: colors.gray[200], margin: '4px 0' }} />

                                  {/* Advanced Layers - Phase 2 */}
                                  <div style={{ padding: '4px' }}>
                                    <div style={{ padding: '4px 12px', marginBottom: '4px' }}>
                                      <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: colors.text.secondary, letterSpacing: '0.5px' }}>Advanced</p>
                                    </div>
                                    <button type="button" onClick={() => { addLayer('progress-bar', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📊</span>
                                      Progress Bar
                                    </button>
                                    <button type="button" onClick={() => { addLayer('progress-circle', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎯</span>
                                      Progress Circle
                                    </button>
                                    <button type="button" onClick={() => { addLayer('countdown', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏱️</span>
                                      Countdown Timer
                                    </button>
                                    <button type="button" onClick={() => { addLayer('list', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📝</span>
                                      List
                                    </button>
                                    <button type="button" onClick={() => { addLayer('input', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✏️</span>
                                      Input Field
                                    </button>
                                    <button type="button" onClick={() => { addLayer('statistic', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💯</span>
                                      Statistic
                                    </button>
                                    <button type="button" onClick={() => { addLayer('rating', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⭐</span>
                                      Rating Stars
                                    </button>
                                    <button type="button" onClick={() => { addLayer('badge', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏷️</span>
                                      Badge
                                    </button>
                                    <button type="button" onClick={() => { addLayer('gradient-overlay', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌈</span>
                                      Gradient Overlay
                                    </button>
                                    <button type="button" onClick={() => { addLayer('checkbox', rootContainerId); setShowLayerMenu(false); }} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☑️</span>
                                      Checkbox
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                            {campaignLayers
                              .filter(layer => !layer.parent || layer.parent === 'null') // Robust check for root layers
                              .map(layer => renderLayerTreeItem(layer, 0))}
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Center Panel - Canvas (Enhanced with Device Selection) */}
                  <div style={{ flex: 1, backgroundColor: colors.gray[100], display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Preview Toolbar */}
                    <PreviewToolbar
                      selectedDevice={selectedDevice}
                      onDeviceChange={setSelectedDevice}
                      zoom={previewZoom}
                      onZoomChange={setPreviewZoom}
                      showGrid={showGrid}
                      onGridToggle={() => setShowGrid(!showGrid)}
                      onScreenshot={() => {
                        // TODO: Implement screenshot functionality
                        toast.info('Screenshot feature coming soon!');
                      }}
                    />

                    {/* Phone Preview */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'auto' }}>
                      <PhonePreview
                        device={DEVICE_PRESETS.find(d => d.id === selectedDevice) || DEVICE_PRESETS[0]}
                        zoom={previewZoom}
                        showGrid={showGrid}
                        backgroundUrl={selectedPage?.imageUrl}
                        pageContext={selectedPage}
                      >
                        {renderCanvasPreview()}
                      </PhonePreview>
                    </div>

                    {selectedLayerObj && (
                      <div style={{ position: 'absolute', bottom: '60px', right: '60px', padding: '6px 12px', backgroundColor: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 500, color: colors.text.secondary, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        {selectedLayerObj.name}
                      </div>
                    )}
                  </div>

                  {/* Right Panel - Properties */}
                  <div style={{ width: '320px', borderLeft: `1px solid ${colors.gray[200]}`, backgroundColor: colors.background.card, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ borderBottom: `1px solid ${colors.gray[200]}`, display: 'flex' }}>
                      <button onClick={() => setPropertyTab('style')} style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', borderBottom: propertyTab === 'style' ? `2px solid ${colors.primary[500]}` : '2px solid transparent', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: propertyTab === 'style' ? colors.primary[500] : colors.text.secondary, transition: 'all 0.2s' }}>
                        Style
                      </button>
                      <button onClick={() => setPropertyTab('actions')} style={{ flex: 1, padding: '12px', border: 'none', background: 'transparent', borderBottom: propertyTab === 'actions' ? `2px solid ${colors.primary[500]}` : '2px solid transparent', fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: propertyTab === 'actions' ? colors.primary[500] : colors.text.secondary, transition: 'all 0.2s' }}>
                        Actions
                      </button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                      {propertyTab === 'style' && renderLayerProperties()}
                      {propertyTab === 'actions' && (
                        <div style={{ padding: '0 4px' }}>
                          {renderLayerActions()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};



