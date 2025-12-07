import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Trash2, Eye, EyeOff, Droplet, Sparkles } from 'lucide-react';
import type { BottomSheetState } from '../../hooks/useBottomSheetState';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

interface EffectsPanelProps {
  state: BottomSheetState;
}

/**
 * EffectsPanel - Layer Effects Controls (Shadow, Gradient, Blur, Stroke, Opacity)
 * 
 * Features:
 * - Multiple shadows (drop-shadow & inner-shadow)
 * - Gradients (linear, radial, angular)
 * - Blur effects (layer blur & background blur)
 * - Stroke (border with position control)
 * - Opacity & blend modes
 */
export const EffectsPanel: React.FC<EffectsPanelProps> = ({ state }) => {
  const { selectedComponent, addShadow, updateShadow, removeShadow, setGradient, setBlur, setStroke, setOpacity, updateComponent } = state;

  if (!selectedComponent) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Select a component to add effects
      </div>
    );
  }

  const effects = selectedComponent.effects || {
    shadows: [],
    opacity: 100,
  };

  // ========== Shadow Panel ==========
  const ShadowPanel = () => {
    const shadows = effects.shadows || [];

    const handleAddShadow = () => {
      const newShadow = {
        id: `shadow_${Date.now()}`,
        enabled: true,
        type: 'drop-shadow' as const,
        x: 0,
        y: 4,
        blur: 8,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.2)',
      };
      addShadow(selectedComponent.id, newShadow);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-semibold">Shadows</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddShadow}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>

        {/* Shadow Presets */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button variant="outline" size="sm" className="text-[10px] h-7 px-0" onClick={() => addShadow(selectedComponent.id, { id: `shadow_${Date.now()}`, enabled: true, type: 'drop-shadow', x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.1)' })}>Soft</Button>
          <Button variant="outline" size="sm" className="text-[10px] h-7 px-0" onClick={() => addShadow(selectedComponent.id, { id: `shadow_${Date.now()}`, enabled: true, type: 'drop-shadow', x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.15)' })}>Med</Button>
          <Button variant="outline" size="sm" className="text-[10px] h-7 px-0" onClick={() => addShadow(selectedComponent.id, { id: `shadow_${Date.now()}`, enabled: true, type: 'drop-shadow', x: 4, y: 4, blur: 0, spread: 0, color: 'rgba(0,0,0,1)' })}>Hard</Button>
          <Button variant="outline" size="sm" className="text-[10px] h-7 px-0" onClick={() => addShadow(selectedComponent.id, { id: `shadow_${Date.now()}`, enabled: true, type: 'drop-shadow', x: 0, y: 0, blur: 20, spread: 5, color: 'rgba(99, 102, 241, 0.6)' })}>Glow</Button>
        </div>

        {shadows.length === 0 && (
          <div className="text-center text-gray-400 text-xs py-8 border-2 border-dashed border-gray-200 rounded-lg">
            No shadows added.<br />Click "Add Shadow" to create one.
          </div>
        )}

        {shadows.map((shadow: any, index: number) => (
          <div key={shadow.id} className="border rounded-lg p-3 space-y-3 bg-gray-50">
            {/* Shadow Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={shadow.enabled}
                  onCheckedChange={(enabled) =>
                    updateShadow(selectedComponent.id, shadow.id, { enabled })
                  }
                />
                <span className="text-xs font-medium">
                  {shadow.type === 'drop-shadow' ? 'Drop Shadow' : 'Inner Shadow'} {index + 1}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeShadow(selectedComponent.id, shadow.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {shadow.enabled && (
              <>
                {/* Shadow Type */}
                <div className="space-y-2">
                  <Label className="text-xs">Type</Label>
                  <ToggleGroup
                    type="single"
                    value={shadow.type}
                    onValueChange={(value) =>
                      updateShadow(selectedComponent.id, shadow.id, { type: value })
                    }
                    className="grid grid-cols-2 gap-2"
                  >
                    <ToggleGroupItem value="drop-shadow" className="text-xs">
                      Drop Shadow
                    </ToggleGroupItem>
                    <ToggleGroupItem value="inner-shadow" className="text-xs">
                      Inner Shadow
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* X Offset */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">X Offset</Label>
                    <span className="text-xs text-gray-500">{shadow.x}px</span>
                  </div>
                  <Slider
                    value={[shadow.x]}
                    onValueChange={(v) =>
                      updateShadow(selectedComponent.id, shadow.id, { x: v[0] })
                    }
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Y Offset */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Y Offset</Label>
                    <span className="text-xs text-gray-500">{shadow.y}px</span>
                  </div>
                  <Slider
                    value={[shadow.y]}
                    onValueChange={(v) =>
                      updateShadow(selectedComponent.id, shadow.id, { y: v[0] })
                    }
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Blur */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Blur</Label>
                    <span className="text-xs text-gray-500">{shadow.blur}px</span>
                  </div>
                  <Slider
                    value={[shadow.blur]}
                    onValueChange={(v) =>
                      updateShadow(selectedComponent.id, shadow.id, { blur: v[0] })
                    }
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Spread */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Spread</Label>
                    <span className="text-xs text-gray-500">{shadow.spread}px</span>
                  </div>
                  <Slider
                    value={[shadow.spread]}
                    onValueChange={(v) =>
                      updateShadow(selectedComponent.id, shadow.id, { spread: v[0] })
                    }
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={shadow.color.includes('rgba') ? '#000000' : shadow.color}
                      onChange={(e) =>
                        updateShadow(selectedComponent.id, shadow.id, { color: e.target.value })
                      }
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      type="text"
                      value={shadow.color}
                      onChange={(e) =>
                        updateShadow(selectedComponent.id, shadow.id, { color: e.target.value })
                      }
                      className="flex-1 text-xs"
                      placeholder="rgba(0,0,0,0.2)"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {shadows.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
            💡 You can add multiple shadows for complex effects
          </div>
        )}
      </div>
    );
  };

  // ========== Gradient Panel ==========
  const GradientPanel = () => {
    const gradient = effects.gradient || null;
    const [isEnabled, setIsEnabled] = useState(!!gradient);

    const handleToggleGradient = (enabled: boolean) => {
      setIsEnabled(enabled);
      if (enabled && !gradient) {
        setGradient(selectedComponent.id, {
          id: `gradient_${Date.now()}`,
          enabled: true,
          type: 'linear',
          angle: 135,
          stops: [
            { position: 0, color: '#6366F1' },
            { position: 100, color: '#8B5CF6' },
          ],
        });
      } else if (!enabled) {
        setGradient(selectedComponent.id, { ...gradient, enabled: false });
      }
    };

    const handleUpdateGradient = (updates: any) => {
      setGradient(selectedComponent.id, { ...gradient, ...updates });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Gradient Fill</Label>
          <Switch checked={isEnabled} onCheckedChange={handleToggleGradient} />
        </div>

        {isEnabled && gradient && (
          <>
            {/* Gradient Type */}
            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <ToggleGroup
                type="single"
                value={gradient.type}
                onValueChange={(value) => handleUpdateGradient({ type: value })}
                className="grid grid-cols-3 gap-2"
              >
                <ToggleGroupItem value="linear" className="text-xs">
                  Linear
                </ToggleGroupItem>
                <ToggleGroupItem value="radial" className="text-xs">
                  Radial
                </ToggleGroupItem>
                <ToggleGroupItem value="angular" className="text-xs">
                  Angular
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Angle (for linear/angular) */}
            {(gradient.type === 'linear' || gradient.type === 'angular') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Angle</Label>
                  <span className="text-xs text-gray-500">{gradient.angle}°</span>
                </div>
                <Slider
                  value={[gradient.angle]}
                  onValueChange={(v) => handleUpdateGradient({ angle: v[0] })}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>
            )}

            {/* Color Stops */}
            <div className="space-y-2">
              <Label className="text-xs">Color Stops</Label>
              {gradient.stops.map((stop: any, index: number) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={stop.color}
                    onChange={(e) => {
                      const newStops = [...gradient.stops];
                      newStops[index] = { ...stop, color: e.target.value };
                      handleUpdateGradient({ stops: newStops });
                    }}
                    className="w-12 h-8 p-1"
                  />
                  <div className="flex-1">
                    <Slider
                      value={[stop.position]}
                      onValueChange={(v) => {
                        const newStops = [...gradient.stops];
                        newStops[index] = { ...stop, position: v[0] };
                        handleUpdateGradient({ stops: newStops });
                      }}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10">{stop.position}%</span>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label className="text-xs">Preview</Label>
              <div
                className="h-16 rounded-lg border"
                style={{
                  background:
                    gradient.type === 'linear'
                      ? `linear-gradient(${gradient.angle}deg, ${gradient.stops.map((s: any) => `${s.color} ${s.position}%`).join(', ')})`
                      : gradient.type === 'radial'
                        ? `radial-gradient(circle, ${gradient.stops.map((s: any) => `${s.color} ${s.position}%`).join(', ')})`
                        : `conic-gradient(from ${gradient.angle}deg, ${gradient.stops.map((s: any) => `${s.color} ${s.position}%`).join(', ')})`,
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  // ========== Blur & Opacity Panel ==========
  const BlurOpacityPanel = () => {
    const blur = effects.blur || { enabled: false, amount: 0, type: 'layer' };
    const opacity = effects.opacity !== undefined ? effects.opacity : 100;

    return (
      <div className="space-y-6">
        {/* Blur */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Blur</Label>
            <Switch
              checked={blur.enabled}
              onCheckedChange={(enabled) =>
                setBlur(selectedComponent.id, { ...blur, enabled })
              }
            />
          </div>

          {blur.enabled && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <ToggleGroup
                  type="single"
                  value={blur.type}
                  onValueChange={(value) =>
                    setBlur(selectedComponent.id, { ...blur, type: value as any })
                  }
                  className="grid grid-cols-2 gap-2"
                >
                  <ToggleGroupItem value="layer" className="text-xs">
                    Layer Blur
                  </ToggleGroupItem>
                  <ToggleGroupItem value="background" className="text-xs">
                    Background
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Amount</Label>
                  <span className="text-xs text-gray-500">{blur.amount}px</span>
                </div>
                <Slider
                  value={[blur.amount]}
                  onValueChange={(v) =>
                    setBlur(selectedComponent.id, { ...blur, amount: v[0] })
                  }
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Opacity */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Opacity</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Transparency</span>
              <span className="text-xs text-gray-500">{opacity}%</span>
            </div>
            <Slider
              value={[opacity]}
              onValueChange={(v) => setOpacity(selectedComponent.id, v[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>
      </div>
    );
  };

  // ========== Filters Panel ==========
  const FiltersPanel = () => {
    const style = selectedComponent.style || {};
    const filters = (style.filter as any) || {};

    const updateFilter = (key: string, value: number) => {
      const newFilters = { ...filters, [key]: value };
      updateComponent(selectedComponent.id, {
        style: { ...style, filter: newFilters }
      });
    };

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700 mb-4">
          💡 Filters apply to the element and its content.
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Brightness</Label>
              <span className="text-xs text-gray-400">{filters.brightness ?? 100}%</span>
            </div>
            <Slider value={[filters.brightness ?? 100]} onValueChange={(v) => updateFilter('brightness', v[0])} min={0} max={200} step={5} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Contrast</Label>
              <span className="text-xs text-gray-400">{filters.contrast ?? 100}%</span>
            </div>
            <Slider value={[filters.contrast ?? 100]} onValueChange={(v) => updateFilter('contrast', v[0])} min={0} max={200} step={5} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Grayscale</Label>
              <span className="text-xs text-gray-400">{filters.grayscale ?? 0}%</span>
            </div>
            <Slider value={[filters.grayscale ?? 0]} onValueChange={(v) => updateFilter('grayscale', v[0])} min={0} max={100} step={1} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Saturation</Label>
              <span className="text-xs text-gray-400">{filters.saturate ?? 100}%</span>
            </div>
            <Slider value={[filters.saturate ?? 100]} onValueChange={(v) => updateFilter('saturate', v[0])} min={0} max={200} step={5} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Sepia</Label>
              <span className="text-xs text-gray-400">{filters.sepia ?? 0}%</span>
            </div>
            <Slider value={[filters.sepia ?? 0]} onValueChange={(v) => updateFilter('sepia', v[0])} min={0} max={100} step={1} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <Tabs defaultValue="shadow" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="shadow" className="text-xs">
            <Droplet className="h-3 w-3 mr-1" />
            Shadow
          </TabsTrigger>
          <TabsTrigger value="filters" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="filters" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="gradient" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Gradient
          </TabsTrigger>
          <TabsTrigger value="blur" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Blur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shadow" className="mt-4">
          <ShadowPanel />
        </TabsContent>

        <TabsContent value="gradient" className="mt-4">
          <GradientPanel />
        </TabsContent>

        <TabsContent value="blur" className="mt-4">
          <BlurOpacityPanel />
        </TabsContent>

        <TabsContent value="filters" className="mt-4">
          <FiltersPanel />
        </TabsContent>
        <TabsContent value="blur" className="mt-4">
          <BlurOpacityPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
