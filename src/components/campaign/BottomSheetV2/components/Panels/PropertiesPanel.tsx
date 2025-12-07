import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Layout,
  Sparkles,
  Palette,
  Settings,
  Layers as LayersIcon,
  Library,
  Image as ImageIcon,
  MessageSquare,
  Zap,
  Paintbrush,
  Box,
  Activity,
  Download,
  Code2
} from 'lucide-react';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import { FlexLayoutPanel } from './FlexLayoutPanel';
import { EffectsPanel } from './EffectsPanel';
import AnimationPanel from './AnimationPanel';
import StylesPanel from './StylesPanel';
import ComponentLibraryPanel from './ComponentLibraryPanel';
import ComponentStatesPanel from './ComponentStatesPanel';
import InteractionsPanel from './InteractionsPanel';
import { ExportPanel } from './ExportPanel';
import VariablesPanel from './VariablesPanel';
import { ElementStylePanel } from './ElementStylePanel';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PropertiesPanelProps {
  state: BottomSheetState;
}

/**
 * PropertiesPanel - Right sidebar with all editing controls
 * 
 * Tabs:
 * 1. Layout - Position, size, rotation, flex layout
 * 2. Style - Colors, typography, basic styling
 * 3. Effects - Shadows, gradients, blur, opacity
 * 4. Content - Component-specific content editing
 * 5. Advanced - States, interactions, animations, variables
 */
export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ state }) => {
  const { selectedComponent } = state;

  if (!selectedComponent) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-400">
          <LayersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-semibold mb-2">No Component Selected</p>
          <p className="text-sm">Click a component on the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="layout" className="flex-1 flex flex-col h-full">
      <TabsList className="grid grid-cols-7 w-full rounded-none border-b">
        <TabsTrigger value="layout" className="text-xs gap-1">
          <Layout className="h-3.5 w-3.5" />
          Layout
        </TabsTrigger>
        <TabsTrigger value="style" className="text-xs gap-1">
          <Palette className="h-3.5 w-3.5" />
          Style
        </TabsTrigger>
        <TabsTrigger value="variables" className="text-xs gap-1">
          <Code2 className="h-3.5 w-3.5" />
          Variables
        </TabsTrigger>
        <TabsTrigger value="effects" className="text-xs gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Effects
        </TabsTrigger>
        <TabsTrigger value="animate" className="text-xs gap-1">
          <Zap className="h-3.5 w-3.5" />
          Animate
        </TabsTrigger>
        <TabsTrigger value="export" className="text-xs gap-1">
          <Download className="h-3.5 w-3.5" />
          Export
        </TabsTrigger>
        <TabsTrigger value="advanced" className="text-xs gap-1">
          <Settings className="h-3.5 w-3.5" />
          Advanced
        </TabsTrigger>
      </TabsList>

      {/* Layout Tab */}
      <TabsContent value="layout" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <FlexLayoutPanel state={state} />
        </ScrollArea>
      </TabsContent>

      {/* Style Tab */}
      <TabsContent value="style" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <ElementStylePanel state={state} />
          <Separator className="my-4" />
          <BasicStylePanel state={state} />
        </ScrollArea>
      </TabsContent>

      {/* Variables Tab */}
      <TabsContent value="variables" className="flex-1 mt-0 overflow-hidden">
        <VariablesPanel />
      </TabsContent>

      {/* Effects Tab */}
      <TabsContent value="effects" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <EffectsPanel state={state} />
        </ScrollArea>
      </TabsContent>

      {/* Animate Tab */}
      <TabsContent value="animate" className="flex-1 mt-0 overflow-hidden">
        <AnimationPanel state={state} />
      </TabsContent>

      {/* Export Tab */}
      <TabsContent value="export" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <ExportPanel />
        </ScrollArea>
      </TabsContent>

      {/* Advanced Tab */}
      <TabsContent value="advanced" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <AdvancedPanel state={state} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

/**
 * BasicStylePanel - Component-specific content editing
 * (Styling now handled by ElementStylePanel)
 */
const BasicStylePanel: React.FC<{ state: BottomSheetState }> = ({ state }) => {
  const { selectedComponent, updateComponent } = state;

  if (!selectedComponent) return null;

  const style = selectedComponent.style || {};
  const content = selectedComponent.content || {};

  return (
    <div className="p-4 space-y-6">
      {/* Component Type Badge */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex justify-between items-center">
        <div>
          <div className="text-xs text-indigo-600 font-medium uppercase">
            {selectedComponent.type}
          </div>
          <div className="text-xs text-indigo-500 mt-1">
            ID: {selectedComponent.id.split('_').slice(0, 2).join('_')}...
          </div>
        </div>
        <div className="text-[10px] text-gray-400">Content Settings</div>
      </div>

      {/* Text Components */}
      {selectedComponent.type === 'text' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Text Content</h4>
            <textarea
              value={String(content.text || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, text: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              rows={3}
              placeholder="Enter text..."
            />
          </div>
        </>
      )}

      {/* Button Components */}
      {selectedComponent.type === 'button' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Button Label</h4>
            <input
              type="text"
              value={String(content.text || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, text: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Button text..."
            />
          </div>
        </>
      )}

      {/* Image Components */}
      {selectedComponent.type === 'image' && (
        <>
          <div className="space-y-3">
            <h5 className="text-xs font-medium text-gray-500">Image Source</h5>
            <input
              type="text"
              value={String(content.url || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, url: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-medium text-gray-500">Aspect Ratio</h5>
            <select
              value={String(content.aspectRatio || 'free')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, aspectRatio: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="free">Free (No lock)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="3:4">3:4 (Portrait)</option>
              <option value="2:3">2:3 (Tall)</option>
              <option value="21:9">21:9 (Ultrawide)</option>
            </select>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-medium text-gray-500">Object Fit</h5>
            <select
              value={String(content.objectFit || 'cover')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, objectFit: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="cover">Cover (Fill & Crop)</option>
              <option value="contain">Contain (Fit Inside)</option>
              <option value="fill">Fill (Stretch)</option>
              <option value="none">None (Original)</option>
              <option value="scale-down">Scale Down</option>
            </select>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-medium text-gray-500">Overlay</h5>
            <select
              value={typeof content.overlay === 'object' && content.overlay !== null ? String((content.overlay as any).type) : 'none'}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: {
                    ...content,
                    overlay: {
                      type: e.target.value,
                      gradient: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                      color: 'rgba(0,0,0,0.3)',
                      opacity: 1
                    }
                  },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="none">None</option>
              <option value="gradient">Gradient</option>
              <option value="color">Color</option>
            </select>
          </div>
        </>
      )}

      {/* Badge Components */}
      {selectedComponent.type === 'badge' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Badge Text</h4>
            <input
              type="text"
              value={String(content.text || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, text: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="LIVE NOW"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Variant & Shape</h4>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={String(content.variant || 'default')}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: { ...content, variant: e.target.value },
                  });
                }}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="default">Default</option>
                <option value="primary">Primary</option>
                <option value="danger">Danger</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>

              <select
                value={String(content.shape || 'rounded')}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: { ...content, shape: e.target.value },
                  });
                }}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="rounded">Rounded</option>
                <option value="pill">Pill</option>
                <option value="square">Square</option>
              </select>
            </div>

          </div>
        </>
      )}

      {/* RichText Components */}
      {selectedComponent.type === 'richtext' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">HTML Content</h4>
            <textarea
              value={String(content.html || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, html: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm font-mono"
              placeholder="Up to <b>30% OFF</b>"
              rows={6}
            />
          </div>
        </>
      )}

      {/* ProgressBar Components */}
      {selectedComponent.type === 'progressbar' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-gray-800">Value</h4>
              <input
                type="number"
                value={Number(content.value || 0)}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: { ...content, value: Number(e.target.value) },
                  });
                }}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-gray-800">Max</h4>
              <input
                type="number"
                value={Number(content.max || 100)}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: { ...content, max: Number(e.target.value) },
                  });
                }}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={content.showPercentage !== false}
                onChange={(e) => {
                  updateComponent(selectedComponent.id, {
                    content: { ...content, showPercentage: e.target.checked },
                  });
                }}
                className="rounded"
              />
              <span className="text-sm">Show Percentage</span>
            </label>
          </div>
        </>
      )}

      {/* ButtonGroup Components */}
      {selectedComponent.type === 'buttongroup' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Layout</h4>
            <select
              value={String(content.layout || 'horizontal')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, layout: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Sticky Position</h4>
            <select
              value={String(content.sticky || 'none')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, sticky: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="none">None</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Buttons</h4>
            <p className="text-xs text-gray-500">
              Default: DISMISS (outline) + BOOK NOW (primary)
            </p>
          </div>
        </>
      )}

      {/* ProgressCircle Components */}
      {selectedComponent.type === 'progresscircle' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Progress Value</h4>
            <input
              type="number"
              value={Number(content.value || 0)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, value: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={0}
              max={Number(content.max || 100)}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Maximum Value</h4>
            <input
              type="number"
              value={Number(content.max || 100)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, max: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={1}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Label</h4>
            <input
              type="text"
              value={String(content.label || '')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, label: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="e.g., Daily Goal"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Size (px)</h4>
            <input
              type="number"
              value={Number(style.size || 120)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  style: { ...style, size: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={60}
              max={300}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Stroke Width (px)</h4>
            <input
              type="number"
              value={Number(style.strokeWidth || 8)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  style: { ...style, strokeWidth: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={2}
              max={20}
            />
          </div>
        </>
      )}

      {/* Stepper Components */}
      {selectedComponent.type === 'stepper' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Current Step</h4>
            <input
              type="number"
              value={Number(content.currentStep || 0)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, currentStep: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={0}
              max={(content.steps as any[])?.length - 1 || 0}
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Orientation</h4>
            <select
              value={String(style.orientation || 'horizontal')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  style: { ...style, orientation: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>
        </>
      )}

      {/* List Components */}
      {selectedComponent.type === 'list' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">List Type</h4>
            <select
              value={String(content.type || 'bullet')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, type: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="bullet">Bullet Points</option>
              <option value="numbered">Numbered List</option>
              <option value="checkmark">Checkmarks ✓</option>
              <option value="icon">Custom Icons</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Style</h4>
            <select
              value={String(content.style || 'default')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, style: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="default">Default Spacing</option>
              <option value="compact">Compact</option>
              <option value="spaced">Spacious</option>
              <option value="bordered">Bordered</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">List Items</h4>
            <p className="text-xs text-gray-500">
              Total items: {(content.items as any[])?.length || 0}
            </p>
          </div>
        </>
      )}

      {/* Countdown Timer Components */}
      {selectedComponent.type === 'countdown' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Target Date</h4>
            <input
              type="datetime-local"
              value={content.targetDate ? new Date(content.targetDate as string).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, targetDate: new Date(e.target.value).toISOString() },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Format</h4>
            <select
              value={String(content.format || 'short')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, format: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="full">Full (5d 12h 30m 45s)</option>
              <option value="short">Short (5d 12h 30m)</option>
              <option value="compact">Compact (5d 12h)</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Urgency Threshold (mins)</h4>
            <input
              type="number"
              value={Number(content.urgentThreshold || 60)}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, urgentThreshold: Number(e.target.value) },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              min={0}
            />
          </div>
        </>
      )}

      {/* Link Components */}
      {selectedComponent.type === 'link' && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Link Text</h4>
            <input
              type="text"
              value={String(content.text || 'Click here')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, text: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Learn more"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">URL</h4>
            <input
              type="text"
              value={String(content.href || '#')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, href: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Variant</h4>
            <select
              value={String(content.variant || 'primary')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, variant: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="default">Default</option>
              <option value="primary">Primary (Bold)</option>
              <option value="secondary">Secondary</option>
              <option value="underline">Underlined</option>
              <option value="muted">Muted</option>
            </select>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800">Size</h4>
            <select
              value={String(content.size || 'md')}
              onChange={(e) => {
                updateComponent(selectedComponent.id, {
                  content: { ...content, size: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
        </>
      )}

      {/* Other components (List, Stepper, etc) kept simple or omitted for brevity if not used extensively yet, 
          but preserving the catch-all for now. Detailed implementations for complex types can remain if needed. 
          For now, simplifying to avoid huge file. */}

      {!['text', 'button', 'image', 'badge', 'richtext', 'progressbar', 'buttongroup', 'progresscircle', 'stepper', 'list', 'countdown', 'link'].includes(selectedComponent.type) && (
        <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 rounded-lg">
          Content settings for {selectedComponent.type}
        </div>
      )}

      {false && (!['text', 'button', 'image', 'badge', 'richtext', 'progressbar'].includes(selectedComponent.type)) && (
        <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 rounded-lg">
          Content settings for {selectedComponent.type}
        </div>
      )}
    </div>
  );
};

/**
 * AdvancedPanel - Design system, component library, states, interactions
 */
const AdvancedPanel: React.FC<{ state: BottomSheetState }> = ({ state }) => {
  return (
    <Tabs defaultValue="styles" className="flex-1 flex flex-col h-full">
      <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
        <TabsTrigger value="styles" className="text-xs gap-1">
          <Paintbrush className="h-3.5 w-3.5" />
          Styles
        </TabsTrigger>
        <TabsTrigger value="library" className="text-xs gap-1">
          <Box className="h-3.5 w-3.5" />
          Library
        </TabsTrigger>
        <TabsTrigger value="states" className="text-xs gap-1">
          <LayersIcon className="h-3.5 w-3.5" />
          States
        </TabsTrigger>
        <TabsTrigger value="interactions" className="text-xs gap-1">
          <Activity className="h-3.5 w-3.5" />
          Interact
        </TabsTrigger>
      </TabsList>

      <TabsContent value="styles" className="flex-1 mt-0 overflow-hidden">
        <StylesPanel state={state} />
      </TabsContent>

      <TabsContent value="library" className="flex-1 mt-0 overflow-hidden">
        <ComponentLibraryPanel state={state} />
      </TabsContent>

      <TabsContent value="states" className="flex-1 mt-0 overflow-hidden">
        <ComponentStatesPanel state={state} />
      </TabsContent>

      <TabsContent value="interactions" className="flex-1 mt-0 overflow-hidden">
        <InteractionsPanel state={state} />
      </TabsContent>
    </Tabs>
  );
};

export default PropertiesPanel;
