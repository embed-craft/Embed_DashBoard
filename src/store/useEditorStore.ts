import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateCampaignConfig, validateLayer } from '@/lib/configValidator';
import { metadataService, EventDefinition, PropertyDefinition, PageDefinition } from '@/services/metadataService';
import { ScratchCardConfig } from '@/lib/designTypes';
export type { ScratchCardConfig };


// Layer Types - Extended for Phase 2 & 3.5
export type LayerType =
  | 'media' | 'text' | 'button' | 'icon' | 'handle' | 'overlay' | 'arrow' | 'video' | 'controls'
  | 'progress-bar' | 'progress-circle' | 'list' | 'input' | 'statistic'
  | 'rating' | 'badge' | 'gradient-overlay' | 'checkbox' | 'copy_button' | 'custom_html' | 'container' | 'image' | 'scratch_foil' | 'carousel';


// Scratch Foil Props
interface ScratchFoilProps {
  coverColor?: string;
  coverImage?: string;
  scratchSize?: number;
  revealThreshold?: number;
  borderRadius?: number;
}

export interface LayerContent extends ScratchFoilProps {
  // Copy Button content
  copyText?: string;
  showToast?: boolean;
  toastMessage?: string;

  // Media content
  imageUrl?: string;
  imageSize?: { width: number; height: number };
  videoUrl?: string;
  iconName?: string;

  // Text
  text?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: number | string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontFamily?: string;
  fontUrl?: string; // For Google Fonts
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase';

  // Text Stroke (Border)
  textStrokeWidth?: number;
  textStrokeColor?: string;

  // Text Offset (Transform)
  textOffsetX?: number;
  textOffsetY?: number;

  // Text Shadow
  textShadowX?: number;
  textShadowY?: number;
  textShadowBlur?: number;
  textShadowColor?: string;

  // Button
  label?: string; // Restored for backwards compatibility
  buttonText?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline' | 'ghost';

  // Copy Button & Input
  copyTrigger?: 'anywhere' | 'icon';
  copyIcon?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'glass' | 'gradient' | 'shine' | '3d' | 'elevated' | 'neumorphic' | 'pill' | 'underline' | 'glow' | 'cyberpunk' | 'two-tone' | 'comic' | 'skeuomorphic' | 'liquid' | 'block';
  themeColor?: string;
  buttonIcon?: string; // Lucide icon name
  buttonIconPosition?: 'left' | 'right';
  action?: {
    type: 'close' | 'deeplink' | 'navigate' | 'custom' | 'interface' | 'link';
    url?: string;
    screenName?: string;
    eventName?: string;
    trackConversion?: boolean;
    autoDismiss?: boolean;
    interfaceId?: string; // ID of interface to trigger
  };

  // Progress content (Phase 2)
  value?: number;
  max?: number;
  showPercentage?: boolean;
  progressVariant?: 'simple' | 'semicircle' | 'thick' | 'dashed';
  progressBarVariant?: 'simple' | 'rounded' | 'striped' | 'animated' | 'gradient' | 'segmented' | 'glow';
  milestones?: { value: number; label: string; color: string }[];
  showIndicators?: boolean; // Carousel indicators



  // List content (Phase 2)
  items?: string[];
  listStyle?: 'bullet' | 'numbered' | 'checkmark' | 'icon';

  // Carousel Content (Phase 4)
  slideEffect?: 'slide' | 'fade';
  autoPlay?: boolean;
  interval?: number;

  // Carousel Arrows
  showArrows?: boolean;
  arrowColor?: string;
  arrowBackgroundColor?: string;
  arrowSize?: number; // Button size
  arrowIconSize?: number; // Icon size
  arrowBorderRadius?: number;
  arrowPosition?: 'center' | 'top' | 'bottom' | 'custom';
  arrowOffsetX?: number;
  arrowOffsetY?: number;
  prevIconUrl?: string;
  nextIconUrl?: string;

  // Carousel Dots
  showDots?: boolean;
  dotColor?: string;
  activeDotColor?: string;
  dotSize?: number;
  dotSpacing?: number;
  dotPosition?: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center';
  dotOffsetY?: number;

  // Input content (Phase 2)
  inputType?: 'text' | 'email' | 'number' | 'phone' | 'password' | 'date' | 'multiline';
  errorMessage?: string;
  placeholder?: string;
  required?: boolean;
  validation?: string;
  validationRegex?: string; // Phase 2: Custom Regex
  helperText?: string;
  showSubmitButton?: boolean;
  submitIcon?: string; // Icon name e.g. 'Send', 'ArrowRight'

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
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  badgeBorderRadius?: number;
  badgePadding?: number | { vertical: number; horizontal: number };

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

  // PIP Specific
  pipConfig?: any; // Using any for now to avoid complex type definition, can refine later

  // Custom HTML (Phase 2)
  html?: string;
  fullPageMode?: boolean; // Explicit flag for "Full Page" exclusive mode

  // Scratch Foil content
  scratchSize?: number;
  revealThreshold?: number;
  coverColor?: string;
  coverImage?: string;
  cursorImage?: string;

  // Heirarchy
  children?: Layer[];
}

export interface LayerStyle {
  backgroundColor?: string;
  border?: string; // Added to support shorthand
  borderColor?: string;
  borderWidth?: number | { top: number; right: number; bottom: number; left: number };
  arrowSize?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  padding?: { top: number | string; right: number | string; bottom: number | string; left: number | string } | number | string;
  margin?: { top: number | string; right: number | string; bottom: number | string; left: number | string } | number | string;

  // Input styling
  labelColor?: string;
  helperColor?: string;
  focusBorderColor?: string;
  errorColor?: string;
  placeholderColor?: string;
  labelFontSize?: number;
  labelFontWeight?: number | string;
  paddingVertical?: number | string;
  paddingHorizontal?: number | string;

  // Common style properties
  width?: number | string;
  height?: number | string;

  opacity?: number;
  borderRadius?: number | string | { topLeft: number | string; topRight: number | string; bottomRight: number | string; bottomLeft: number | string };
  boxShadow?: string;
  zIndex?: number;

  display?: 'flex' | 'block' | 'inline-block' | 'none' | 'grid';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: number;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flexGrow?: number;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;

  cursor?: 'default' | 'pointer' | 'not-allowed' | 'grab' | 'text' | 'move' | 'help' | 'wait';
  pointerEvents?: 'auto' | 'none';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string; // Renamed from 'color' to avoid conflict with CSS 'color'
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;

  lineHeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';

  // New properties for Phase 3.5 & Custom shapes
  // Expanded Spacing (SDK Parity)
  marginTop?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  marginRight?: number | string;
  paddingTop?: number | string;
  paddingBottom?: number | string;

  // Element Offsets (SDK Parity)
  textOffsetX?: number;
  textOffsetY?: number;
  iconOffsetX?: number;
  iconOffsetY?: number;
  paddingLeft?: number | string;
  paddingRight?: number | string;

  // Dimensions
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;

  // Typography
  fontUrl?: string; // For custom fonts
  textDecoration?: 'none' | 'underline' | 'line-through';
  textDecorationColor?: string;
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy'; // Added to fix lint
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';

  // Text Shadow
  textShadow?: string; // Added to fix lint (shorthand support)
  textShadowX?: number;
  textShadowY?: number;
  textShadowBlur?: number;
  textShadowColor?: string;

  // Advanced Background (Phase 2)
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  backgroundPosition?: string;
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';

  // Advanced Visuals (Phase 3.5 - Media Upgrade)
  aspectRatio?: number | string; // Helper for ratio-based resizing
  backgroundAttachment?: 'scroll' | 'fixed' | 'local';
  backgroundBlendMode?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    colors: Array<{ color: string; position: number }>;
  };

  // Shapes & Geometry (Phase 1)
  clipPath?: string; // polygon, circle, ellipse, path
  clipPathShape?: 'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'pill' | 'custom'; // Added
  maskImage?: string;

  // Badge Specific (Phase 3.5)
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  badgeBorderRadius?: number;
  badgePadding?: number | { horizontal: number; vertical: number };

  // Shadow Props
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowOffsetY?: number;

  // Rating Specific (Phase 3.5)
  starColor?: string;
  emptyStarColor?: string;
  starSize?: number;
  starSpacing?: number;

  // Layout Override
  layout?: 'column' | 'row' | 'freeform' | 'stack';

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
  backdropFilter?: string | { enabled: boolean; blur: number; opacity?: number; }; // blur for glassmorphism
  mixBlendMode?: string;
  indicatorColor?: string; // Carousel indicators

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
  combineWith?: string; // ✅ FIX: Add combineWith property
  children?: TargetingRule[]; // For groups

  // User Property Logic
  property?: string;
  operator?: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal' | 'set' | 'not_set';
  value?: string | number | boolean;

  // Event Logic
  event?: string;
  eventProperty?: string; // Deprecated in favor of properties array
  properties?: {
    id: string;
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal' | 'set' | 'not_set';
    value: string | number | boolean;
  }[];
  count?: number;
  countOperator?: 'equals' | 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal' | 'not_equals'; // ✅ New field for event count operator
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
  showCloseButton?: boolean; // ✅ NEW: Toggle close button
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
  overflow?: 'hide' | 'scroll';
  timing?: {
    delay?: number;
    duration?: number;
  };
}

export interface ModalConfig {
  mode?: 'container' | 'image-only' | 'default';
  width?: number | string;
  height?: 'auto' | number | string;
  showCloseButton?: boolean;
  opacity?: number;
  backgroundColor: string;
  backgroundImageUrl?: string;
  backgroundSize?: 'cover' | 'contain' | 'fill';
  backgroundPosition?: string;
  borderRadius?: number | { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number };
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  elevation: 0 | 1 | 2 | 3 | 4 | 5;
  overlay: {
    enabled: boolean;
    opacity: number;
    blur: number;
    color: string;
    dismissOnClick: boolean;
  };

  closeButton?: {
    enabled: boolean;
    position: 'top-right' | 'top-left' | 'outside-right';
    color: string;
    backgroundColor: string;
  };
  boxShadow?: {
    enabled: boolean;
    blur: number;
    spread?: number; // Added Spread
    color: string;
  };
  // Position props (optional)
  position?: 'center' | 'bottom' | 'custom';
  x?: number;
  y?: number;

  animation: {
    type: 'pop' | 'fade' | 'slide' | 'scale';
    duration: number;
    easing: string;
  };
}

// Banner Configuration (Copied from Modal, adapted for top/bottom positioning)
export interface BannerConfig {
  position?: 'top' | 'bottom';
  width?: number | string;
  height?: 'auto' | number | string;
  showCloseButton?: boolean;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  backgroundSize?: 'cover' | 'contain' | 'fill';
  backgroundPosition?: string;
  borderRadius?: number | { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number };
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  margin?: { top?: number; bottom?: number; left?: number; right?: number };
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
  overlay?: {
    enabled: boolean;
    opacity?: number;
    blur?: number;
    color?: string;
    dismissOnClick?: boolean;
    dismissOnSwipe?: boolean;
  };
  shadow?: {
    enabled: boolean;
    blur: number;
    opacity: number;
    color?: string;
    spread?: number;
    x?: number;
    y?: number;
  };
  animation?: {
    enabled?: boolean;
    type: 'slide' | 'fade';
    duration: number;
    easing?: string;
  };
}

// Floater Configuration (Video/Image floating overlay)
export interface FloaterConfig {
  mode?: 'video' | 'image';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center-right' | 'center-left';
  offsetX?: number;
  offsetY?: number;
  width?: number;
  height?: number;
  sizeUnit?: 'px' | '%';
  shape?: 'rectangle' | 'circle';
  borderRadius?: number;
  backgroundColor?: string;
  backgroundSize?: 'cover' | 'contain';
  boxShadow?: string;
  opacity?: number;
  videoUrl?: string;
  imageUrl?: string;
  draggable?: boolean;
  showCloseButton?: boolean;
  showExpandButton?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  backdropFilter?: {
    enabled: boolean;
    blur: number;
  };
  gradient?: {
    enabled: boolean;
    startColor: string;
    endColor: string;
    angle: number;
  };
  animation?: {
    type: 'scale' | 'slide' | 'fade' | 'bounce';
    duration: number;
  };
  timing?: {
    delay?: number;
    duration?: number;
  };
}

// Full Screen Configuration (New Type)
export interface FullScreenConfig {
  showSystemColor: boolean; // Match status bar color
  overlay: {
    enabled: boolean;
    color: string;
    opacity: number;
    dismissOnClick: boolean;
  };
  timing: {
    delay: number; // Seconds
    duration: number; // Seconds (0 = infinite)
  };
  parameters?: Record<string, string>; // Custom params
  cannotClash: boolean; // Collision protection
  backgroundColor: string; // Base background
  backgroundImageUrl?: string;
  backgroundSize?: 'cover' | 'contain' | 'fill';
  media?: {
    url: string;
    type: 'image' | 'video' | 'youtube' | 'none';
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    fit?: 'cover' | 'contain' | 'fill';
  };
  controls?: {
    closeButton?: {
      show?: boolean;
      position?: 'top-right' | 'top-left' | 'bottom-right';
      size?: number;
      iconUrl?: string;
    };
    progressBar?: {
      show?: boolean;
      color?: string;
    };
  };
  behavior?: {
    tapToDismiss?: boolean;
    doubleTapToDismiss?: boolean;
  };
}

export interface CampaignSchedule {
  startDate?: string;
  endDate?: string;
  timeZone?: string;
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

export interface TooltipConfig {
  mode?: 'standard' | 'image' | 'container' | 'advanced' | 'html';
  imageUrl?: string;
  imageSize?: { width: number | string; height: number | string };
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string; // Added to fix lint

  // Targeting
  targetPageId?: string;
  targetElementId?: string;
  arrowSize?: number;
  showArrow?: boolean;
  arrowPositionPercent?: number; // NEW: 0-100, position along edge (0=start, 50=center, 100=end)
  arrowRoundness?: number; // NEW: 0-100, roundness of arrow tip (0=sharp, 100=rounded)
  mobileBehavior?: 'default' | 'bottomSheet'; // Force bottom sheet on mobile
  timelineMode?: boolean; // If true, clicking on tooltip body triggers action

  // Appearance
  roundness?: number;
  padding?: number;
  backgroundColor?: string;
  backgroundOpacity?: number; // 0-1
  backgroundImageUrl?: string; // NEW: Background image URL
  backgroundSize?: 'cover' | 'contain' | 'fill'; // NEW: How to fit background image
  backgroundPosition?: string; // NEW: Background position (e.g., 'center', 'top left')
  backdropFilter?: {
    enabled: boolean;
    blur: number;
    opacity?: number;
  };

  // Dimension controls (like Modal)
  widthMode?: 'auto' | 'custom' | 'fitContent'; // NEW: Width mode
  heightMode?: 'auto' | 'custom' | 'fitContent'; // NEW: Height mode
  widthUnit?: 'px' | '%'; // NEW: Width unit
  heightUnit?: 'px' | '%'; // NEW: Height unit

  arrowPosition?: 'left' | 'right' | 'center' | 'auto';
  arrowColor?: string; // NEW: Explicit arrow color
  arrowStyle?: 'sharp' | 'bubble'; // Added
  orientation?: 'vertical' | 'horizontal';
  shadow?: string;
  boxShadow?: string; // Added to resolve lint error (alias for shadow)
  shadowEnabled?: boolean; // NEW: Toggle shadow on/off
  shadowBlur?: number; // NEW: Shadow blur radius (0-50)
  shadowOpacity?: number; // NEW: Shadow opacity (0-1)
  shadowOffsetX?: number; // NEW: Shadow X offset
  shadowOffsetY?: number; // NEW: Shadow Y offset
  shadowSpread?: number; // NEW: Shadow spread radius
  shadowColor?: string; // NEW: Shadow color
  animation?: { type: string; duration: number }; // Added to resolve lint error
  overlayOpacity?: number; // Added
  gradient?: string; // Added generic gradient support if needed
  gradientTo?: string; // Added based on grep hint
  gradientFrom?: string; // Added just in case
  gradientWith?: string; // Added based on error message (even if typo, we support it to fix build)

  // Content
  htmlContent?: string; // Added

  // Target Highlight (Element Style)
  targetRoundness?: number;
  targetHighlightPadding?: number;
  targetHighlightColor?: string;
  targetBorderEnabled?: boolean; // NEW: Explicit toggle
  targetBorderRadius?: number;
  targetBorderWidth?: number;
  targetBorderColor?: string;
  targetBorderStyle?: 'solid' | 'dashed' | 'dotted'; // NEW
  targetStyleEnabled?: boolean; // NEW
  targetFillColor?: string; // NEW
  targetShadowEnabled?: boolean;
  targetShadowColor?: string;
  targetShadowBlur?: number;
  targetShadowSpread?: number;
  targetShadowOpacity?: number;
  targetOffsetX?: number; // NEW: Fine-tune X position
  targetOffsetY?: number; // NEW: Fine-tune Y position
  targetWidthAdjustment?: number; // NEW: Manual width adjust
  targetHeightAdjustment?: number; // NEW: Manual height adjust

  // Appearance - new additions
  overlayColor?: string;
  borderRadius?: number;
  gradientAngle?: number;

  // Overlay/Spotlight
  overlayEnabled?: boolean;

  // Arrow
  arrowEnabled?: boolean;

  // Behaviors
  closeOnOutsideClick?: boolean;
  keepTargetClickable?: boolean;
  closeOnTargetClick?: boolean;
  autoScrollToTarget?: boolean;

  // Coachmark
  coachmarkEnabled?: boolean;
  coachmarkShape?: 'rectangle' | 'wave';  // Default: rectangle
  // Wave settings (when shape='wave')
  waveOrigin?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  waveCoverage?: number;   // 0-100 percent
  waveCurvature?: number;  // curve intensity
  waveFitToHeight?: boolean; // NEW: If true, scales wave depth with screen height (responsive). Default: false

  // Spotlight
  spotlightWidth?: number;     // Default: auto (px) - override target width
  spotlightHeight?: number;    // Default: auto (px) - override target height
  spotlightPadding?: number;   // Default: 12 (px)
  spotlightRadius?: number;    // Default: 8 (px) - high value = circle
  spotlightBlur?: number;      // Default: 0 (0-15px)
  spotlightEffect?: 'pulse' | 'ripple' | boolean;   // Default: false
  spotlightEffectColor?: string; // Color for the effect
  // Ring
  ringEnabled?: boolean;       // Default: false
  ringColor?: string;          // Default: #ffffff
  ringCount?: number;          // Default: 2 (1-3 rings) - for rectangle mode
  ringWidth?: number;          // Default: 2 (px) - stroke thickness
  ringGap?: number;            // Default: 6 (px) - for rectangle mode
  // Ring Shape Options (New)
  ringShape?: 'circle' | 'rectangle';  // Default: 'rectangle'
  ringRadius?: number;         // Circle mode: radius from spotlight center (px)
  ringArcPercent?: number;     // Circle mode: 0-100 (100=full circle, 50=half, 25=quarter)
  ringArcStartAngle?: number;  // Circle mode: start angle in degrees (0=top, 90=right)
  dismissEnabled?: boolean;    // Default: true
  showTooltipBody?: boolean;   // Default: true - toggle visibility of tooltip bubble

  // Legacy/Existing
  position?: 'top' | 'bottom' | 'left' | 'right';
  offsetX?: number;
  offsetY?: number;

  // Added for lint fixing
  textColor?: string;
  rotate?: number;
  scale?: number;

  timing?: {
    delay?: number;
    duration?: number;
  };
}

// Spotlight Config - Reuses TooltipConfig structure with overlay always enabled
export type SpotlightConfig = TooltipConfig;

// Coachmark Config (V3: Full Screen Overlay + Cutout)
export interface CoachmarkConfig {
  // 📍 TARGETING (Strict Dependency)
  targetPageId?: string;               // Required: Page Context
  targetElementId?: string;            // Required: Element on Page

  // 🔵 CUTOUT (The Hole)
  cutoutShape: 'circle' | 'rect' | 'rounded-rect';
  cutoutSizeMode: 'auto' | 'custom';   // Auto = uses target element bounds + padding
  cutoutPadding: number;               // 10px default
  cutoutRadius?: number;               // For custom circle
  cutoutWidth?: number;                // For custom rect
  cutoutHeight?: number;               // For custom rect
  cutoutCornerRadius?: number;         // For rounded rect
  cutoutPulseAnimation?: boolean;      // Pulse effect
  cutoutBorderEnabled?: boolean;
  cutoutBorderColor?: string;
  cutoutBorderWidth?: number;

  // 🎭 OVERLAY (Full Screen Dim)
  overlayColor: string;                // #000000 (Black)
  overlayOpacity: number;              // 50-80%
  overlayClickBehavior: 'dismiss' | 'none'; // Click on background behavior

  // 📦 CONTENT (Floating Box)
  contentX: number;                    // 50%
  contentY: number;                    // 50%
  contentAnchor?: 'cutout-top' | 'cutout-bottom' | 'cutout-left' | 'cutout-right' | 'free';
  contentOffset?: number;              // Distance from cutout
  orientation: 'vertical' | 'horizontal';

  // 🎨 CONTENT STYLE
  backgroundColor: string;
  backgroundOpacity: number;
  width?: number;                      // Content width (e.g., 280px)
  roundness: number;                   // 12px
  padding: number;                     // 16px
  shadowEnabled?: boolean;

  // 🎛️ BEHAVIOR
  nextButtonText?: string;             // "Next" or "Got it"
  showSkipButton?: boolean;
  closeOnTargetClick: boolean;         // Advances to next step
}

// Campaign Interface (Sub-campaign within main campaign)
export interface CampaignInterface {
  id: string;
  name: string;
  nudgeType: 'modal' | 'bottomsheet' | 'tooltip' | 'pip' | 'scratchcard' | 'banner' | 'floater' | 'spotlight' | 'coachmark';
  layers: Layer[];
  // Config based on nudgeType
  bottomSheetConfig?: BottomSheetConfig;
  modalConfig?: ModalConfig;
  tooltipConfig?: TooltipConfig;
  bannerConfig?: BannerConfig;
  pipConfig?: any;
  scratchCardConfig?: ScratchCardConfig;
  floaterConfig?: any;
  spotlightConfig?: SpotlightConfig;
  fullscreenConfig?: FullScreenConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignEditor {
  id: string;
  _id?: string; // Support for backend ID
  name: string;
  experienceType: 'nudges' | 'messages' | 'stories' | 'challenges' | 'streaks' | 'survey';
  nudgeType: 'modal' | 'banner' | 'bottomsheet' | 'tooltip' | 'pip' | 'scratchcard' | 'carousel' | 'inline' | 'floater' | 'spotlight' | 'coachmark' | 'fullscreen';

  // Trigger configuration (industry-standard events)
  trigger?: string; // e.g., 'screen_viewed', 'button_clicked', 'product_viewed'
  screen?: string; // e.g., 'home', 'product_detail', 'checkout'
  status?: 'active' | 'paused' | 'draft';
  tags?: string[]; // ✅ FIX: Add tags property
  schedule?: CampaignSchedule; // ✅ FIX: Add schedule property
  priority?: number; // ✅ FIX: Add priority property

  layers: Layer[];
  interfaces: CampaignInterface[]; // Sub-campaigns/interfaces
  targeting: TargetingRule[];
  displayRules: DisplayRules;
  goal?: CampaignGoal;

  // Bottom sheet specific config (Phase 3)
  bottomSheetConfig?: BottomSheetConfig;
  modalConfig?: ModalConfig;
  scratchCardConfig?: ScratchCardConfig;
  bannerConfig?: any;
  tooltipConfig?: TooltipConfig;
  pipConfig?: any;
  floaterConfig?: any;
  spotlightConfig?: SpotlightConfig;
  fullscreenConfig?: FullScreenConfig;

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


  // Template Source (if created from template)
  sourceTemplateId?: string;
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

  // Saved Callbacks (Local Persistence)
  customCallbackIds: string[];
  addCustomCallbackId: (id: string) => void;

  duplicateLayer: (id: string) => string;
  reorderLayer: (id: string, newIndex: number) => void;
  moveLayerToParent: (layerId: string, newParentId: string | null) => void;
  selectLayer: (id: string | null) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  deleteLayer: (id: string) => void;
  addLayer: (type: LayerType, parentId: string | null) => void;

  // Actions - Content
  updateLayerContent: (id: string, content: Partial<LayerContent>) => void;
  updateLayerStyle: (id: string, style: Partial<LayerStyle>) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  updateTrigger: (trigger: string) => void; // ✅ FIX: Add updateTrigger to interface
  updateScreen: (screen: string) => void;
  updateCampaignName: (name: string) => void;
  updateTags: (tags: string[]) => void;
  updateSchedule: (schedule: CampaignSchedule) => void;
  updateStatus: (status: 'active' | 'paused' | 'draft') => void;
  updateGoal: (goal: Partial<CampaignGoal>) => void;
  loadCampaign: (campaign: CampaignEditor | string) => Promise<void>;
  createCampaign: (experienceType: CampaignEditor['experienceType'], nudgeType: CampaignEditor['nudgeType']) => void;
  // Actions - Targeting
  addTargetingRule: (rule: Omit<TargetingRule, 'id'>) => void;
  updateTargetingRule: (id: string, rule: Partial<TargetingRule>) => void;
  deleteTargetingRule: (id: string) => void;
  updateDisplayRules: (rules: Partial<DisplayRules>) => void;


  updateCampaign: (updates: Partial<CampaignEditor>) => void; // ✅ FIX: Add generic updateCampaign
  updateCurrentCampaign: (updates: Partial<CampaignEditor>) => void; // ✅ FIX: Alias for TargetingStep compatibility
  validateAndFixCampaign: () => void;
  resetCurrentCampaign: () => void;

  // Actions - Bottom Sheet Config (Phase 3)
  updateBottomSheetConfig: (config: Partial<BottomSheetConfig>) => void;
  updateModalConfig: (config: Partial<ModalConfig>) => void;
  updateScratchCardConfig: (config: Partial<ScratchCardConfig>) => void;
  updateBannerConfig: (config: any) => void;
  updateTooltipConfig: (config: any) => void;
  updatePipConfig: (config: any) => void;
  updateFloaterConfig: (config: any) => void;
  updateFullScreenConfig: (config: Partial<FullScreenConfig>) => void;
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
  availablePages: PageDefinition[]; // Add availablePages
  isLoadingMetadata: boolean;
  fetchMetadata: () => Promise<void>;
  fetchPageDetails: (pageId: string) => Promise<PageDefinition>;

  createEvent: (event: Partial<EventDefinition>) => Promise<EventDefinition>;
  createProperty: (property: Partial<PropertyDefinition>) => Promise<PropertyDefinition>;
  saveCampaign: () => Promise<void>;

  applyTemplate: (template: any) => void;

  // UI Modals
  isTemplateModalOpen: boolean;
  setTemplateModalOpen: (open: boolean) => void;
  isSaveTemplateModalOpen: boolean;
  setSaveTemplateModalOpen: (open: boolean) => void;

  // Template Editor Mode
  editorMode: 'campaign' | 'template';
  setEditorMode: (mode: 'campaign' | 'template') => void;
  saveTemplate: () => Promise<void>;

  // Interface Management
  activeInterfaceId: string | null;
  setActiveInterface: (id: string | null) => void;
  addInterface: (nudgeType: CampaignInterface['nudgeType'], name?: string) => string;
  updateInterface: (id: string, updates: Partial<CampaignInterface>) => void;
  deleteInterface: (id: string) => void;
  updateInterfaceLayer: (interfaceId: string, layerId: string, updates: Partial<Layer>) => void;
  addInterfaceLayer: (interfaceId: string, type: LayerType) => void;
  deleteInterfaceLayer: (interfaceId: string, layerId: string) => void;
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
      editorMode: 'campaign',
      isTemplateModalOpen: false,
      isSaveTemplateModalOpen: false,
      activeInterfaceId: null,

      // Saved Callbacks Initial State
      customCallbackIds: [],
      addCustomCallbackId: (id) => set((state) => {
        if (!id || state.customCallbackIds.includes(id)) return state;
        return { customCallbackIds: [...state.customCallbackIds, id] };
      }),

      setEditorMode: (mode) => set({ editorMode: mode }),



      // Metadata Initial State
      // Metadata Initial State
      availableEvents: [],
      availableProperties: [],
      availablePages: [], // Initialize availablePages
      isLoadingMetadata: false,

      // Metadata Actions
      fetchMetadata: async () => {
        set({ isLoadingMetadata: true });
        try {
          const [events, properties, pages] = await Promise.all([
            metadataService.getEvents(),
            metadataService.getProperties(),
            metadataService.getPages() // Fetch pages
          ]);
          set({
            availableEvents: events,
            // FIX: Inject default properties if missing
            availableProperties: [
              ...properties,
              { _id: 'email', name: 'email', type: 'string', isPrivate: true, isPII: true, organization_id: '', createdAt: '', updatedAt: '' },
              { _id: 'userId', name: 'userId', type: 'string', isPrivate: true, isPII: true, organization_id: '', createdAt: '', updatedAt: '' }
            ],
            availablePages: pages, // Store pages
          });
        } catch (error) {
          console.error('Failed to fetch metadata', error);
        } finally {
          set({ isLoadingMetadata: false });
        }
      },

      fetchPageDetails: async (pageId: string) => {
        try {
          // FIX: Use apiClient for full page details including elements
          const api = await import('@/lib/api');
          const pageDetails = await api.apiClient.getPage(pageId);

          set((state) => ({
            availablePages: state.availablePages.map(p =>
              p._id === pageId ? { ...p, ...pageDetails } : p
            )
          }));
          return pageDetails;
        } catch (error) {
          console.error('Failed to fetch page details via API', error);
          // Fallback to metadata service? verify if needed
          try {
            const pageDetails = await metadataService.getPage(pageId);
            set((state) => ({
              availablePages: state.availablePages.map(p =>
                p._id === pageId ? { ...p, ...pageDetails } : p
              )
            }));
            return pageDetails;
          } catch (e) {
            console.error('Failed to fetch page details fallback', e);
            throw e;
          }
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
      createCampaign: (experienceType: CampaignEditor['experienceType'], nudgeType: CampaignEditor['nudgeType']) => {
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
          interfaces: [],
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
            mode: 'image-only', // Default to image-only now that container is gone
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
          // Initialize PIP config for PIP nudge type
          pipConfig: nudgeType === 'pip' ? {
            position: 'bottom-right',
            width: 320,
            height: 180,
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            aspectRatio: '16/9',
            controls: {
              showClose: true,
              showExpand: true,
              showMute: true,
              showPlayPause: true,
              showProgress: true,
            },
            behavior: {
              autoPlay: true,
              muted: true,
              loop: false,
              dragEnabled: true,
              snapToCorner: true,
            },
            style: {
              borderColor: 'transparent',
              borderWidth: 0,
              backgroundColor: '#000000',
            }
          } : undefined,
          // Initialize modal config for modal nudge type
          modalConfig: nudgeType === 'modal' ? {
            mode: 'container',
            width: '90%' as any,
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
            animation: {
              type: 'pop',
              duration: 300,
              easing: 'ease-out',
            },
          } : undefined,
          // Initialize scratch card config
          scratchCardConfig: nudgeType === 'scratchcard' ? {
            width: 320,
            height: 480,
            borderRadius: 16,
            coverType: 'color',
            coverColor: '#CCCCCC',
            scratchType: 'brush',
            scratchSize: 40,
            revealThreshold: 50,
            autoReveal: true,
            completionAnimation: {
              enabled: false,
              type: 'confetti',
            },
            overlay: {
              enabled: true,
              opacity: 0.5,
              color: '#000000',
              dismissOnClick: true
            }
          } : undefined,
          // Initialize banner config for banner nudge type
          bannerConfig: nudgeType === 'banner' ? {
            position: 'top',
            width: '100%',
            height: 'auto',
            backgroundColor: '#FFFFFF',
            backgroundImageUrl: '',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            borderRadius: 0,
            elevation: 1,
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
            padding: { top: 16, bottom: 16, left: 16, right: 16 },
            showCloseButton: false,
            overlay: {
              enabled: false, // Banners typically don't have overlay
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
          // Initialize floater config for floater nudge type
          floaterConfig: nudgeType === 'floater' ? {
            // Position
            position: 'bottom-right',
            offsetX: 20,
            offsetY: 20,

            // Size & Shape
            mode: 'image-only',
            shape: 'rectangle',
            width: 280,
            height: 180,
            borderRadius: 12,

            // Background
            backgroundColor: '#000000',
            backgroundImageUrl: '',
            backgroundSize: 'cover',

            // Shadow - Must be initialized for toggle to work
            shadow: {
              enabled: true,
              blur: 24,
              spread: 4,
            },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
            opacity: 1,

            // Media - Must be initialized for editor to work
            media: {
              url: '',
              type: 'image',
              autoPlay: true,
              muted: true,
              loop: true,
              fit: 'cover',
            },

            // Controls - Must be initialized for toggles to work
            controls: {
              closeButton: {
                show: true,
                position: 'top-right',
                size: 14,
              },
              expandButton: {
                show: false,
                position: 'top-left',
                size: 14,
              },
              muteButton: {
                show: false,
                position: 'top-left',
                size: 14,
              },
              progressBar: {
                show: false,
              },
            },

            // Animation
            animation: {
              type: 'scale',
              duration: 300,
              easing: 'ease-out',
            },

            // Behavior - Must be initialized for toggles to work
            draggable: true,
            snapToCorner: true,
            doubleTapToDismiss: false,
            dismissOnTapOutside: false,

            // Backdrop
            backdrop: {
              show: false,
              color: '#000000',
              opacity: 0.3,
              blur: 0,
              dismissOnTap: false,
            },

            // Glassmorphism (future use)
            glassmorphism: {
              enabled: false,
              blur: 10,
              opacity: 0.7,
            },

            // Gradient (future use)
            gradient: {
              enabled: false,
              startColor: '#000000',
              endColor: '#333333',
              angle: 135,
            },
          } : undefined,
          // Initialize tooltip config for tooltip nudge type
          tooltipConfig: nudgeType === 'tooltip' ? {
            position: 'top',
            arrowSize: 10,
            showArrow: true,
            backgroundColor: '#111827',
            textColor: '#FFFFFF',
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            animation: { type: 'fade', duration: 200 },
            maxWidth: 300,
            // Initialize transform properties (Fix for rotation/scale issues)
            rotate: 0,
            scale: 1,
            offsetX: 0,
            offsetY: 0
          } : undefined,
          selectedLayerId: defaultLayers[0]?.id || null,
          history: [defaultLayers],
          historyIndex: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDirty: false,
        };

        set({ currentCampaign: newCampaign, showEditor: true, activeInterfaceId: null });
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

          // FIX: Migration for legacy campaigns - Convert root layer type 'text' -> 'container' AND Fix missing root layers
          if (['bottomsheet', 'modal', 'scratchcard', 'banner', 'tooltip', 'pip', 'floater', 'fullscreen'].includes(campaignData.nudgeType)) {
            let rootLayerName = 'Modal Container'; // default
            if (campaignData.nudgeType === 'bottomsheet') rootLayerName = 'Bottom Sheet';
            if (campaignData.nudgeType === 'scratchcard') rootLayerName = 'Scratch Card Container';
            if (campaignData.nudgeType === 'banner') rootLayerName = 'Banner Container';
            if (campaignData.nudgeType === 'tooltip') rootLayerName = 'Tooltip Container';
            if (campaignData.nudgeType === 'pip') rootLayerName = 'PIP Container';
            if (campaignData.nudgeType === 'floater') rootLayerName = 'Floater Container';
            if (campaignData.nudgeType === 'fullscreen') rootLayerName = 'Fullscreen Layout';

            let rootLayer = campaignData.layers.find(l => l.name === rootLayerName);

            // Scenario 1: Root layer exists but is wrong type (only relevant for modal/bottomsheet legacy)
            if (rootLayer && rootLayer.type === 'text') {
              console.log(`loadCampaign: Migrating legacy ${campaignData.nudgeType} root layer from 'text' to 'container'`);
              rootLayer.type = 'container';
            } else {
              // Fallback: Check if we have a name mismatch (e.g. 'Modal Container' inside a 'bottomsheet' campaign)
              if (!rootLayer) {
                const firstLayer = campaignData.layers[0];
                // Check for Bottomsheet mismatch
                if (campaignData.nudgeType === 'bottomsheet' && firstLayer?.name === 'Modal Container') {
                  console.log('loadCampaign: Renaming "Modal Container" to "Bottom Sheet"');
                  firstLayer.name = 'Bottom Sheet';
                  firstLayer.type = 'container'; // Ensure type is correct
                }
                // Check for Modal mismatch
                else if (campaignData.nudgeType === 'modal' && firstLayer?.name === 'Bottom Sheet') {
                  console.log('loadCampaign: Renaming "Bottom Sheet" to "Modal Container"');
                  firstLayer.name = 'Modal Container';
                  firstLayer.type = 'container';
                }
                // Generic fallback for other types if 0th layer exists
                else if (firstLayer && !firstLayer.parent && firstLayer.type === 'text') {
                  console.log(`loadCampaign: Force-fixing 0th layer ${firstLayer.name} to container as fallback`);
                  firstLayer.type = 'container';
                }
              }
            }

            // Scenario 2: Root layer is MISSING (common in old bottomsheet campaigns)
            if (!rootLayer) {
              console.log(`loadCampaign: Root layer '${rootLayerName}' is MISSING. Recreating it...`);

              // Find orphaned children to retrieve the original parent ID
              const potentialChildren = campaignData.layers.filter(l => l.parent && !campaignData.layers.find(p => p.id === l.parent));
              const originalParentId = potentialChildren.length > 0 ? potentialChildren[0].parent : null;

              if (originalParentId) {
                console.log(`loadCampaign: Found orphaned children pointing to parent ${originalParentId}. Restoring root.`);
                const defaultLayers = getDefaultLayersForNudgeType(campaignData.nudgeType);
                const defaultRoot = defaultLayers[0]; // Assuming 0 is always root

                const restoredRoot = {
                  ...defaultRoot,
                  id: originalParentId, // Restore original ID
                  children: potentialChildren.map(c => c.id), // Link to actual children
                  type: 'container' as const // Ensure type is correct
                };

                campaignData.layers.unshift(restoredRoot); // Add to start
              }
            }
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
            showEditor: true,
            activeInterfaceId: null
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

      setTemplateModalOpen: (open) => set({ isTemplateModalOpen: open }),
      setSaveTemplateModalOpen: (open) => set({ isSaveTemplateModalOpen: open }),

      // Apply Template Logic (Moved from DesignStep)
      applyTemplate: (template) => {
        const { currentCampaign, loadCampaign } = get();
        if (!currentCampaign) return;

        console.log('Applying template:', template.name);

        // Strip IDs and metadata
        const { id, _id, createdAt, updatedAt, userId, ...templateData } = template;

        // Determine nudge type
        const nudgeType = template.type || template.typeId || template.config?.nudgeType || currentCampaign.nudgeType;

        // Map backend template structure
        const mappedData: any = {
          ...templateData,
          nudgeType,
          layers: (template.layers && template.layers.length > 0)
            ? template.layers
            : getDefaultLayersForNudgeType(nudgeType),
        };

        // Map config dynamically
        if (template.config) {
          const type = template.type || currentCampaign.nudgeType;
          let configKey = `${type}Config`;
          if (type === 'bottomsheet') configKey = 'bottomSheetConfig'; // Special case for casing
          mappedData[configKey] = template.config;
        }

        // Merge into new campaign
        const newCampaign = {
          ...currentCampaign,
          ...mappedData,
          id: currentCampaign.id || `campaign_${Date.now()}`,
          _id: currentCampaign._id,
          isDirty: true,
        };

        // Load it
        get().loadCampaign(newCampaign);
      },

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

      updateTags: (tags) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            tags,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      updateSchedule: (schedule) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            schedule,
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
      // NOTE: Does NOT set isDirty to prevent double-save race condition.
      // Status updates are always followed by immediate saveCampaign() calls.
      updateStatus: (status) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            status,
            updatedAt: new Date().toISOString(),
            // isDirty intentionally NOT set to prevent auto-save race
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
            goal: { ...currentCampaign.goal, ...goal },
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      updateCampaign: (updates) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            ...updates,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },

      updateCurrentCampaign: (updates) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        set({
          currentCampaign: {
            ...currentCampaign,
            ...updates,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          },
        });
      },



      // Save campaign
      saveCampaign: async () => {
        const { currentCampaign, editorMode, saveTemplate } = get();

        // Redirect to template saving logic if in template mode
        if (editorMode === 'template') {
          return saveTemplate();
        }

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

          // FIX: Sanitizing payload to remove history and local state
          // history can be massive (Layer[][]) and causes payload too large / connection reset errors
          const {
            history,
            historyIndex,
            selectedLayerId,
            isDirty,
            lastSaved,
            ...payload
          } = currentCampaign;

          const savedCampaign = await api.saveCampaign(payload as any);
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
                text: savedCampaign.config?.text || '',
                backgroundColor: savedCampaign.config?.backgroundColor || '#FFFFFF',
                textColor: savedCampaign.config?.textColor || '#000000',
                buttonText: savedCampaign.config?.buttonText,
                position: savedCampaign.config?.position,
                ...(savedCampaign.config || {}),
              },
              rules: (savedCampaign.rules || []).map(r => ({
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

      // Save Template
      saveTemplate: async () => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        if (saveMutex) {
          console.warn('saveTemplate: Save already in progress');
          return;
        }

        saveMutex = true;
        set({ isSaving: true, saveError: null });

        try {
          const api = await import('@/lib/api');

          // Determine config based on type
          // Determine config based on type (Dynamic)
          const configKey = `${currentCampaign.nudgeType}Config` as keyof CampaignEditor;
          const config = (currentCampaign[configKey] as any) || {};

          // FIX: Handle temporary IDs for new templates
          const isTempId = currentCampaign.id && currentCampaign.id.startsWith('campaign_');

          const templatePayload = {
            ...currentCampaign, // Spread other props
            id: isTempId ? undefined : currentCampaign.id,
            _id: isTempId ? undefined : currentCampaign.id,
            name: currentCampaign.name,
            type: currentCampaign.nudgeType,
            layers: currentCampaign.layers,
            config: { ...config, type: currentCampaign.nudgeType }, // ✅ FIX: Ensure type is persisted in config for backend
            updatedAt: new Date().toISOString()
          };

          const savedTemplate = await api.saveTemplate(templatePayload);
          console.log('saveTemplate: Success', savedTemplate);

          const newId = savedTemplate._id || savedTemplate.id;

          set({
            currentCampaign: {
              ...currentCampaign,
              id: newId,
              _id: newId,
              updatedAt: new Date().toISOString(),
              isDirty: false
            },
            isSaving: false,
            saveError: null
          });

        } catch (error) {
          console.error('saveTemplate: Error', error);
          set({
            isSaving: false,
            saveError: error instanceof Error ? error.message : 'Failed to save template'
          });
          throw error;
        } finally {
          saveMutex = false;
        }
      },

      // Update Campaign (Generic)
      validateAndFixCampaign: () => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        let updates = {};
        let layers = [...currentCampaign.layers];
        let hasChanges = false;

        // Check 1: Root layer mismatch rename
        if (currentCampaign.nudgeType === 'bottomsheet' && layers[0]?.name === 'Modal Container') {
          console.log('validateAndFix: Renaming Modal Container -> Bottom Sheet');
          layers[0] = { ...layers[0], name: 'Bottom Sheet', type: 'container' };
          hasChanges = true;
        }
        else if (currentCampaign.nudgeType === 'modal' && layers[0]?.name === 'Bottom Sheet') {
          console.log('validateAndFix: Renaming Bottom Sheet -> Modal Container');
          layers[0] = { ...layers[0], name: 'Modal Container', type: 'container' };
          hasChanges = true;
        }

        // Check 2: Text type on container root
        if (['banner', 'tooltip', 'pip', 'floater'].includes(currentCampaign.nudgeType)) {
          const root = layers[0];
          if (root && root.type === 'text') {
            console.log(`validateAndFix: Fixing ${currentCampaign.nudgeType} root layer type text -> container`);
            layers[0] = { ...root, type: 'container' };
            hasChanges = true;
          }
        }

        if (hasChanges) {
          set({
            currentCampaign: {
              ...currentCampaign,
              layers,
              updatedAt: new Date().toISOString(),
              isDirty: true
            }
          });
        }

        // FIX: Also check interfaces for the same issues (Separate update to avoid complexity)
        const { currentCampaign: updatedCamp } = get();
        if (!updatedCamp || !updatedCamp.interfaces) return;

        let interfacesChanged = false;
        const interfaces = [...updatedCamp.interfaces];

        interfaces.forEach((iface, index) => {
          // Fix Interface Type mismatch based on name (heuristic)
          if (iface.name.toLowerCase().includes('bottom') && iface.nudgeType !== 'bottomsheet') {
            console.log(`validateAndFix: Fixing Interface ${iface.id} type modal -> bottomsheet`);
            interfaces[index] = { ...iface, nudgeType: 'bottomsheet' };
            interfacesChanged = true;
          }

          // Fix Interface Layers
          let iLayers = [...iface.layers];
          let iLayersChanged = false;

          // Interface Root Rename
          if (interfaces[index].nudgeType === 'bottomsheet' && iLayers[0]?.name === 'Modal Container') {
            console.log(`validateAndFix: Renaming Interface ${iface.id} root Modal Container -> Bottom Sheet`);
            iLayers[0] = { ...iLayers[0], name: 'Bottom Sheet', type: 'container' };
            iLayersChanged = true;
          }
          else if (interfaces[index].nudgeType === 'modal' && iLayers[0]?.name === 'Bottom Sheet') {
            iLayers[0] = { ...iLayers[0], name: 'Modal Container', type: 'container' };
            iLayersChanged = true;
          }

          // Interface Root Type Fix
          if (['banner', 'tooltip', 'pip', 'floater'].includes(interfaces[index].nudgeType)) {
            if (iLayers[0] && iLayers[0].type === 'text') {
              iLayers[0] = { ...iLayers[0], type: 'container' };
              iLayersChanged = true;
            }
          }

          if (iLayersChanged) {
            interfaces[index] = { ...interfaces[index], layers: iLayers };
            interfacesChanged = true;
          }
        });

        if (interfacesChanged) {
          set({
            currentCampaign: {
              ...updatedCamp,
              interfaces,
              updatedAt: new Date().toISOString(),
              isDirty: true
            }
          });
        }
      },



      // Add layer
      addLayer: (type, parentId) => {
        const { currentCampaign, activeInterfaceId } = get();
        if (!currentCampaign) return '';

        // FIX #7: Generate unique layer ID to prevent duplicates
        const uniqueLayerId = `layer_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        // Helper to get initial style
        let initialStyle = getDefaultStyleForType(type);

        const newLayer: Layer = {
          id: uniqueLayerId,
          type,
          name: `New ${type}`,
          parent: parentId || null,
          children: [],
          visible: true,
          locked: false,
          zIndex: 0, // Will be updated below
          position: { x: 0, y: 0 },
          size: { width: 'auto', height: 'auto' },
          content: getDefaultContentForType(type),
          style: initialStyle,
        };

        // --- SCENARIO 1: ADD TO SUB-INTERFACE ---
        if (activeInterfaceId) {
          const updatedInterfaces = currentCampaign.interfaces.map(iface => {
            if (iface.id !== activeInterfaceId) return iface;

            // Check if parent is PIP Container (within interface)
            const parentLayer = iface.layers.find(l => l.id === parentId);
            const isPipContainer = parentLayer?.name === 'PIP Container';

            if (isPipContainer) {
              newLayer.style = {
                ...newLayer.style,
                position: 'absolute',
                bottom: 32,
                left: '50%',
                transform: { translateX: '-50%' },
                zIndex: 100,
                width: '90%',
              };
            }

            // Set Z-index
            newLayer.zIndex = iface.layers.length;

            const updatedLayers = [...iface.layers, newLayer];

            // Update parent's children array
            if (parentId) {
              const parentIndex = updatedLayers.findIndex(l => l.id === parentId);
              if (parentIndex !== -1) {
                updatedLayers[parentIndex] = {
                  ...updatedLayers[parentIndex],
                  children: [...updatedLayers[parentIndex].children, newLayer.id]
                };
              }
            }

            return { ...iface, layers: updatedLayers, updatedAt: new Date().toISOString() };
          });

          set({
            currentCampaign: {
              ...currentCampaign,
              interfaces: updatedInterfaces,
              selectedLayerId: newLayer.id,
              isDirty: true
            }
          });
          return newLayer.id;
        }

        // --- SCENARIO 2: ADD TO MAIN CAMPAIGN (Legacy/Default) ---
        const parentLayer = currentCampaign.layers.find(l => l.id === parentId);
        const isPipContainer = parentLayer?.name === 'PIP Container';

        if (isPipContainer) {
          newLayer.style = {
            ...newLayer.style,
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: { translateX: '-50%' },
            zIndex: 100,
            width: '90%',
          };
        }

        newLayer.zIndex = currentCampaign.layers.length;

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



      // Update layer (Universal - Main Campaign or Interfaces)
      updateLayer: (id, updates) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        // 1. Try finding in Main Campaign
        let found = false;
        const updatedMainLayers = currentCampaign.layers.map(layer => {
          if (layer.id === id) {
            found = true;
            return { ...layer, ...updates };
          }
          return layer;
        });

        if (found) {
          // Verify history push (simplified for now, history might need robust handling for deeply nested updates)
          const newHistory = currentCampaign.history.slice(0, currentCampaign.historyIndex + 1);
          newHistory.push(updatedMainLayers);

          set({
            currentCampaign: {
              ...currentCampaign,
              layers: updatedMainLayers,
              history: newHistory,
              historyIndex: newHistory.length - 1,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
          return;
        }

        // 2. Try finding in Interfaces
        if (currentCampaign.interfaces) {
          let foundInInterface = false;
          const updatedInterfaces = currentCampaign.interfaces.map(iface => {
            if (!iface.layers) return iface;

            let layerChanged = false;
            const newInterfaceLayers = iface.layers.map(layer => {
              if (layer.id === id) {
                foundInInterface = true;
                layerChanged = true;
                return { ...layer, ...updates };
              }
              return layer;
            });

            if (layerChanged) {
              return { ...iface, layers: newInterfaceLayers };
            }
            return iface;
          });

          if (foundInInterface) {
            set({
              currentCampaign: {
                ...currentCampaign,
                interfaces: updatedInterfaces,
                updatedAt: new Date().toISOString(),
                isDirty: true,
              },
            });
          }
        }
      },

      // Delete layer
      deleteLayer: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        // 1. Try Main Campaign
        const layerInMain = currentCampaign.layers.find(l => l.id === id);
        if (layerInMain) {
          // Remove from parent's children
          let updatedLayers = currentCampaign.layers.map(l => {
            if (l.id === layerInMain.parent) {
              return {
                ...l,
                children: l.children.filter(childId => childId !== id),
              };
            }
            return l;
          });

          // Delete recursively
          const deleteRecursive = (layerId: string) => {
            const toDelete = updatedLayers.find(l => l.id === layerId);
            if (toDelete) {
              toDelete.children.forEach(childId => deleteRecursive(childId));
              updatedLayers = updatedLayers.filter(l => l.id !== layerId);
            }
          };

          deleteRecursive(id);

          set({
            currentCampaign: {
              ...currentCampaign,
              layers: updatedLayers,
              selectedLayerId: currentCampaign.selectedLayerId === id ? null : currentCampaign.selectedLayerId,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
          saveToHistoryDebounced(get, set);
          return;
        }

        // 2. Try Interfaces
        if (currentCampaign.interfaces) {
          let foundInInterface = false;
          const updatedInterfaces = currentCampaign.interfaces.map(iface => {
            if (!iface.layers) return iface;
            const layerInInterface = iface.layers.find(l => l.id === id);

            if (layerInInterface) {
              foundInInterface = true;
              let updatedLayers = iface.layers.map(l => {
                if (l.id === layerInInterface.parent) {
                  return {
                    ...l,
                    children: l.children.filter(childId => childId !== id),
                  };
                }
                return l;
              });

              const deleteRecursive = (layerId: string) => {
                const toDelete = updatedLayers.find(l => l.id === layerId);
                if (toDelete) {
                  toDelete.children.forEach(childId => deleteRecursive(childId));
                  updatedLayers = updatedLayers.filter(l => l.id !== layerId);
                }
              };
              deleteRecursive(id);

              return { ...iface, layers: updatedLayers };
            }
            return iface;
          });

          if (foundInInterface) {
            set({
              currentCampaign: {
                ...currentCampaign,
                interfaces: updatedInterfaces,
                selectedLayerId: currentCampaign.selectedLayerId === id ? null : currentCampaign.selectedLayerId,
                updatedAt: new Date().toISOString(),
                isDirty: true,
              },
            });
            saveToHistoryDebounced(get, set);
          }
        }
      },

      // Duplicate layer
      duplicateLayer: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return '';

        // Helper to clone and offset style
        const cloneAndOffsetStyle = (style: LayerStyle): LayerStyle => {
          const newStyle = { ...style };
          if (newStyle.position === 'absolute' || newStyle.position === 'fixed') {
            // Add 20px offset to show it's a copy
            const parseVal = (val: string | number | undefined) => {
              if (typeof val === 'number') return val;
              if (typeof val === 'string' && val.endsWith('px')) return parseFloat(val);
              return 0; // Don't touch % or auto
            };

            const left = parseVal(newStyle.left);
            const top = parseVal(newStyle.top);

            // Only offset if we successfully parsed a number (px or raw)
            if (typeof newStyle.left === 'string' && newStyle.left.endsWith('%')) {
              // Optional: offset % slightly? 
              // let val = parseFloat(newStyle.left);
              // newStyle.left = `${val + 2}%`;
            } else {
              newStyle.left = `${left + 20}px`;
            }

            if (typeof newStyle.top === 'string' && newStyle.top.endsWith('%')) {
              // let val = parseFloat(newStyle.top);
              // newStyle.top = `${val + 2}%`;
            } else {
              newStyle.top = `${top + 20}px`;
            }
          }
          return newStyle;
        };

        // 1. Try Main Campaign
        const layerInMain = currentCampaign.layers.find(l => l.id === id);
        if (layerInMain) {
          const newLayer: Layer = {
            ...layerInMain,
            id: `layer_${Date.now()}`,
            name: `${layerInMain.name} Copy`,
            children: [],
            content: { ...layerInMain.content },
            style: cloneAndOffsetStyle(layerInMain.style),
            position: { ...layerInMain.position },
            size: { ...layerInMain.size },
          };
          const updatedLayers = [...currentCampaign.layers, newLayer];
          if (layerInMain.parent) {
            const parentIndex = updatedLayers.findIndex(l => l.id === layerInMain.parent);
            if (parentIndex !== -1) {
              updatedLayers[parentIndex] = {
                ...updatedLayers[parentIndex],
                children: [...updatedLayers[parentIndex].children, newLayer.id],
              };
            }
          }
          set({
            currentCampaign: {
              ...currentCampaign,
              layers: updatedLayers,
              updatedAt: new Date().toISOString(),
              isDirty: true,
              selectedLayerId: newLayer.id
            },
          });
          saveToHistoryDebounced(get, set);
          return newLayer.id;
        }

        // 2. Try Interfaces
        if (currentCampaign.interfaces) {
          let newLayerId = '';
          const updatedInterfaces = currentCampaign.interfaces.map(iface => {
            if (!iface.layers) return iface;
            const layerInInterface = iface.layers.find(l => l.id === id);
            if (layerInInterface) {
              const newLayer: Layer = {
                ...layerInInterface,
                id: `layer_${Date.now()}_iface`,
                name: `${layerInInterface.name} Copy`,
                children: [],
                content: { ...layerInInterface.content },
                style: cloneAndOffsetStyle(layerInInterface.style),
                position: { ...layerInInterface.position },
                size: { ...layerInInterface.size },
              };
              newLayerId = newLayer.id;

              const updatedLayers = [...iface.layers, newLayer];
              if (layerInInterface.parent) {
                const parentIndex = updatedLayers.findIndex(l => l.id === layerInInterface.parent);
                if (parentIndex !== -1) {
                  updatedLayers[parentIndex] = {
                    ...updatedLayers[parentIndex],
                    children: [...updatedLayers[parentIndex].children, newLayer.id],
                  };
                }
              }
              return { ...iface, layers: updatedLayers };
            }
            return iface;
          });

          if (newLayerId) {
            set({
              currentCampaign: {
                ...currentCampaign,
                interfaces: updatedInterfaces,
                updatedAt: new Date().toISOString(),
                isDirty: true,
                selectedLayerId: newLayerId
              },
            });
            saveToHistoryDebounced(get, set);
            return newLayerId;
          }
        }
        return '';
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

        // 1. Try Main Campaign
        let found = false;
        const updatedMainLayers = currentCampaign.layers.map(layer => {
          if (layer.id === id) {
            found = true;
            return { ...layer, visible: !layer.visible };
          }
          return layer;
        });

        if (found) {
          set({
            currentCampaign: {
              ...currentCampaign,
              layers: updatedMainLayers,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
          return;
        }

        // 2. Try Interfaces
        if (currentCampaign.interfaces) {
          let foundInInterface = false;
          const updatedInterfaces = currentCampaign.interfaces.map(iface => {
            if (!iface.layers) return iface;
            let layerChanged = false;
            const newLayers = iface.layers.map(layer => {
              if (layer.id === id) {
                foundInInterface = true;
                layerChanged = true;
                return { ...layer, visible: !layer.visible };
              }
              return layer;
            });
            return layerChanged ? { ...iface, layers: newLayers } : iface;
          });

          if (foundInInterface) {
            set({
              currentCampaign: {
                ...currentCampaign,
                interfaces: updatedInterfaces,
                updatedAt: new Date().toISOString(),
                isDirty: true,
              },
            });
          }
        }
      },

      // Toggle lock
      toggleLayerLock: (id) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        // 1. Try Main Campaign
        let found = false;
        const updatedMainLayers = currentCampaign.layers.map(layer => {
          if (layer.id === id) {
            found = true;
            return { ...layer, locked: !layer.locked };
          }
          return layer;
        });

        if (found) {
          set({
            currentCampaign: {
              ...currentCampaign,
              layers: updatedMainLayers,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
          return;
        }

        // 2. Try Interfaces
        if (currentCampaign.interfaces) {
          let foundInInterface = false;
          const updatedInterfaces = currentCampaign.interfaces.map(iface => {
            if (!iface.layers) return iface;
            let layerChanged = false;
            const newLayers = iface.layers.map(layer => {
              if (layer.id === id) {
                foundInInterface = true;
                layerChanged = true;
                return { ...layer, locked: !layer.locked };
              }
              return layer;
            });
            return layerChanged ? { ...iface, layers: newLayers } : iface;
          });

          if (foundInInterface) {
            set({
              currentCampaign: {
                ...currentCampaign,
                interfaces: updatedInterfaces,
                updatedAt: new Date().toISOString(),
                isDirty: true,
              },
            });
          }
        }
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

        // FIX: Sync parent's children array to match the new order
        // The SDK relies on the 'children' array, while Dashboard relies on flat list.
        // We must ensure they stay in sync.
        if (removed.parent) {
          const parentIndex = updatedLayers.findIndex(l => l.id === removed.parent);
          if (parentIndex !== -1) {
            // Get all children of this parent in the Correct Order (from updatedLayers flat list)
            const siblingIds = updatedLayers
              .filter(l => l.parent === removed.parent)
              .map(l => l.id);

            updatedLayers[parentIndex] = {
              ...updatedLayers[parentIndex],
              children: siblingIds
            };
          }
        }

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

        // 1. Try Main Campaign
        let found = false;
        const updatedMainLayers = currentCampaign.layers.map(layer => {
          if (layer.id === id) {
            found = true;
            return { ...layer, content: { ...layer.content, ...content } };
          }
          return layer;
        });

        if (found) {
          set({
            currentCampaign: {
              ...currentCampaign,
              layers: updatedMainLayers,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
          saveToHistoryDebounced(get, set);
          return;
        }

        // 2. Try Interfaces
        if (currentCampaign.interfaces) {
          let foundInInterface = false;
          const updatedInterfaces = currentCampaign.interfaces.map(iface => {
            if (!iface.layers) return iface;
            let layerChanged = false;
            const newLayers = iface.layers.map(layer => {
              if (layer.id === id) {
                foundInInterface = true;
                layerChanged = true;
                return { ...layer, content: { ...layer.content, ...content } };
              }
              return layer;
            });
            return layerChanged ? { ...iface, layers: newLayers } : iface;
          });

          if (foundInInterface) {
            set({
              currentCampaign: {
                ...currentCampaign,
                interfaces: updatedInterfaces,
                updatedAt: new Date().toISOString(),
                isDirty: true,
              },
            });
            saveToHistoryDebounced(get, set);
          }
        }
      },

      // Update layer style
      updateLayerStyle: (id, style) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        // 1. Try Main Campaign
        let found = false;
        const updatedMainLayers = currentCampaign.layers.map(layer => {
          if (layer.id === id) {
            found = true;
            return { ...layer, style: { ...layer.style, ...style } };
          }
          return layer;
        });

        if (found) {
          set({
            currentCampaign: {
              ...currentCampaign,
              layers: updatedMainLayers,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
          saveToHistoryDebounced(get, set);
          return;
        }

        // 2. Try Interfaces
        if (currentCampaign.interfaces) {
          let foundInInterface = false;
          const updatedInterfaces = currentCampaign.interfaces.map(iface => {
            if (!iface.layers) return iface;
            let layerChanged = false;
            const newLayers = iface.layers.map(layer => {
              if (layer.id === id) {
                foundInInterface = true;
                layerChanged = true;
                return { ...layer, style: { ...layer.style, ...style } };
              }
              return layer;
            });
            return layerChanged ? { ...iface, layers: newLayers } : iface;
          });

          if (foundInInterface) {
            set({
              currentCampaign: {
                ...currentCampaign,
                interfaces: updatedInterfaces,
                updatedAt: new Date().toISOString(),
                isDirty: true,
              },
            });
            saveToHistoryDebounced(get, set);
          }
        }
      },




      // Update bottom sheet config (Phase 3)
      updateBottomSheetConfig: (config) => {
        const { currentCampaign, activeInterfaceId } = get();
        if (!currentCampaign) return;

        const defaults = {
          height: 'auto',
          dragHandle: false,
          showCloseButton: false,
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

        const activeInterface = activeInterfaceId ? currentCampaign.interfaces?.find(i => i.id === activeInterfaceId) : null;
        const currentConfig = (activeInterface ? activeInterface.bottomSheetConfig : currentCampaign.bottomSheetConfig) || defaults;

        // Deep merge for nested objects
        const updatedConfig = { ...currentConfig };
        Object.keys(config).forEach(key => {
          // @ts-ignore
          if (config[key] && typeof config[key] === 'object' && !Array.isArray(config[key])) {
            // @ts-ignore
            updatedConfig[key] = { ...currentConfig[key], ...config[key] };
          } else {
            // @ts-ignore
            updatedConfig[key] = config[key];
          }
        });

        if (activeInterface) {
          const updatedInterfaces = currentCampaign.interfaces.map(iface =>
            iface.id === activeInterfaceId
              ? { ...iface, bottomSheetConfig: updatedConfig as BottomSheetConfig, updatedAt: new Date().toISOString() }
              : iface
          );

          set({
            currentCampaign: {
              ...currentCampaign,
              interfaces: updatedInterfaces,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
          });
        } else {
          set({
            currentCampaign: {
              ...currentCampaign,
              bottomSheetConfig: updatedConfig as BottomSheetConfig,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
        }
      },

      // Update PIP config
      updatePipConfig: (config: any) => {
        const { currentCampaign, activeInterfaceId } = get();
        if (!currentCampaign) return;

        const activeInterface = activeInterfaceId ? currentCampaign.interfaces?.find(i => i.id === activeInterfaceId) : null;

        if (activeInterface) {
          const currentConfig = activeInterface.pipConfig || {};
          const updatedConfig = { ...currentConfig, ...config };
          const updatedInterfaces = currentCampaign.interfaces.map(iface =>
            iface.id === activeInterfaceId
              ? { ...iface, pipConfig: updatedConfig, updatedAt: new Date().toISOString() }
              : iface
          );

          set({
            currentCampaign: {
              ...currentCampaign,
              interfaces: updatedInterfaces,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
          });
        } else {
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
        }
      },

      // Update Modal config
      updateModalConfig: (config: any) => {
        const { currentCampaign, activeInterfaceId } = get();
        if (!currentCampaign) return;

        const defaults = {
          type: 'text',
          width: '90%',
          height: 'auto',
          backgroundColor: '#FFFFFF',
          elevation: 2,
          overlay: { enabled: true, opacity: 0.5, blur: 0, color: '#000000', dismissOnClick: true },
          animation: { type: 'pop', duration: 300, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }
        };

        const activeInterface = activeInterfaceId ? currentCampaign.interfaces?.find(i => i.id === activeInterfaceId) : null;
        // @ts-ignore
        const currentConfig = (activeInterface ? activeInterface.modalConfig : currentCampaign.modalConfig) || defaults;

        // Deep merge for nested objects
        const updatedConfig = { ...currentConfig };
        Object.keys(config).forEach(key => {
          if (config[key] && typeof config[key] === 'object' && !Array.isArray(config[key])) {
            updatedConfig[key] = { ...(currentConfig[key] || {}), ...config[key] };
          } else {
            updatedConfig[key] = config[key];
          }
        });

        if (activeInterface) {
          const updatedInterfaces = currentCampaign.interfaces.map(iface =>
            iface.id === activeInterfaceId
              ? { ...iface, modalConfig: updatedConfig as any, updatedAt: new Date().toISOString() }
              : iface
          );

          set({
            currentCampaign: {
              ...currentCampaign,
              interfaces: updatedInterfaces,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
          });
        } else {
          set({
            currentCampaign: {
              ...currentCampaign,
              modalConfig: updatedConfig as any,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
        }
      },


      // Update ScratchCard config
      updateScratchCardConfig: (config: any) => {
        const { currentCampaign, activeInterfaceId } = get();
        if (!currentCampaign) return;

        const defaults = {
          width: 320,
          height: 480,
          borderRadius: 16,
          coverType: 'color',
          coverColor: '#CCCCCC',
          scratchType: 'brush',
          scratchSize: 40,
          revealThreshold: 50,
          autoReveal: true,
          overlay: { enabled: true, opacity: 0.5, color: '#000000', dismissOnClick: true },
        };

        const activeInterface = activeInterfaceId ? currentCampaign.interfaces?.find(i => i.id === activeInterfaceId) : null;
        // @ts-ignore
        const currentConfig = (activeInterface ? activeInterface.scratchCardConfig : currentCampaign.scratchCardConfig) || defaults;

        // Deep merge
        const updatedConfig = { ...currentConfig };
        Object.keys(config).forEach(key => {
          if (config[key] && typeof config[key] === 'object' && !Array.isArray(config[key])) {
            updatedConfig[key] = { ...(currentConfig[key] || {}), ...config[key] };
          } else {
            updatedConfig[key] = config[key];
          }
        });

        if (activeInterface) {
          const updatedInterfaces = currentCampaign.interfaces.map(iface =>
            iface.id === activeInterfaceId
              ? { ...iface, scratchCardConfig: updatedConfig as any, updatedAt: new Date().toISOString() }
              : iface
          );
          set({
            currentCampaign: {
              ...currentCampaign,
              interfaces: updatedInterfaces,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
          });
        } else {
          set({
            currentCampaign: {
              ...currentCampaign,
              scratchCardConfig: updatedConfig as any,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
        }
      },

      // Update Banner config
      updateBannerConfig: (config: any) => {
        const { currentCampaign, activeInterfaceId } = get();
        if (!currentCampaign) return;

        const activeInterface = activeInterfaceId ? currentCampaign.interfaces?.find(i => i.id === activeInterfaceId) : null;

        if (activeInterface) {
          const updatedBannerConfig = { ...(activeInterface.bannerConfig || {}), ...config };
          const updatedInterfaces = currentCampaign.interfaces.map(iface =>
            iface.id === activeInterfaceId
              ? { ...iface, bannerConfig: updatedBannerConfig, updatedAt: new Date().toISOString() }
              : iface
          );
          set({
            currentCampaign: {
              ...currentCampaign,
              interfaces: updatedInterfaces,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
          });
        } else {
          const updatedBannerConfig = { ...(currentCampaign.bannerConfig || {}), ...config };
          set({
            currentCampaign: {
              ...currentCampaign,
              bannerConfig: updatedBannerConfig,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
        }
      },

      // Update Floater config
      updateFloaterConfig: (config: any) => {
        const { currentCampaign, activeInterfaceId } = get();
        if (!currentCampaign) return;

        const activeInterface = activeInterfaceId ? currentCampaign.interfaces?.find(i => i.id === activeInterfaceId) : null;

        // Helper: Deep merge for known nested objects
        const deepMerge = (existing: any, updates: any) => {
          const merged = { ...existing, ...updates };

          // Deep merge nested objects to preserve all fields
          const nestedKeys = ['behavior', 'controls', 'media', 'backdrop', 'backdropFilter', 'animation', 'timing', 'shadow'];
          nestedKeys.forEach(key => {
            if (updates[key] && typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
              merged[key] = { ...existing?.[key], ...updates[key] };
            }
          });

          return merged;
        };

        if (activeInterface) {
          const updatedFloaterConfig = deepMerge(activeInterface.floaterConfig, config);
          const updatedInterfaces = currentCampaign.interfaces.map(iface =>
            iface.id === activeInterfaceId
              ? { ...iface, floaterConfig: updatedFloaterConfig, updatedAt: new Date().toISOString() }
              : iface
          );
          set({
            currentCampaign: {
              ...currentCampaign,
              interfaces: updatedInterfaces,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
          });
        } else {
          const updatedFloaterConfig = deepMerge(currentCampaign.floaterConfig, config);
          set({
            currentCampaign: {
              ...currentCampaign,
              floaterConfig: updatedFloaterConfig,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
        }
      },

      // Update FullScreen config
      updateFullScreenConfig: (config: Partial<FullScreenConfig>) => {
        const { currentCampaign, activeInterfaceId } = get();
        if (!currentCampaign) return;

        const defaults: FullScreenConfig = {
          showSystemColor: false,
          overlay: { enabled: true, color: '#000000', opacity: 1, dismissOnClick: false },
          timing: { delay: 0, duration: 0 },
          parameters: {},
          cannotClash: false,
          backgroundColor: '#FFFFFF'
        };

        const activeInterface = activeInterfaceId ? currentCampaign.interfaces?.find(i => i.id === activeInterfaceId) : null;
        // @ts-ignore
        const currentConfig = (activeInterface ? activeInterface.fullscreenConfig : currentCampaign.fullscreenConfig) || defaults;

        // Deep merge logic
        const updatedConfig = { ...currentConfig };
        Object.keys(config).forEach(key => {
          // @ts-ignore
          if (config[key] && typeof config[key] === 'object' && !Array.isArray(config[key])) {
            // @ts-ignore
            updatedConfig[key] = { ...(currentConfig[key] || {}), ...config[key] };
          } else {
            // @ts-ignore
            updatedConfig[key] = config[key];
          }
        });

        if (activeInterface) {
          const updatedInterfaces = currentCampaign.interfaces.map(iface =>
            iface.id === activeInterfaceId
              ? { ...iface, fullscreenConfig: updatedConfig, updatedAt: new Date().toISOString() }
              : iface
          );
          set({
            currentCampaign: {
              ...currentCampaign,
              interfaces: updatedInterfaces,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
          });
        } else {
          set({
            currentCampaign: {
              ...currentCampaign,
              fullscreenConfig: updatedConfig,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
          });
        }
      },

      // Update Tooltip config
      updateTooltipConfig: (config: any) => {
        const { currentCampaign, activeInterfaceId } = get();
        if (!currentCampaign) return;

        const activeInterface = activeInterfaceId ? currentCampaign.interfaces?.find(i => i.id === activeInterfaceId) : null;

        if (activeInterface) {
          const updatedTooltipConfig = { ...(activeInterface.tooltipConfig || {}), ...config };
          const updatedInterfaces = currentCampaign.interfaces.map(iface =>
            iface.id === activeInterfaceId
              ? { ...iface, tooltipConfig: updatedTooltipConfig, updatedAt: new Date().toISOString() }
              : iface
          );

          set({
            currentCampaign: {
              ...currentCampaign,
              interfaces: updatedInterfaces,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
        } else {
          const updatedTooltipConfig = { ...(currentCampaign.tooltipConfig || {}), ...config };
          set({
            currentCampaign: {
              ...currentCampaign,
              tooltipConfig: updatedTooltipConfig,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            },
          });
        }
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

        // FIX: Sync 'trigger' field if we are updating an event rule
        let updatedTrigger = currentCampaign.trigger;
        const updatedRule = updatedRules.find(r => r.id === id);
        if (updatedRule && updatedRule.type === 'event' && updatedRule.event) {
          // Heuristic: If this is the *first* event rule, or the only one, sync it to the legacy 'trigger' field
          // For now, we sync if it matches the current trigger OR if trigger is default
          updatedTrigger = updatedRule.event;
        }

        set({
          currentCampaign: {
            ...currentCampaign,
            targeting: updatedRules,
            trigger: updatedTrigger,
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
        set({ currentCampaign: null, showEditor: false, activeInterfaceId: null });
      },

      // Update display rules
      updateDisplayRules: (rules) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        // FIX: Deep merge display rules to prevent data loss
        const existingRules = currentCampaign.displayRules || {};
        const mergedRules = { ...existingRules };

        Object.keys(rules).forEach(key => {
          // @ts-ignore
          const value = rules[key];
          // @ts-ignore
          const existingValue = existingRules[key];

          if (value && typeof value === 'object' && !Array.isArray(value) && existingValue && typeof existingValue === 'object') {
            // @ts-ignore
            mergedRules[key] = { ...existingValue, ...value };
          } else if (value !== undefined) {
            // @ts-ignore
            mergedRules[key] = value;
          }
        });

        set({
          currentCampaign: {
            ...currentCampaign,
            displayRules: mergedRules as DisplayRules,
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

      // Interface Management Methods
      setActiveInterface: (id) => set({ activeInterfaceId: id }),

      addInterface: (nudgeType, name) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return '';

        // Validate nudgeType
        const validTypes: CampaignInterface['nudgeType'][] = [
          'modal', 'bottomsheet', 'banner', 'tooltip', 'pip', 'floater', 'scratchcard'
        ];
        if (!validTypes.includes(nudgeType)) {
          console.error(`Invalid nudgeType: ${nudgeType}. Must be one of: ${validTypes.join(', ')}`);
          throw new Error(`Invalid nudgeType: ${nudgeType}`);
        }

        const interfaceId = `interface_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const interfaceName = name || `Interface ${(currentCampaign.interfaces || []).length + 1}`;

        // Get default layers for this nudge type
        const defaultLayers = getDefaultLayersForNudgeType(nudgeType);

        // Get default config for this nudge type
        const defaultConfig = getDefaultConfigForNudgeType(nudgeType);

        const newInterface: CampaignInterface = {
          id: interfaceId,
          name: interfaceName,
          nudgeType,
          layers: defaultLayers,
          ...defaultConfig,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('Creates New Interface:', newInterface); // DEBUG LOG to verify config existence

        set({
          currentCampaign: {
            ...currentCampaign,
            interfaces: [...(currentCampaign.interfaces || []), newInterface],
            isDirty: true,
          },
        });

        return interfaceId;
      },

      updateInterface: (id, updates) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedInterfaces = currentCampaign.interfaces.map(iface =>
          iface.id === id
            ? { ...iface, ...updates, updatedAt: new Date().toISOString() }
            : iface
        );

        set({
          currentCampaign: {
            ...currentCampaign,
            interfaces: updatedInterfaces,
            isDirty: true,
          },
        });
      },

      deleteInterface: (id) => {
        const { currentCampaign, activeInterfaceId } = get();
        if (!currentCampaign) return;

        const updatedInterfaces = currentCampaign.interfaces.filter(iface => iface.id !== id);

        set({
          currentCampaign: {
            ...currentCampaign,
            interfaces: updatedInterfaces,
            isDirty: true,
          },
          // If deleted interface was active, switch back to main campaign
          activeInterfaceId: activeInterfaceId === id ? null : activeInterfaceId,
        });
      },

      updateInterfaceLayer: (interfaceId, layerId, updates) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedInterfaces = currentCampaign.interfaces.map(iface => {
          if (iface.id !== interfaceId) return iface;

          const updatedLayers = iface.layers.map(layer =>
            layer.id === layerId ? { ...layer, ...updates } : layer
          );

          return { ...iface, layers: updatedLayers, updatedAt: new Date().toISOString() };
        });

        set({
          currentCampaign: {
            ...currentCampaign,
            interfaces: updatedInterfaces,
            isDirty: true,
          },
        });
      },

      addInterfaceLayer: (interfaceId, type) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const newLayerId = `layer_${Date.now()}`;
        const defaultContent = getDefaultContentForType(type);
        const defaultStyle = getDefaultStyleForType(type);

        const newLayer: Layer = {
          id: newLayerId,
          type,
          name: type.charAt(0).toUpperCase() + type.slice(1),
          parent: null,
          children: [],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: 'auto', height: 'auto' },
          content: defaultContent,
          style: defaultStyle,
        };

        const updatedInterfaces = currentCampaign.interfaces.map(iface => {
          if (iface.id !== interfaceId) return iface;
          return { ...iface, layers: [...iface.layers, newLayer], updatedAt: new Date().toISOString() };
        });

        set({
          currentCampaign: {
            ...currentCampaign,
            interfaces: updatedInterfaces,
            isDirty: true,
          },
        });
      },

      deleteInterfaceLayer: (interfaceId, layerId) => {
        const { currentCampaign } = get();
        if (!currentCampaign) return;

        const updatedInterfaces = currentCampaign.interfaces.map(iface => {
          if (iface.id !== interfaceId) return iface;
          const updatedLayers = iface.layers.filter(layer => layer.id !== layerId);
          return { ...iface, layers: updatedLayers, updatedAt: new Date().toISOString() };
        });

        set({
          currentCampaign: {
            ...currentCampaign,
            interfaces: updatedInterfaces,
            isDirty: true,
          },
        });
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
        activeInterfaceId: state.activeInterfaceId,
      }),
    }
  )
);

// Helper functions
export function getDefaultLayersForNudgeType(nudgeType: CampaignEditor['nudgeType']): Layer[] {
  const baseId = Date.now();
  const normalizedType = nudgeType?.toLowerCase();

  switch (normalizedType) {
    case 'bottomsheet':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'Bottom Sheet',
          parent: null,
          children: [],
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
          children: [], // No default children - user adds layers manually
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
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            gap: 12,
          },
        },
      ];

    case 'scratchcard':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'Scratch Card Container',
          parent: null,
          children: [],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: '100%' as any, height: '100%' as any },
          content: {},
          style: {
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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
            textColor: '#FFFFFF',
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
          children: [], // No default layers - user adds layers manually
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: 280, height: 180 }, // PIP-like size
          content: {},
          style: {
            backgroundColor: '#000000', // Black like PIP video
            borderRadius: 0, // Square corners
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
      ];


    case 'fullscreen':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'Fullscreen Layout',
          parent: null,
          children: [],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0, type: 'absolute' },
          size: { width: '100%', height: '100%' },
          content: {},
          style: {
            backgroundColor: '#FFFFFF',
            width: '100%',
            height: '100%',
          },
        }
      ];

    case 'tooltip':
      return [
        {
          id: `layer_${baseId}`,
          type: 'container',
          name: 'Tooltip Container',
          parent: null,
          children: [`layer_${baseId + 1}`],
          visible: true,
          locked: false,
          zIndex: 0,
          position: { x: 0, y: 0 },
          size: { width: 'auto', height: 'auto' },
          content: {},
          style: {
            backgroundColor: '#111827',
            borderRadius: 8,
            padding: { top: 8, right: 12, bottom: 8, left: 12 },
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        {
          id: `layer_${baseId + 1}`,
          type: 'text',
          name: 'Tooltip Text',
          parent: `layer_${baseId}`,
          children: [],
          visible: true,
          locked: false,
          zIndex: 1,
          position: { x: 0, y: 0 },
          size: { width: 'auto', height: 'auto' },
          content: {
            text: 'This is a tooltip',
            fontSize: 14,
            fontWeight: 'medium',
            textColor: '#FFFFFF',
            textAlign: 'center',
          },
          style: {
            padding: 0,
            margin: 0,
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
    case 'scratch_foil':
      return {
        coverColor: '#CCCCCC',
        scratchSize: 50,
        revealThreshold: 50,
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
    position: 'absolute', // FIX: Ensure new layers are draggable by default
    top: '20px',
    left: '20px',
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
      return {
        ...baseStyle,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D1D5DB', // Gray-300
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 12,
        labelColor: '#374151', // Gray-700
        helperColor: '#6B7280', // Gray-500
        padding: { top: 0, right: 0, bottom: 0, left: 0 }, // Reset overlapping padding
      };
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
    case 'scratch_foil':
      return {
        ...baseStyle,
        width: '100%',
        height: '100%',
        top: '0px',
        left: '0px',
        zIndex: 50,
        position: 'absolute'
      };
    case 'container':
      return {
        ...baseStyle,
        width: 200,
        height: 120,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#9CA3AF',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: { top: 10, right: 10, bottom: 10, left: 10 }
      };
    default:
      return baseStyle;
  }
}

// Helper to get default config for interface nudge types
function getDefaultConfigForNudgeType(nudgeType: CampaignInterface['nudgeType']): Partial<CampaignInterface> {
  const normalizedType = nudgeType?.toLowerCase();
  console.log('Generating default config for type:', normalizedType); // DEBUG LOG checking input

  switch (normalizedType) {
    case 'modal':
      return {
        modalConfig: {
          mode: 'container',
          width: '90%' as any,
          height: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          elevation: 2,
          overlay: {
            enabled: true,
            opacity: 0.5,
            blur: 0,
            color: '#000000',
            dismissOnClick: true,
          },
          animation: {
            type: 'pop',
            duration: 300,
            easing: 'ease-out',
          },
        },
      };
    case 'bottomsheet':
      return {
        bottomSheetConfig: {
          mode: 'container',
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
        },
      };
    case 'tooltip':
      return {
        tooltipConfig: {
          position: 'top',
          arrowSize: 10,
          showArrow: true,
          backgroundColor: '#111827',
          textColor: '#FFFFFF',
          borderRadius: 8,
          padding: 12,
          maxWidth: 300,
        },
      };
    case 'banner':
      return {
        bannerConfig: {
          position: 'top',
          width: '100%',
          height: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: 0,
          elevation: 1,
        },
      };
    case 'pip':
      return {
        pipConfig: {
          position: 'bottom-right',
          width: 320,
          height: 180,
          borderRadius: 12,
        },
      };
    case 'scratchcard':
      return {
        scratchCardConfig: {
          width: 320,
          height: 480,
          borderRadius: 16,
          coverType: 'color',
          coverColor: '#CCCCCC',
          scratchType: 'brush',
          scratchSize: 40,
          revealThreshold: 50,
          autoReveal: true,
          overlay: {
            enabled: true,
            opacity: 0.5,
            color: '#000000',
            dismissOnClick: true,
          },
        },
      };
    case 'floater':
      return {
        floaterConfig: {
          position: 'bottom-right',
          width: 280, // PIP-like width
          height: 180, // PIP-like height
          backgroundColor: '#000000', // Black like PIP
          borderRadius: 0, // Square corners
          shape: 'rectangle', // Square like PIP
          glassmorphism: { enabled: false, blur: 10, opacity: 0.2 },
          gradient: { enabled: false, startColor: '#000000', endColor: '#333333', angle: 45 },
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
        }
      };
    case 'fullscreen':
      return {
        fullscreenConfig: {
          backgroundColor: '#FFFFFF',
          showSystemColor: true,
          overlay: {
            enabled: false,
            color: '#000000',
            opacity: 0.5,
            dismissOnClick: false,
          },
          timing: {
            delay: 0,
            duration: 0,
          },
          cannotClash: true,
        }
      };
    default:
      return {};
  }
}
