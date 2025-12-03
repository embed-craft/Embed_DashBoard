import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateCampaignConfig, validateLayer } from '@/lib/configValidator';
import { metadataService, EventDefinition, PropertyDefinition } from '@/services/metadataService';

// Layer Types - Extended for Phase 2 & 3.5
export type LayerType =
  | 'media' | 'text' | 'button' | 'container' | 'icon' | 'handle' | 'overlay' | 'arrow' | 'video' | 'controls'
  | 'progress-bar' | 'progress-circle' | 'countdown' | 'list' | 'input' | 'statistic'
  | 'rating' | 'badge' | 'gradient-overlay' | 'checkbox';

export interface LayerContent {
  // Media content
  imageUrl?: string;
  imageSize?: { width: number; height: number };
  videoUrl?: string;
  iconName?: string;

  // Text content
  text?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';

  // Button content
  label?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline' | 'ghost';
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'glass' | 'gradient' | 'shine' | '3d' | 'elevated' | 'neumorphic' | 'pill' | 'underline' | 'glow' | 'cyberpunk' | 'two-tone' | 'comic' | 'skeuomorphic' | 'liquid' | 'block';
  themeColor?: string;
  buttonIcon?: string; // Lucide icon name
  buttonIconPosition?: 'left' | 'right';
  action?: {
    type: 'close' | 'deeplink' | 'navigate' | 'custom';
    url?: string;
    trackConversion?: boolean;
    autoDismiss?: boolean;
  };

  // Progress content (Phase 2)
  value?: number;
  max?: number;
  showPercentage?: boolean;
  progressVariant?: 'simple' | 'semicircle' | 'thick' | 'dashed';
  progressBarVariant?: 'simple' | 'rounded' | 'striped' | 'animated' | 'gradient' | 'segmented' | 'glow';
  milestones?: { value: number; label: string; color: string }[];

  // Countdown content (Phase 2)
  endTime?: string;
  format?: 'HH:MM:SS' | 'MM:SS' | 'auto';
  timerVariant?: 'text' | 'card' | 'circular' | 'flip' | 'digital' | 'bubble' | 'minimal' | 'neon';
  urgencyThreshold?: number;
  autoHide?: boolean;

  // List content (Phase 2)
  items?: string[];
  listStyle?: 'bullet' | 'numbered' | 'checkmark' | 'icon';

  // Input content (Phase 2)
  inputType?: 'text' | 'email' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  validation?: string;

  // Statistic content (Phase 2)
  prefix?: string;
  suffix?: string;
  animateOnLoad?: boolean;

  // Rating content (Phase 3.5)
  maxStars?: number; // Total stars (default: 5)
  rating?: number; // Current rating value (0-5, supports decimals like 4.5)
  reviewCount?: number; // Number of reviews
  showReviewCount?: boolean;
  interactive?: boolean; // Allow user to rate
  filledIcon?: string; // Custom filled star icon
  emptyIcon?: string; // Custom empty star icon

  // Badge content (Phase 3.5)
  badgeText?: string;
  badgeVariant?: 'success' | 'error' | 'warning' | 'info' | 'custom';
  badgeIcon?: string; // Lucide icon name
  badgeIconPosition?: 'left' | 'right';
  pulse?: boolean; // Pulse animation

  // Gradient Overlay content (Phase 3.5)
  gradientType?: 'linear' | 'radial';
  gradientDirection?: 'to-top' | 'to-bottom' | 'to-left' | 'to-right' | number;
  gradientStops?: Array<{ color: string; position: number }>;

  // Checkbox content
  checkboxLabel?: string;
  checked?: boolean;
  checkboxColor?: string;

  // Container-specific (Phase 1)
  containerPosition?: string;
  maxWidth?: number;
}

export interface LayerStyle {
  backgroundColor?: string;
  borderRadius?: number | string | { topLeft: number | string; topRight: number | string; bottomRight: number | string; bottomLeft: number | string };
  borderColor?: string;
  borderWidth?: number | { top: number; right: number; bottom: number; left: number };
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  padding?: { top: number | string; right: number | string; bottom: number | string; left: number | string } | number | string;
  margin?: { top: number | string; right: number | string; bottom: number | string; left: number | string } | number | string;
  opacity?: number;
  boxShadow?: string; // Support for multiple shadows comma-separated

  // Layout & Display
  display?: 'flex' | 'block' | 'inline-block' | 'grid' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: number;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  cursor?: 'default' | 'pointer' | 'not-allowed' | 'grab' | 'text' | 'move' | 'help' | 'wait';

  // Positioning (Phase 1)
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;
  transformOrigin?: string;

  // Dimensions
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;

  // Typography Enhancements
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number | string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  textDecorationColor?: string;
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
  textShadow?: string;
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap';
  color?: string; // Text color

  // Advanced Background (Phase 2)
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  backgroundPosition?: string;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
  backgroundAttachment?: 'scroll' | 'fixed' | 'local';
  backgroundBlendMode?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    colors: Array<{ color: string; position: number }>;
  };

  // Shapes & Geometry (Phase 1)
  clipPath?: string; // polygon, circle, ellipse, path
  maskImage?: string;

  // Badge Specific (Phase 3.5)
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  badgeBorderRadius?: number;
  badgePadding?: number | { horizontal: number; vertical: number };

  // Rating Specific (Phase 3.5)
  starColor?: string;
  emptyStarColor?: string;
  starSize?: number;
  starSpacing?: number;

  // Layout Override
  layout?: 'column' | 'row' | 'freeform';

  // Image Specific
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;

  // Filters & Effects (Phase 2)
  filter?: {
    blur?: number;
    brightness?: number;
    contrast?: number;
    grayscale?: number;
  };
  backdropFilter?: string; // blur for glassmorphism
  mixBlendMode?: string;

  // Transform (Phase 1)
  transform?: {
    rotate?: number;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
    translateX?: number | string;
    translateY?: number | string;
  };
  perspective?: number | string;

  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Transitions & Animations (Phase 2)
  transition?: string;
  animation?: string;

  // Custom CSS (God Mode)
  customCss?: string;
}

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  parent: string | null;
  children: string[];

  // Visibility & Interaction
  visible: boolean;
  locked: boolean;
  zIndex: number;

  // Position & Size (Phase 3.5 - Enhanced for absolute positioning)
  position: {
    x: number;
    y: number;
    type?: 'absolute' | 'relative'; // Default: relative
  };
  size: {
    width: number | 'auto' | string; // Support '50%', '100px', etc
    height: number | 'auto' | string;
  };

  // Content & Style
  content: LayerContent;
  style: LayerStyle;
}

export interface TargetingRule {
  id: string;
  type: 'user_property' | 'event' | 'group';
  logic?: 'AND' | 'OR'; // For groups
  children?: TargetingRule[]; // For groups

  // User Property Logic
  property?: string;
  operator?: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'set' | 'not_set';
  value?: string | number | boolean;

  // Event Logic
  event?: string;
  eventProperty?: string; // Deprecated in favor of properties array
  properties?: {
    id: string;
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'set' | 'not_set';
    value: string | number | boolean;
  }[];
  count?: number;
  timeWindow?: number; // In seconds
}

export interface DisplayRules {
  frequency: {
    type: 'every_time' | 'once_per_session' | 'daily' | 'weekly' | 'monthly' | 'custom';
    value?: number; // e.g., 1 time per day
  };
  interactionLimit: {
    type: 'unlimited' | 'limited';
    value?: number; // Max X times total
  };
  sessionLimit: {
    enabled: boolean;
    value?: number; // Max X times per session
  };
  overrideGlobal: boolean;
  pages?: string[];
  sdkVersion?: { operator: 'equals' | 'greater_than' | 'less_than'; value: string };
  priority: number;
  platforms: ('web' | 'ios' | 'android')[];
}

export interface CampaignGoal {
  event: string;
  rolloutPercentage: number; // 0-100
}

// Bottom Sheet Configuration (Phase 1 & 3)
export interface BottomSheetConfig {
  mode?: 'container' | 'image-only'; // ✅ NEW: Image-only mode
  height: 'auto' | 'half' | 'full' | number | string; // Fix 8: Support vh/% units
  maxHeight?: number;
  minHeight?: number;
  dragHandle: boolean;
  swipeToDismiss: boolean;
  swipeThreshold?: number;
  dismissVelocity?: number;
  backgroundColor: string;
  backgroundImageUrl?: string; // ✅ NEW: For image-only mode
  backgroundSize?: 'cover' | 'contain' | 'fill'; // ✅ NEW
  backgroundPosition?: string; // ✅ NEW
  layoutMode?: 'stack' | 'freeform'; // ✅ NEW: Layout mode support
  borderRadius: { topLeft: number; topRight: number; bottomRight?: number; bottomLeft?: number }; // Fix 9
  elevation: 0 | 1 | 2 | 3 | 4 | 5;
  customShadow?: string;
  overlay: {
    enabled: boolean;
    opacity: number;
    blur: number;
    color: string;
    dismissOnClick: boolean;
  };
  animation: {
    type: 'slide' | 'fade' | 'bounce';
    duration: number;
    easing: string;
  };
  background?: {
    type: 'solid' | 'gradient' | 'image' | 'pattern';
    value: string;
    opacity?: number;
  };
  safeArea?: {
    top: boolean;
    bottom: boolean;
  };
}

export interface ModalConfig {
  mode?: 'container' | 'image-only';
  width?: number | string;
  height?: 'auto' | number | string;
  backgroundColor: string;
  backgroundImageUrl?: string;
  backgroundSize?: 'cover' | 'contain' | 'fill';
  backgroundPosition?: string;
  borderRadius?: number | { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number };
  elevation: 0 | 1 | 2 | 3 | 4 | 5;
  overlay: {
    enabled: boolean;
    opacity: number;
    blur: number;
    color: string;
    dismissOnClick: boolean;
  };
  animation: {
    type: 'pop' | 'fade' | 'slide' | 'scale';
    duration: number;
    easing: string;
  };
}

// Template System (Phase 1)
export interface BottomSheetTemplate {
  id: string;
  name: string;
  category: 'ecommerce' | 'engagement' | 'onboarding' | 'notification' | 'survey' | 'promotion' | 'delivery' | 'transport'; // Fix 9
  thumbnail: string;
  description: string;
  layers: Layer[];
  config: BottomSheetConfig;
  tags?: string[];
  featured?: boolean;
}

export interface CampaignEditor {
  id: string;
  name: string;
  experienceType: 'nudges' | 'messages' | 'stories' | 'challenges' | 'streaks' | 'survey';
  nudgeType: 'modal' | 'banner' | 'bottomsheet' | 'tooltip' | 'pip' | 'scratchcard' | 'carousel' | 'inline';

  // Trigger configuration (industry-standard events)
  trigger?: string; // e.g., 'screen_viewed', 'button_clicked', 'product_viewed'
  screen?: string; // e.g., 'home', 'product_detail', 'checkout'
  status?: 'active' | 'paused' | 'draft';
  tags?: string[]; // ✅ FIX: Add tags property

  layers: Layer[];
  targeting: TargetingRule[];
  displayRules: DisplayRules;
  goal?: CampaignGoal;

  // Bottom sheet specific config (Phase 3)
  bottomSheetConfig?: BottomSheetConfig;
  modalConfig?: ModalConfig;
  bannerConfig?: any;
  tooltipConfig?: any;
  pipConfig?: any;
  floaterConfig?: any;

  // Editor state
  selectedLayerId: string | null;

  // History for undo/redo
  history: Layer[][];
  historyIndex: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastSaved?: string;
  isDirty: boolean;
}

interface EditorStore {
  // Current campaign being edited
  currentCampaign: CampaignEditor | null;

  // UI State
  activeTab: 'design' | 'targeting';
  propertyTab: 'style' | 'actions';
  showEditor: boolean;
  isSaving: boolean;
  saveError: string | null;

  duplicateLayer: (id: string) => string;
  reorderLayer: (id: string, newIndex: number) => void;
  moveLayerToParent: (layerId: string, newParentId: string | null) => void;
  selectLayer: (id: string | null) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;

  // Actions - Content
  updateLayerContent: (id: string, content: Partial<LayerContent>) => void;
  updateLayerStyle: (id: string, style: Partial<LayerStyle>) => void;
  updateTrigger: (trigger: string) => void; // ✅ FIX: Add updateTrigger to interface

  // Actions - Bottom Sheet Config (Phase 3)
  updateBottomSheetConfig: (config: Partial<BottomSheetConfig>) => void;
  updateModalConfig: (config: Partial<ModalConfig>) => void;
  updateBannerConfig: (config: any) => void;
  updateTooltipConfig: (config: any) => void;
  updatePipConfig: (config: any) => void;
  updateFloaterConfig: (config: any) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Actions - UI
  setActiveTab: (tab: 'design' | 'targeting') => void;
  setPropertyTab: (tab: 'style' | 'actions') => void;
  setShowEditor: (show: boolean) => void;

  // Auto-save
  enableAutoSave: () => void;
  disableAutoSave: () => void;

  // Metadata (Events & Properties)
  availableEvents: EventDefinition[];
  availableProperties: PropertyDefinition[];
  isLoadingMetadata: boolean;
  fetchMetadata: () => Promise<void>;
  createEvent: (event: Partial<EventDefinition>) => Promise<EventDefinition>;
  createProperty: (property: Partial<PropertyDefinition>) => Promise<PropertyDefinition>;
  saveCampaign: () => Promise<void>; // ✅ FIX: Add saveCampaign to interface
}

// Debounced history tracker to prevent race conditions
let historyTimeout: NodeJS.Timeout | null = null;
const HISTORY_DEBOUNCE_MS = 300;

// Debounced auto-save to prevent rate limiting
let autoSaveTimeout: NodeJS.Timeout | null = null;
const AUTO_SAVE_DEBOUNCE_MS = 3000; // 3 seconds debounce

// FIX #3: Mutex lock to prevent concurrent saves
let saveMutex = false;

const saveToHistoryDebounced = (get: () => EditorStore, set: (state: Partial<EditorStore>) => void) => {
  if (historyTimeout) {
    clearTimeout(historyTimeout);
  }

  historyTimeout = setTimeout(() => {
    const { currentCampaign } = get();
    if (!currentCampaign) return;

    const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
    newHistory.push(currentCampaign.layers);

    set({
      currentCampaign: {
        ...currentCampaign,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      },
    });
    historyTimeout = null;
  }, HISTORY_DEBOUNCE_MS);
};

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentCampaign: null,
      activeTab: 'design',
      propertyTab: 'style',
      showEditor: false,
      isSaving: false,
      saveError: null,

      // Metadata Initial State
      availableEvents: [],
      availableProperties: [],
      isLoadingMetadata: false,

      // Metadata Actions
      fetchMetadata: async () => {
        set({ isLoadingMetadata: true });
        try {
          const [events, properties] = await Promise.all([
            metadataService.getEvents(),
            metadataService.getProperties()
          ]);
          set({ availableEvents: events, availableProperties: properties, isLoadingMetadata: false });
        } catch (error) {
          console.error('Failed to fetch metadata:', error);
          set({ isLoadingMetadata: false });
        }
      },

      createEvent: async (event) => {
        try {
          const newEvent = await metadataService.createEvent(event);
          set((state) => ({ availableEvents: [...state.availableEvents, newEvent] }));
          return newEvent;
        } catch (error) {
          console.error('Failed to create event:', error);
          throw error;
        }
      },

      createProperty: async (property) => {
        try {
          const newProperty = await metadataService.createProperty(property);
          set((state) => ({ availableProperties: [...state.availableProperties, newProperty] }));
          return newProperty;
        } catch (error) {
          console.error('Failed to create property:', error);
          throw error;
        }
      },

      // Create new campaign
      createCampaign: (experienceType, nudgeType) => {
        const defaultLayers = getDefaultLayersForNudgeType(nudgeType);

        // FIX #4: Generate unique ID using UUID pattern
        const uniqueId = `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        const newCampaign: CampaignEditor = {
          id: uniqueId,
          name: 'New Campaign',
          experienceType,
          nudgeType,
          trigger: 'screen_viewed', // Default trigger
          screen: '', // Will be set by user
          status: 'draft',
          layers: defaultLayers,
          targeting: [],
          displayRules: {
            frequency: { type: 'every_time' },
            interactionLimit: { type: 'unlimited' },
            sessionLimit: { enabled: false },
            overrideGlobal: false,
            priority: 50,
            platforms: ['ios', 'android'],
          },
          goal: { event: '', rolloutPercentage: 100 },
          // Initialize bottom sheet config for bottom sheet nudge type (Phase 3)
          bottomSheetConfig: nudgeType === 'bottomsheet' ? {
            mode: 'container', // Default to container mode
            height: 'auto',
            dragHandle: true,
            swipeToDismiss: true,
            backgroundColor: '#FFFFFF',
            backgroundImageUrl: '', // For image-only mode
            backgroundSize: 'cover', // For image-only mode
            backgroundPosition: 'center center', // For image-only mode
            borderRadius: { topLeft: 16, topRight: 16 },
            elevation: 2,
            overlay: {
              enabled: true,
              opacity: 0.5,
              blur: 0,
              color: '#000000',
              dismissOnClick: true,
            },
            animation: {
              type: 'slide',
              duration: 300,
              easing: 'ease-out',
            },
          } : undefined,
          // Initialize modal config for modal nudge type
          modalConfig: nudgeType === 'modal' ? {
            mode: 'container',
            width: '90%',
            height: 'auto',
            backgroundColor: '#FFFFFF',
            backgroundImageUrl: '',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            borderRadius: 16,
            elevation: 2,
            overlay: {
              enabled: true,
              opacity: 0.5,
              blur: 0,
              color: '#000000',
              dismissOnClick: true,
            },
          } : undefined,
          // Initialize floater config for floater nudge type
          floaterConfig: nudgeType === 'floater' ? {
            position: 'bottom-right',
            mode: 'image-only',
            shape: 'circle',
            width: 60,
            height: 60,
            backgroundColor: '#10B981',
            borderRadius: 30,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            opacity: 1,
            offsetX: 20,
            offsetY: 20,
            glassmorphism: {
              enabled: false,
              blur: 10,
              opacity: 0.7,
            },
            gradient: {
              enabled: false,
              startColor: '#10B981',
              endColor: '#059669',
              angle: 135,
            },
            animation: {
              type: 'scale',
              duration: 300,
            },
          } : undefined,
          selectedLayerId: defaultLayers[0]?.id || null,
          history: [defaultLayers],
          historyIndex: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDirty: false,
        };

        set({ currentCampaign: newCampaign, showEditor: true });
      },

      // Load existing campaign
      loadCampaign: async (campaign: CampaignEditor | string) => {
        try {
          let campaignData: CampaignEditor;

          // If string is passed, ALWAYS fetch from backend (don't use localStorage cache)
          if (typeof campaign === 'string') {
            console.log('loadCampaign: Fetching campaign from server:', campaign);
            const api = await import('@/lib/api');
            campaignData = await api.loadCampaign(campaign);
            console.log('loadCampaign: Campaign fetched from server:', campaignData.id, campaignData.name);
          } else {
            // Validate and sanitize campaign config
            const validationResult = validateCampaignConfig(campaign);

            if (!validationResult.isValid) {
              console.error('Campaign validation errors:', validationResult.errors);
              // Don't load invalid campaigns
              return;
            }

            if (validationResult.warnings.length > 0) {
              console.warn('Campaign validation warnings:', validationResult.warnings);
            }

            campaignData = validationResult.sanitized;
          }

          // FIX #1: Ensure loaded campaign has valid lastSaved to prevent duplicate creation
          if (!campaignData.lastSaved && campaignData.id) {
            campaignData.lastSaved = campaignData.updatedAt || new Date().toISOString();
          }

          // FIX #15: Reset selectedLayerId when loading new campaign
          const loadedCampaign = {
            ...campaignData,
            selectedLayerId: campaignData.layers[0]?.id || null, // Select first layer by default
            isDirty: false, // Mark as clean since we just loaded from server
          };

          console.log('loadCampaign: Setting campaign in store:', loadedCampaign.id);
          set({
            currentCampaign: loadedCampaign,
            showEditor: true
          });
        } catch (error) {
          console.error('Load campaign error:', error);
          // FIX #6: Reset to safe state on load failure
          set({ currentCampaign: null, showEditor: false });
          if (typeof window !== 'undefined' && (window as any).toast) {
            (window as any).toast.error('Failed to load campaign');
          }
          throw error;
        }
      },

      // Load template layers into current campaign
      loadTemplate: (layers) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        // Validate each layer
        const validatedLayers = layers.map(layer => {
          const result = validateLayer(layer);
          if (!result.isValid) {
            console.error(`Layer ${layer.id} validation errors:`, result.errors);
          }
          if (result.warnings.length > 0) {
            console.warn(`Layer ${layer.id} warnings:`, result.warnings);
          }
          return result.sanitized;
        });

        // Save to history
        const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
        newHistory.push(validatedLayers);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: validatedLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            selectedLayerId: layers[0]?.id || null,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update campaign name
      updateCampaignName: (name) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            name,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update tags
      updateTags: (tags) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            tags, // Add tags to campaign
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update trigger event
      updateTrigger: (trigger) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            trigger,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update screen
      updateScreen: (screen) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            screen,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update status
      updateStatus: (status) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            status,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },



      // Save campaign
      saveCampaign: async () => {
        const { currentCampaign } = get();
        if (!currentCampaign) {
          console.warn('saveCampaign: No current campaign');
          return;
        }

        // FIX #3: Prevent concurrent saves with mutex lock
        if (saveMutex) {
          console.warn('saveCampaign: Save already in progress, skipping');
          return;
        }

        // FIX #5: Validate campaign before save
        if (!currentCampaign.name || currentCampaign.name.trim() === '') {
          throw new Error('Campaign name is required');
        }

        if (!currentCampaign.layers || currentCampaign.layers.length === 0) {
          throw new Error('Campaign must have at least one layer');
        }

        console.log('saveCampaign: Starting save for campaign:', currentCampaign.id);
        saveMutex = true;
        set({ isSaving: true, saveError: null });

        try {
          // Import API dynamically to avoid circular dependencies
          const api = await import('@/lib/api');
          console.log('saveCampaign: Calling API...');
          const savedCampaign = await api.saveCampaign(currentCampaign);
          console.log('saveCampaign: Success, received:', savedCampaign);

          const updatedCampaign = {
            ...currentCampaign,
            // ✅ FIX: Prioritize backend ID (_id) to prevent CastError on subsequent updates
            id: savedCampaign._id || savedCampaign.id || currentCampaign.id,
            lastSaved: new Date().toISOString(),
            isDirty: false,
          };

          set({
            currentCampaign: updatedCampaign,
            isSaving: false,
            saveError: null,
          });

          // Sync with dashboard store (useStore)
          try {
            const { useStore } = await import('./useStore');
            const dashboardStore = useStore.getState();

            // Convert to dashboard Campaign format
            const dashboardCampaign = {
              id: savedCampaign.id || updatedCampaign.id,
              name: savedCampaign.name,
              status: savedCampaign.status as 'active' | 'paused' | 'draft',
              trigger: savedCampaign.trigger,
              segment: 'All Users',
              impressions: 0,
              clicks: 0,
              conversions: 0,
              conversion: '0.0',
              config: {
                type: savedCampaign.type,
                text: savedCampaign.config.text || '',
                backgroundColor: savedCampaign.config.backgroundColor || '#FFFFFF',
                textColor: savedCampaign.config.textColor || '#000000',
                buttonText: savedCampaign.config.buttonText,
                position: savedCampaign.config.position,
                ...savedCampaign.config,
              },
              rules: savedCampaign.rules.map(r => ({
                id: r.id,
                type: r.type as 'event' | 'attribute',
                field: r.field,
                operator: r.operator,
                value: String(r.value),
              })),
              createdAt: savedCampaign.createdAt || new Date().toISOString(),
              updatedAt: savedCampaign.updatedAt || new Date().toISOString(),
            };

            // Check if campaign exists in dashboard store
            const existingCampaign = dashboardStore.campaigns.find(c => c.id === dashboardCampaign.id);

            if (existingCampaign) {
              // Update existing campaign
              dashboardStore.updateCampaign(dashboardCampaign.id, dashboardCampaign);
              console.log('saveCampaign: Updated existing campaign in dashboard store');
            } else {
              // Add new campaign
              dashboardStore.addCampaign(dashboardCampaign);
              console.log('saveCampaign: Added new campaign to dashboard store');
            }
          } catch (syncError) {
            console.warn('saveCampaign: Failed to sync with dashboard store:', syncError);
          }

          console.log('saveCampaign: Updated store state');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save campaign';
          console.error('saveCampaign: Error occurred:', error);

          set({
            isSaving: false,
            saveError: errorMessage,
          });

          throw error;
        } finally {
          // FIX #3: Always release mutex lock
          saveMutex = false;
        }
      },

      // Add layer
      addLayer: (type, parentId) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return '';

        // FIX #7: Generate unique layer ID to prevent duplicates
        const uniqueLayerId = `layer_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        // Check if parent is PIP Container
        const parentLayer = currentCampaign.layers.find(l => l.id === parentId);
        const isPipContainer = parentLayer?.name === 'PIP Container';

        let initialStyle = getDefaultStyleForType(type);

        // Apply specific styles for PIP layers
        if (isPipContainer) {
          initialStyle = {
            ...initialStyle,
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: { translateX: '-50%' }, // Store as object for consistency
            zIndex: 100,
            width: '90%', // Default to 90% width for PIP buttons
          };
        }

        const newLayer: Layer = {
          id: uniqueLayerId,
          type,
          name: `New ${type}`,
          parent: parentId || null,
          children: [],
          visible: true,
          locked: false,
          zIndex: currentCampaign.layers.length,
          position: { x: 0, y: 0 },
          size: { width: 'auto', height: 'auto' },
          content: getDefaultContentForType(type),
          style: initialStyle,
        };

        const updatedLayers = [...currentCampaign.layers, newLayer];

        // Update parent's children array
        if (parentId) {
          const parentIndex = updatedLayers.findIndex(l => l.id === parentId);
          if (parentIndex !== -1) {
            updatedLayers[parentIndex] = {
              ...updatedLayers[parentIndex],
              children: [...updatedLayers[parentIndex].children, newLayer.id],
            };
          }
        }

        // Save to history
        const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
        newHistory.push(updatedLayers);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            selectedLayerId: newLayer.id,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });

        return newLayer.id;
      },

      // Update layer
      updateLayer: (id, updates) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedLayers = currentCampaign.layers.map(layer =>
          layer.id === id ? { ...layer, ...updates } : layer
        );

        // Save to history
        const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
        newHistory.push(updatedLayers);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Delete layer
      deleteLayer: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const layer = currentCampaign.layers.find(l => l.id === id);
        if (!layer) return;

        // Remove from parent's children
        let updatedLayers = currentCampaign.layers.map(l => {
          if (l.id === layer.parent) {
            return {
              ...l,
              children: l.children.filter(childId => childId !== id),
            };
          }
          return l;
        });

        // Delete the layer and all its children recursively
        const deleteRecursive = (layerId: string) => {
          const toDelete = updatedLayers.find(l => l.id === layerId);
          if (toDelete) {
            toDelete.children.forEach(childId => deleteRecursive(childId));
            updatedLayers = updatedLayers.filter(l => l.id !== layerId);
          }
        };

        deleteRecursive(id);

        // Save to history
        const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
        newHistory.push(updatedLayers);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            selectedLayerId: currentCampaign.selectedLayerId === id ? null : currentCampaign.selectedLayerId,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Duplicate layer
      duplicateLayer: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return '';

        const layer = currentCampaign.layers.find(l => l.id === id);
        if (!layer) return '';

        const newLayer: Layer = {
          ...layer,
          id: `layer_${Date.now()}`,
          name: `${layer.name} Copy`,
          children: [], // Don't duplicate children for simplicity
        };

        const updatedLayers = [...currentCampaign.layers, newLayer];

        // Update parent's children
        if (layer.parent) {
          const parentIndex = updatedLayers.findIndex(l => l.id === layer.parent);
          if (parentIndex !== -1) {
            updatedLayers[parentIndex] = {
              ...updatedLayers[parentIndex],
              children: [...updatedLayers[parentIndex].children, newLayer.id],
            };
          }
        }

        // Save to history
        const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
        newHistory.push(updatedLayers);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            selectedLayerId: newLayer.id,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });

        return newLayer.id;
      },

      // Select layer
      selectLayer: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            selectedLayerId: id,
          },
        });
      },

      // Toggle visibility
      toggleLayerVisibility: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedLayers = currentCampaign.layers.map(layer =>
          layer.id === id ? { ...layer, visible: !layer.visible } : layer
        );

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Toggle lock
      toggleLayerLock: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedLayers = currentCampaign.layers.map(layer =>
          layer.id === id ? { ...layer, locked: !layer.locked } : layer
        );

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Reorder layer
      reorderLayer: (id, newIndex) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const oldIndex = currentCampaign.layers.findIndex(l => l.id === id);
        if (oldIndex === -1) return;

        const updatedLayers = [...currentCampaign.layers];
        const [removed] = updatedLayers.splice(oldIndex, 1);
        updatedLayers.splice(newIndex, 0, removed);

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Move layer to new parent
      moveLayerToParent: (layerId, newParentId) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const layer = currentCampaign.layers.find(l => l.id === layerId);
        if (!layer) return;

        const oldParentId = layer.parent;

        // Update layers
        const updatedLayers = currentCampaign.layers.map(l => {
          // Remove from old parent's children
          if (l.id === oldParentId && l.children) {
            return {
              ...l,
              children: l.children.filter(childId => childId !== layerId)
            };
          }

          // Add to new parent's children
          if (l.id === newParentId) {
            return {
              ...l,
              children: [...(l.children || []), layerId]
            };
          }

          // Update the moved layer's parent
          if (l.id === layerId) {
            return {
              ...l,
              parent: newParentId
            };
          }

          return l;
        });

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update layer content
      updateLayerContent: (id, content) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedLayers = currentCampaign.layers.map(layer =>
          layer.id === id
            ? { ...layer, content: { ...layer.content, ...content } }
            : layer
        );

        // Update immediately, debounce history save
        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });

        // Debounced history save to prevent race conditions
        saveToHistoryDebounced(get, set);
      },

      // Update layer style
      updateLayerStyle: (id, style) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedLayers = currentCampaign.layers.map(layer =>
          layer.id === id
            ? { ...layer, style: { ...layer.style, ...style } }
            : layer
        );

        // Update immediately, debounce history save
        set({
          currentCampaign: {
            ...currentCampaign,
            layers: updatedLayers,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });

        // Debounced history save to prevent race conditions
        saveToHistoryDebounced(get, set);
      },

      // Update bottom sheet config (Phase 3)
      updateBottomSheetConfig: (config) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const currentConfig = currentCampaign.bottomSheetConfig || {
          height: 'auto',
          dragHandle: true,
          swipeToDismiss: true,
          backgroundColor: '#FFFFFF',
          borderRadius: { topLeft: 16, topRight: 16 },
          elevation: 2,
          overlay: {
            enabled: true,
            opacity: 0.5,
            blur: 0,
            color: '#000000',
            dismissOnClick: true,
          },
          animation: {
            type: 'slide',
            duration: 300,
            easing: 'ease-out',
          },
        };

        // Deep merge for nested objects
        const updatedConfig = { ...currentConfig };
        Object.keys(config).forEach(key => {
          if (config[key] && typeof config[key] === 'object' && !Array.isArray(config[key])) {
            updatedConfig[key] = { ...currentConfig[key], ...config[key] };
          } else {
            updatedConfig[key] = config[key];
          }
        });

        set({
          currentCampaign: {
            ...currentCampaign,
            bottomSheetConfig: updatedConfig,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update PIP config
      updatePipConfig: (config: any) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const currentConfig = currentCampaign.pipConfig || {};
        const updatedConfig = { ...currentConfig, ...config };

        set({
          currentCampaign: {
            ...currentCampaign,
            pipConfig: updatedConfig,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update Modal config
      updateModalConfig: (config: any) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const defaults = {
          mode: 'container',
          width: '90%',
          height: 'auto',
          backgroundColor: '#FFFFFF',
          elevation: 2,
          overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
          animation: { type: 'pop', duration: 300, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
        };

        const currentConfig = currentCampaign.modalConfig || defaults;

        // Deep merge for nested objects
        const updatedConfig = { ...currentConfig };
        Object.keys(config).forEach(key => {
          if (config[key] && typeof config[key] === 'object' && !Array.isArray(config[key])) {
            updatedConfig[key] = { ...(currentConfig[key] || {}), ...config[key] };
          } else {
            updatedConfig[key] = config[key];
          }
        });

        set({
          currentCampaign: {
            ...currentCampaign,
            modalConfig: updatedConfig,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update Banner config
      updateBannerConfig: (config: any) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;
        set({
          currentCampaign: {
            ...currentCampaign,
            bannerConfig: { ...(currentCampaign.bannerConfig || {}), ...config },
            isDirty: true,
          },
        });
      },

      // Update Floater config
      updateFloaterConfig: (config: any) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            floaterConfig: { ...currentCampaign.floaterConfig, ...config },
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update Tooltip config
      updateTooltipConfig: (config: any) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;
        set({
          currentCampaign: {
            ...currentCampaign,
            tooltipConfig: { ...(currentCampaign.tooltipConfig || {}), ...config },
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Add targeting rule
      addTargetingRule: (rule) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const newRule: TargetingRule = {
          ...rule,
          id: `rule_${Date.now()}`,
        };

        set({
          currentCampaign: {
            ...currentCampaign,
            targeting: [...currentCampaign.targeting, newRule],
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update targeting rule
      updateTargetingRule: (id, rule) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedRules = currentCampaign.targeting.map(r =>
          r.id === id ? { ...r, ...rule } : r
        );

        set({
          currentCampaign: {
            ...currentCampaign,
            targeting: updatedRules,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Delete targeting rule
      deleteTargetingRule: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            targeting: currentCampaign.targeting.filter(r => r.id !== id),
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Reset current campaign
      resetCurrentCampaign: () => {
        set({ currentCampaign: null, showEditor: false });
      },

      // Update display rules
      updateDisplayRules: (rules) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            displayRules: { ...currentCampaign.displayRules, ...rules },
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Update goal
      updateGoal: (goal) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            goal: { ...currentCampaign.goal, ...goal } as CampaignGoal,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Undo
      undo: () => {
        const { currentCampaign } = get();
        if (!currentCampaign || currentCampaign.historyIndex <= 0) return;

        const newIndex = currentCampaign.historyIndex - 1;
        const previousLayers = currentCampaign.history[newIndex];

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: previousLayers,
            historyIndex: newIndex,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Redo
      redo: () => {
        const { currentCampaign } = get();
        if (!currentCampaign || currentCampaign.historyIndex >= currentCampaign.history.length - 1) return;

        const newIndex = currentCampaign.historyIndex + 1;
        const nextLayers = currentCampaign.history[newIndex];

        set({
          currentCampaign: {
            ...currentCampaign,
            layers: nextLayers,
            historyIndex: newIndex,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      // Can undo
      canUndo: () => {
        const { currentCampaign } = get();
        return !!currentCampaign && currentCampaign.historyIndex > 0;
      },

      // Can redo
      canRedo: () => {
        const { currentCampaign } = get();
        return !!currentCampaign && currentCampaign.historyIndex < currentCampaign.history.length - 1;
      },

      // Set active tab
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Set property tab
      setPropertyTab: (tab) => set({ propertyTab: tab }),

      // Set show editor
      setShowEditor: (show) => set({ showEditor: show }),

      // Auto-save (debounced to prevent rate limiting)
      enableAutoSave: () => {
        const debouncedSave = () => {
          if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
          }

          autoSaveTimeout = setTimeout(() => {
            const { currentCampaign, saveCampaign } = get();
            if (currentCampaign?.isDirty) {
              console.log('Auto-save: Saving campaign...');
              saveCampaign();
            }
            autoSaveTimeout = null;
          }, AUTO_SAVE_DEBOUNCE_MS);
        };

        // Check every 1 second, but only save after 3 seconds of inactivity
        const interval = setInterval(() => {
          const { currentCampaign } = get();
          if (currentCampaign?.isDirty) {
            debouncedSave();
          }
        }, 1000);

        // Store interval ID for cleanup
        (window as any).__autoSaveInterval = interval;
      },

      // Disable auto-save
      disableAutoSave: () => {
        if ((window as any).__autoSaveInterval) {
          clearInterval((window as any).__autoSaveInterval);
          delete (window as any).__autoSaveInterval;
        }
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout);
          autoSaveTimeout = null;
        }
      },
    }),
    {
      name: 'campaign-storage',
      partialize: (state) => ({
        currentCampaign: state.currentCampaign ? {
          ...state.currentCampaign,
          history: [], // Don't persist history
          historyIndex: 0
        } : null,
        // Persist other UI preferences if needed
        showEditor: state.showEditor,
      }),
    }
  )
);

// Helper functions
function getDefaultLayersForNudgeType(nudgeType: CampaignEditor['nudgeType']): Layer[] {
  const baseId = Date.now();

  switch (nudgeType) {
    case 'bottomsheet':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'Bottom Sheet',
          parent: null,
          children: [`layer_${baseId + 1}`, `layer_${baseId + 2}`, `layer_${baseId + 3}`, `layer_${baseId + 4}`],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 'auto' },
          content: {},
          style: {
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: { top: 20, right: 20, bottom: 20, left: 20 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        {
          id: `layer_${baseId + 1}`,
          type: 'handle',
          name: 'Drag Handle',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 1,
          position: { x: 0, y: 0 },
          size: { width: 40, height: 4 },
          content: {},
          style: {
            backgroundColor: '#D1D5DB',
            borderRadius: 2,
            margin: { top: 0, right: 0, bottom: 16, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        {
          id: `layer_${baseId + 2}`,
          type: 'media',
          name: 'Image',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 2,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 200 },
          content: {
            imageUrl: 'https://www.bbassets.com/media/uploads/blinkitUX/ecofriendlycoverimage.webp',
            imageSize: { width: 720, height: 640 },
          },
          style: {
            borderRadius: 12,
            margin: { top: 0, right: 0, bottom: 16, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        {
          id: `layer_${baseId + 3}`,
          type: 'text',
          name: 'Title',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 3,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 'auto' },
          content: {
            text: 'Skip a bag & go green!',
            fontSize: 20,
            fontWeight: 'bold',
            textColor: '#111827',
            textAlign: 'left',
          },
          style: {
            margin: { top: 0, right: 0, bottom: 8, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        {
          id: `layer_${baseId + 4}`,
          type: 'button',
          name: 'Action Button',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 4,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 48 },
          content: {
            text: 'Get Started',
          },
          style: {
            backgroundColor: '#6366F1',
            color: '#FFFFFF',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textAlign: 'center',
            margin: { top: 16, right: 0, bottom: 0, left: 0 },
            padding: { top: 12, right: 24, bottom: 12, left: 24 },
          },
        },
      ];

    case 'pip':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'PIP Container',
          parent: null,
          children: [`layer_${baseId + 1}`],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: '100%' as any },
          content: {},
          style: {
            backgroundColor: '#000000',
            borderRadius: 12,
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            overflow: 'hidden',
          },
        },
        {
          id: `layer_${baseId + 1}`,
          type: 'video',
          name: 'Video',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 1,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: '100%' as any },
          content: {
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
          style: {
            borderRadius: 0,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
      ];

    case 'modal':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'Modal Container',
          parent: null,
          children: [`layer_${baseId + 1}`, `layer_${baseId + 2}`, `layer_${baseId + 3}`],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: 320, height: 'auto' },
          content: {},
          style: {
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: { top: 24, right: 24, bottom: 24, left: 24 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          },
        },
        {
          id: `layer_${baseId + 1}`,
          type: 'text',
          name: 'Title',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 1,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 'auto' },
          content: {
            text: 'Welcome Aboard!',
            fontSize: 22,
            fontWeight: 'bold',
            textColor: '#111827',
            textAlign: 'center',
          },
          style: {
            margin: { top: 0, right: 0, bottom: 8, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        {
          id: `layer_${baseId + 2}`,
          type: 'text',
          name: 'Description',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 2,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 'auto' },
          content: {
            text: 'This is a modal nudge. You can use it to make announcements or ask for confirmation.',
            fontSize: 15,
            fontWeight: 'normal',
            textColor: '#4B5563',
            textAlign: 'center',
          },
          style: {
            margin: { top: 0, right: 0, bottom: 16, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            lineHeight: 1.5,
          },
        },
        {
          id: `layer_${baseId + 3}`,
          type: 'button',
          name: 'Action Button',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 3,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 44 },
          content: {
            label: 'Get Started',
            buttonStyle: 'primary',
            action: {
              type: 'close',
              trackConversion: true,
              autoDismiss: true,
            },
          },
          style: {
            backgroundColor: '#4F46E5',
            borderRadius: 8,
            margin: { top: 8, right: 0, bottom: 0, left: 0 },
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
          },
        },
      ];

    case 'banner':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'Banner Container',
          parent: null,
          children: [`layer_${baseId + 1}`, `layer_${baseId + 2}`, `layer_${baseId + 3}`],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 'auto' },
          content: {},
          style: {
            backgroundColor: '#FFFFFF',
            borderRadius: 0,
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          },
        },
        {
          id: `layer_${baseId + 1}`,
          type: 'icon',
          name: 'Icon',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 1,
          position: { x: 0, y: 0 },
          size: { width: 40, height: 40 },
          content: {
            iconName: 'Info',
            fontSize: 24,
            textColor: '#4F46E5',
          },
          style: {
            backgroundColor: '#EEF2FF',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        {
          id: `layer_${baseId + 2}`,
          type: 'text',
          name: 'Message',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 2,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: 'auto' },
          content: {
            text: 'This is a banner notification.',
            fontSize: 14,
            fontWeight: 'medium',
            textColor: '#1F2937',
          },
          style: {
            flexGrow: 1,
          },
        },
        {
          id: `layer_${baseId + 3}`,
          type: 'button',
          name: 'Close Button',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 3,
          position: { x: 0, y: 0 },
          size: { width: 32, height: 32 },
          content: {
            label: '',
            buttonIcon: 'X',
            buttonVariant: 'ghost',
            action: { type: 'close' },
          },
          style: {
            padding: 0,
            color: '#9CA3AF',
          },
        },
      ];

    case 'pip':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'PIP Container',
          parent: null,
          children: [`layer_${baseId + 1}`, `layer_${baseId + 2}`],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: '100%' as any },
          content: {},
          style: {
            backgroundColor: '#000000',
            borderRadius: 12,
            overflow: 'hidden',
          },
        },
        {
          id: `layer_${baseId + 1}`,
          type: 'video',
          name: 'Video',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 1,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: '100%' as any },
          content: {
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
          style: {
            objectFit: 'cover',
          },
        },
        {
          id: `layer_${baseId + 2}`,
          type: 'button',
          name: 'CTA Button',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 2,
          position: { x: 0, y: 0 },
          size: { width: '90%' as any, height: 48 },
          content: {
            label: 'Learn More',
            buttonStyle: 'primary',
            action: {
              type: 'navigate',
              url: '#',
            },
          },
          style: {
            backgroundColor: '#6366F1',
            color: '#FFFFFF',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            textAlign: 'center',
            margin: { top: 0, right: 'auto', bottom: 32, left: 'auto' }, // Centered at bottom
            padding: { top: 12, right: 24, bottom: 12, left: 24 },
            position: 'absolute',
            bottom: 32,
            left: '5%',
            right: '5%',
          },
        },
      ];

    case 'floater':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'Floater Container',
          parent: null,
          children: [`layer_${baseId + 1}`],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: 60, height: 60 },
          content: {},
          style: {
            backgroundColor: '#10B981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            position: 'absolute',
            bottom: 20,
            right: 20,
          },
        },
        {
          id: `layer_${baseId + 1}`,
          type: 'icon',
          name: 'Icon',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 1,
          position: { x: 0, y: 0 },
          size: { width: 32, height: 32 },
          content: {
            iconName: 'MessageCircle',
            fontSize: 32,
            textColor: '#FFFFFF',
          },
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
      ];

    default:
      return [];
  }
}

function getDefaultContentForType(type: LayerType): LayerContent {
  switch (type) {
    case 'text':
      return {
        text: 'New text',
        fontSize: 16,
        fontWeight: 'normal',
        textColor: '#111827',
        textAlign: 'left',
      };
    case 'button':
      return {
        label: 'Button',
        buttonStyle: 'primary',
        buttonVariant: 'primary',
        themeColor: '#6366F1',
        action: { type: 'close', trackConversion: false, autoDismiss: true },
      };
    case 'media':
      return {
        imageUrl: 'https://via.placeholder.com/300x200',
        imageSize: { width: 300, height: 200 },
      };
    case 'input':
      return {
        inputType: 'text',
        placeholder: 'Enter text...',
        required: false,
        fontSize: 14,
        textColor: '#374151',
      };
    case 'countdown':
      return {
        endTime: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
        format: 'HH:MM:SS',
        timerVariant: 'card', // Default to card style for better UX
        urgencyThreshold: 3600, // 1 hour
        autoHide: false,
        fontSize: 24,
        fontWeight: 'bold',
        textColor: '#111827',
      };
    case 'gradient-overlay':
      return {
        gradientType: 'linear',
        gradientDirection: 'to-bottom',
        gradientStops: [
          { color: '#00000000', position: 0 },
          { color: '#000000CC', position: 100 }
        ],
      };
    case 'progress-circle':
      return {
        value: 75,
        max: 100,
        showPercentage: true,
        progressVariant: 'simple',
        themeColor: '#6366F1',
      };
    case 'progress-bar':
      return {
        value: 50,
        max: 100,
        showPercentage: true,
        progressBarVariant: 'simple',
        themeColor: '#22C55E',
      };
    case 'rating':
      return {
        maxStars: 5,
        rating: 4,
        reviewCount: 120,
        showReviewCount: true,
        interactive: true,
      };
    case 'badge':
      return {
        badgeText: 'New Arrival',
        badgeVariant: 'success',
        badgeIconPosition: 'left',
        pulse: false,
      };
    case 'statistic':
      return {
        value: 100,
        prefix: '',
        suffix: '%',
        animateOnLoad: true,
        fontSize: 36,
        fontWeight: 'bold',
        textColor: '#111827',
      };
    case 'checkbox':
      return {
        checkboxLabel: 'I agree to terms',
        checked: false,
        checkboxColor: '#6366F1',
        fontSize: 14,
        textColor: '#374151',
      };
    default:
      return {};
  }
}

function getDefaultStyleForType(type: LayerType): LayerStyle {
  const baseStyle: LayerStyle = {
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    opacity: 1,
  };

  switch (type) {
    case 'button':
      return {
        ...baseStyle,
        backgroundColor: '#6366F1',
        borderRadius: 8,
        padding: { top: 10, right: 20, bottom: 10, left: 20 },
      };
    case 'input':
    case 'checkbox':
      return {
        ...baseStyle,
        borderRadius: 6,
        padding: { top: 8, right: 12, bottom: 8, left: 12 },
      };
    case 'rating':
      return {
        ...baseStyle,
        starColor: '#FFB800',
        emptyStarColor: '#D1D5DB',
        starSize: 24,
        starSpacing: 4,
      };
    case 'badge':
      return {
        ...baseStyle,
        badgeBorderRadius: 16,
        badgePadding: { horizontal: 10, vertical: 4 },
      };
    case 'progress-bar':
      return {
        ...baseStyle,
        backgroundColor: '#22C55E', // Progress color
        borderRadius: 4,
        height: 8,
      };
    default:
      return baseStyle;
  }
}
