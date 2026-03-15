import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  Flag,
  Palette,
  Save,
  Rocket,
  CheckCircle2,
  Tag,
  X,
  Copy,
  Calendar,
  Clock,
  Plus,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useEditorStore } from '@/store/useEditorStore';
import { TargetingStep } from '@/components/campaign/targeting/TargetingStep';
import { GoalsRolloutStep } from '@/components/campaign/steps/GoalsRolloutStep';
import { DesignStep } from '@/components/campaign/steps/DesignStep';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import CampaignTemplateGallery from '@/components/campaign/TemplateGallery';
import { SaveTemplateModal } from '@/components/campaign/SaveTemplateModal';

import { StoriesStep } from '@/components/campaign/stories/StoriesStep';
import { StoryEditorWrapper } from '@/components/campaign/stories/StoryEditorWrapper';
import { Film, CheckCircle2 as CheckCircle2Icon } from 'lucide-react';

type Step = 'targeting' | 'goals' | 'design' | 'stories';

const CampaignBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState<Step>('targeting');

  // Local state for tags input
  const [tagInput, setTagInput] = useState('');

  const {
    currentCampaign,
    loadCampaign,
    saveCampaign,
    updateCampaignName,
    isSaving,
    updateStatus,
    createCampaign,
    resetCurrentCampaign,
    updateTags,
    updateSchedule,
    editorMode,
    setEditorMode,
    setTemplateModalOpen,
    setSaveTemplateModalOpen,
    isTemplateModalOpen,
    isSaveTemplateModalOpen,
    applyTemplate,
    validateAndFixCampaign,
    activeStoryId,
    setActiveStory,
  } = useEditorStore();

  // Mode detection: Sync store mode with URL param
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'template') {
      if (editorMode !== 'template') setEditorMode('template');
      setActiveStep('design');
    } else {
      if (editorMode !== 'campaign') setEditorMode('campaign');
    }
  }, [searchParams, editorMode, setEditorMode]);

  // Load campaign on mount
  useEffect(() => {
    const campaignId = searchParams.get('id');
    const mode = searchParams.get('mode');

    // Skip loading if in template mode (DesignStep handles this)
    if (mode === 'template') return;

    if (campaignId) {
      // Don't reload if it's already the current campaign (prevents 500 on unsaved drafts)
      if (currentCampaign?.id === campaignId) return;

      loadCampaign(campaignId);
    }
  }, [searchParams, loadCampaign]);

  // Handle new campaign flow
  useEffect(() => {
    const experienceType = searchParams.get('experience');
    const nudgeType = searchParams.get('nudge');
    const campaignId = searchParams.get('id');
    const mode = searchParams.get('mode');

    // Skip if in template mode
    if (mode === 'template') return;

    // If we are in "Create New" mode
    if (experienceType && !campaignId) {
      if (!nudgeType) {
        // Stories: skip nudge selection, auto-create with fullscreen and go to stories step
        if (experienceType === 'stories') {
          createCampaign('stories' as any, 'fullscreen' as any);
          setActiveStep('stories');
        } else {
          if (currentCampaign) {
            resetCurrentCampaign();
          }
          setActiveStep('design');
        }
      }
      else {
        if (!currentCampaign || currentCampaign.nudgeType !== nudgeType) {
          createCampaign(experienceType as any, nudgeType as any);
          // Auto-navigate to stories step for stories experience
          if (experienceType === 'stories') {
            setActiveStep('stories');
          } else {
            setActiveStep('targeting');
          }
        }
      }
    }
  }, [searchParams, createCampaign, resetCurrentCampaign, currentCampaign?.nudgeType]);

  // Validation Logic
  const validateStep = (stepId: Step): boolean => {
    if (!currentCampaign) return false;

    if (stepId === 'targeting') {
      const { targeting } = currentCampaign;
      if (!targeting || targeting.length === 0) return true; // Empty is valid (all users, app open)

      // Check audience filters (user_properties)
      const userProps = targeting.filter(t => t.type === 'user_property');
      const hasInvalidUserProps = userProps.some(t => {
        if (!t.property) return true;
        // If operator is NOT 'set' or 'not_set', it NEEDS a value
        if (t.operator !== 'set' && t.operator !== 'not_set') {
          return t.value === undefined || t.value === '';
        }
        return false;
      });
      if (hasInvalidUserProps) return false;

      // Check events
      const eventTriggers = targeting.filter(t => t.type === 'event');
      // If there are event triggers, make sure none are empty
      const hasInvalidEvents = eventTriggers.some(t => !t.event);
      if (hasInvalidEvents) return false;

      // Check event property filters within triggers
      const hasInvalidEventProps = eventTriggers.some(t =>
        t.properties?.some(p => {
          if (!p.field) return true;
          if (p.operator !== 'set' && p.operator !== 'not_set') {
            return p.value === undefined || p.value === '';
          }
          return false;
        })
      );
      if (hasInvalidEventProps) return false;

      return true;
    }

    if (stepId === 'goals') {
      // Must have a goal event selected and rollout > 0
      if (!currentCampaign.goal?.event) return false;
      const rollout = Number(currentCampaign.goal.rolloutPercentage);
      if (isNaN(rollout) || rollout <= 0) return false;
      return true;
    }

    if (stepId === 'design' || stepId === 'stories') {
      // 1. Stories mode check
      if (currentCampaign.experienceType === 'stories' || (currentCampaign.nudgeType as any) === 'stories') {
        return !!currentCampaign.stories && currentCampaign.stories.length > 0;
      }

      // 2. Interfaces mode check (new structure)
      if (currentCampaign.interfaces && currentCampaign.interfaces.length > 0) {
        // At least one interface must have meaningful content
        return currentCampaign.interfaces.some((intf: any) => {
           if (!intf.layers || intf.layers.length === 0) return false;
           return intf.layers.length > 1 || (intf.layers.length === 1 && intf.layers[0].type === 'custom_html');
        });
      }

      // 3. Legacy flat layers check
      if (!currentCampaign.layers || currentCampaign.layers.length === 0) return false;
      const hasMeaningfulContent = currentCampaign.layers.length > 1 ||
        (currentCampaign.layers.length === 1 && currentCampaign.layers[0].type === 'custom_html');

      return hasMeaningfulContent;
    }

    return false;
  };

  const isTargetingValid = validateStep('targeting');
  const isGoalsValid = validateStep('goals');
  const isDesignValid = validateStep('design');
  const canLaunch = isTargetingValid && isGoalsValid && isDesignValid;

  // Handle Step Navigation (Skippable Unlocking)
  const handleStepClick = (stepId: Step) => {
    setActiveStep(stepId);
  };

  const handleSave = async () => {
    if (!currentCampaign) return;
    try {
      updateStatus('draft'); // Ensure it saves as draft
      await saveCampaign();
      toast.success('Campaign saved as draft');
    } catch (error) {
      toast.error('Failed to save campaign');
    }
  };

  const handleLaunch = async () => {
    if (!currentCampaign) return;

    // Final Validation Check before Launch
    const isStoriesExp = currentCampaign.experienceType === 'stories' || (currentCampaign.nudgeType as any) === 'stories';
    const isDesignOrStoriesValid = validateStep(isStoriesExp ? 'stories' : 'design');

    if (!isTargetingValid) {
      toast.error('Cannot launch: Targeting rules are incomplete.');
      setActiveStep('targeting');
      return;
    }
    if (!isGoalsValid) {
      toast.error('Cannot launch: Please set a Goal event and Rollout %.');
      setActiveStep('goals');
      return;
    }
    if (!isDesignOrStoriesValid) {
      toast.error(isStoriesExp ? 'Cannot launch: Please add at least one Story.' : 'Cannot launch: Design cannot be empty.');
      setActiveStep(isStoriesExp ? 'stories' : 'design');
      return;
    }

    try {
      updateStatus('active');
      await saveCampaign();
      toast.success('Campaign launched successfully!', {
        description: 'Your campaign is now live based on your schedule and targeting rules.'
      });
      setTimeout(() => navigate('/campaigns'), 1500);
    } catch (error) {
      toast.error('Failed to launch campaign');
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !currentCampaign) return;
    const newTags = [...(currentCampaign.tags || []), tagInput.trim()];
    updateTags(newTags);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!currentCampaign) return;
    const newTags = (currentCampaign.tags || []).filter(t => t !== tagToRemove);
    updateTags(newTags);
  };

  const isStories = currentCampaign?.experienceType === 'stories';

  const steps = [
    { id: 'targeting', label: 'Targeting', icon: Target },
    { id: 'goals', label: 'Goals & Rollout', icon: Flag },
    ...(isStories ? [
      { id: 'stories', label: 'Stories', icon: Film },
    ] : [
      { id: 'design', label: 'Design', icon: Palette },
    ]),
  ];

  // In Template Mode, show only the editor (fullscreen)
  if (editorMode === 'template') {
    return <DesignStep />;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <PanelGroup direction="horizontal" style={{ flex: 1 }}>
        {/* Sidebar */}
        <Panel defaultSize={15} minSize={12} maxSize={25} order={1} collapsible={true} style={{ borderRight: '1px solid #e5e7eb', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
          <div className="p-4 border-b flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold">Campaign Builder</span>
          </div>

          <div className="flex-1 py-6 px-3">
            <div className="relative">
              {/* Vertical Connector Line for Stepper */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-100 rounded-full" />

              <nav className="space-y-6 relative z-10">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = activeStep === step.id;

                  // Determine Step State
                  let isCompleted = false;
                  // All steps are unlocked
                  const isLocked = false;

                  if (step.id === 'targeting') {
                    isCompleted = isTargetingValid;
                  } else if (step.id === 'goals') {
                    isCompleted = isTargetingValid && isGoalsValid;
                  } else if (step.id === 'design') {
                    isCompleted = isTargetingValid && isGoalsValid && isDesignValid;
                  }

                  // Currently active or completed steps have primary colored icons
                  const iconBgColor = isActive ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110' :
                    isCompleted ? 'bg-primary text-white' :
                      isLocked ? 'bg-gray-100 text-gray-400 border border-gray-200' :
                        'bg-white text-gray-400 border border-gray-200 shadow-sm';

                  return (
                    <div key={step.id} className="relative group">
                      <button
                        onClick={() => handleStepClick(step.id as Step)}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-4 text-left p-2 rounded-xl transition-all duration-300 ${isActive
                          ? 'bg-primary/5 ring-1 ring-primary/20'
                          : isLocked
                            ? 'opacity-60 cursor-not-allowed'
                            : 'hover:bg-gray-50'
                          }`}
                      >
                        {/* Status Icon Wrapper */}
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 z-10 shrink-0 ${iconBgColor}`}>
                          {isLocked ? (
                            <Lock className="w-4 h-4" />
                          ) : isCompleted && !isActive ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}

                          {/* Active pulse effect */}
                          {isActive && (
                            <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                          )}
                        </div>

                        {/* Label & Description */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate transition-colors ${isActive ? 'text-primary' : isLocked ? 'text-gray-400' : 'text-gray-700 group-hover:text-gray-900'
                            }`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5 max-w-[140px]">
                            {step.id === 'targeting' && (isCompleted ? "Audience set" : "Define audience")}
                            {step.id === 'goals' && (isCompleted ? "Goal configured" : "Set success metrics")}
                            {step.id === 'stories' && (isCompleted ? "Stories ready" : "Manage stories")}
                            {step.id === 'design' && (isCompleted ? "Design ready" : "Create experience")}
                          </p>
                        </div>

                        {/* Right Arrow indicating navigation */}
                        {!isLocked && (
                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-primary translate-x-1' : 'text-gray-300 group-hover:text-gray-500'}`} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-4 border-t text-xs text-muted-foreground">
            <p>Campaign ID:</p>
            <code className="bg-muted px-1 py-0.5 rounded">{currentCampaign?.id || 'New'}</code>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 focus:outline-none transition-colors hover:bg-indigo-500/50 bg-transparent flex items-center justify-center -ml-0.5 z-50" />

        {/* Main Content */}
        <Panel order={2} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Unified Header */}
          <header className="h-16 border-b bg-card px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Input
                value={currentCampaign?.name || ''}
                onChange={(e) => updateCampaignName(e.target.value)}
                className="max-w-md font-semibold text-lg border-transparent hover:border-input focus:border-input transition-colors px-2"
                placeholder="Untitled Campaign"
              />

              {/* Tags Section */}
              <div className="flex items-center gap-2 overflow-hidden">
                {currentCampaign?.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 whitespace-nowrap">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <Plus size={14} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button size="sm" onClick={handleAddTag}>Add</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Templates Button */}
              <Button variant="outline" size="sm" onClick={() => setTemplateModalOpen(true)}>
                <Palette className="w-4 h-4 mr-2" />
                Templates
              </Button>

              {/* Save as Template */}
              <Button variant="outline" size="sm" onClick={() => setSaveTemplateModalOpen(true)}>
                <Copy className="w-4 h-4 mr-2" />
                Save as Template
              </Button>

              {/* Schedule Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={currentCampaign?.schedule?.startDate ? "secondary" : "outline"} size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {currentCampaign?.schedule?.startDate ? 'Scheduled' : 'Schedule'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium leading-none">Campaign Schedule</h4>
                    <p className="text-sm text-muted-foreground">
                      Set when this campaign should be active.
                    </p>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="datetime-local"
                        min={new Date().toISOString().slice(0, 16)}
                        value={currentCampaign?.schedule?.startDate || ''}
                        onChange={(e) => {
                          const newStartDate = e.target.value;
                          const endDate = currentCampaign?.schedule?.endDate;

                          // If end date exists and is before new start date, clear it
                          if (endDate && newStartDate && new Date(endDate) < new Date(newStartDate)) {
                            updateSchedule({
                              ...currentCampaign?.schedule,
                              startDate: newStartDate,
                              endDate: '' // Clear invalid end date
                            });
                            toast.warning('End date was cleared because it was before the new start date');
                          } else {
                            updateSchedule({
                              ...currentCampaign?.schedule,
                              startDate: newStartDate
                            });
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">Campaign starts at this date/time</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="datetime-local"
                        min={currentCampaign?.schedule?.startDate || new Date().toISOString().slice(0, 16)}
                        value={currentCampaign?.schedule?.endDate || ''}
                        onChange={(e) => {
                          const newEndDate = e.target.value;
                          const startDate = currentCampaign?.schedule?.startDate;

                          // Validate end date is after start date
                          if (startDate && newEndDate && new Date(newEndDate) <= new Date(startDate)) {
                            toast.error('End date must be after the start date');
                            return;
                          }

                          updateSchedule({
                            ...currentCampaign?.schedule,
                            endDate: newEndDate
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">Campaign ends at this date/time (optional)</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Time Zone</label>
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={() => {
                            const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                            updateSchedule({
                              ...currentCampaign?.schedule,
                              timeZone: detectedTz
                            });
                            toast.success(`Timezone set to ${detectedTz}`);
                          }}
                        >
                          Detect my timezone
                        </button>
                      </div>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={currentCampaign?.schedule?.timeZone || ''}
                        onChange={(e) => updateSchedule({
                          ...currentCampaign?.schedule,
                          timeZone: e.target.value
                        })}
                      >
                        <option value="">Select timezone...</option>
                        <optgroup label="Common">
                          <option value="UTC">UTC (Coordinated Universal Time)</option>
                          <option value="America/New_York">Eastern Time (US & Canada)</option>
                          <option value="America/Chicago">Central Time (US & Canada)</option>
                          <option value="America/Denver">Mountain Time (US & Canada)</option>
                          <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                          <option value="Europe/London">London (GMT/BST)</option>
                          <option value="Europe/Paris">Paris (CET/CEST)</option>
                          <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                        </optgroup>
                        <optgroup label="Asia">
                          <option value="Asia/Kolkata">India (IST)</option>
                          <option value="Asia/Dubai">Dubai (GST)</option>
                          <option value="Asia/Singapore">Singapore (SGT)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                          <option value="Asia/Shanghai">China (CST)</option>
                          <option value="Asia/Hong_Kong">Hong Kong (HKT)</option>
                          <option value="Asia/Seoul">Seoul (KST)</option>
                          <option value="Asia/Bangkok">Bangkok (ICT)</option>
                          <option value="Asia/Jakarta">Jakarta (WIB)</option>
                        </optgroup>
                        <optgroup label="Pacific">
                          <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                          <option value="Australia/Melbourne">Melbourne (AEST/AEDT)</option>
                          <option value="Pacific/Auckland">Auckland (NZST/NZDT)</option>
                        </optgroup>
                        <optgroup label="Americas">
                          <option value="America/Toronto">Toronto (EST/EDT)</option>
                          <option value="America/Vancouver">Vancouver (PST/PDT)</option>
                          <option value="America/Mexico_City">Mexico City (CST/CDT)</option>
                          <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                          <option value="America/Buenos_Aires">Buenos Aires (ART)</option>
                        </optgroup>
                        <optgroup label="Europe">
                          <option value="Europe/Madrid">Madrid (CET/CEST)</option>
                          <option value="Europe/Rome">Rome (CET/CEST)</option>
                          <option value="Europe/Amsterdam">Amsterdam (CET/CEST)</option>
                          <option value="Europe/Moscow">Moscow (MSK)</option>
                          <option value="Europe/Istanbul">Istanbul (TRT)</option>
                        </optgroup>
                        <optgroup label="Middle East & Africa">
                          <option value="Africa/Cairo">Cairo (EET)</option>
                          <option value="Africa/Johannesburg">Johannesburg (SAST)</option>
                          <option value="Asia/Jerusalem">Jerusalem (IST)</option>
                          <option value="Asia/Riyadh">Riyadh (AST)</option>
                        </optgroup>
                      </select>
                    </div>

                    {currentCampaign?.schedule && (currentCampaign?.schedule?.startDate || currentCampaign?.schedule?.endDate) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => updateSchedule(undefined as any)}
                      >
                        Clear Schedule
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="h-6 w-px bg-border mx-1" />

              <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-block cursor-not-allowed">
                      <Button
                        size="sm"
                        onClick={handleLaunch}
                        className={`shadow-sm transition-all duration-300 relative overflow-hidden ${canLaunch
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/25 hover:shadow-lg'
                          : 'bg-gray-100 text-gray-400 border-gray-200 pointer-events-none'
                          }`}
                        disabled={isSaving || !canLaunch}
                      >
                        {/* Shimmer effect for enabled button */}
                        {canLaunch && (
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        )}
                        <Rocket className={`w-4 h-4 mr-2 ${canLaunch ? 'animate-bounce-subtle' : ''}`} />
                        Launch
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canLaunch && (
                    <TooltipContent side="bottom" align="end" className="text-sm">
                      <p className="font-semibold mb-1">Cannot launch yet:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-xs text-muted-foreground">
                        {!isTargetingValid && <li>Complete Targeting step</li>}
                        {!isGoalsValid && <li>Set a Goal Event and Rollout</li>}
                        {!isDesignValid && <li>Create a Design</li>}
                      </ul>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </header>

          {/* Step Content */}
          <main className="flex-1 overflow-hidden relative">
            {!currentCampaign && !searchParams.get('experience') && !searchParams.get('mode') ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">No Campaign Loaded</h3>
                  <p className="text-muted-foreground">Please select a campaign or create a new one.</p>
                </div>
                <Button onClick={() => navigate('/campaigns')}>
                  Go to Campaigns
                </Button>
              </div>
            ) : (
              <>
                {activeStep === 'targeting' && <TargetingStep />}
                {activeStep === 'goals' && <GoalsRolloutStep />}
                {activeStep === 'stories' && (
                  activeStoryId ? (
                    <StoryEditorWrapper />
                  ) : (
                    <StoriesStep />
                  )
                )}
                {activeStep === 'design' && <DesignStep />}
              </>
            )}
          </main>
        </Panel>
      </PanelGroup>
      {/* Global Modals for Campaign Builder */}
      <CampaignTemplateGallery
        isOpen={isTemplateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={async (template) => {
          try {
            // FIX: Fetch full template details AND transform to editor format
            const api = await import('@/lib/api');
            const transformers = await import('@/lib/campaignTransformers');

            const rawTemplate = await api.apiClient.getTemplate(template._id || (template as any).id);
            const fullTemplate = transformers.backendToEditor(rawTemplate);

            applyTemplate(fullTemplate);
            setTemplateModalOpen(false);
            toast.success(`Applied template: ${template.name}`);
          } catch (error) {
            console.error('Failed to apply template:', error);
            toast.error('Failed to load template details');
          }
        }}
        onStartBlank={() => {
          setTemplateModalOpen(false);
          // Already blank or handled by reset
        }}
        nudgeType={currentCampaign?.nudgeType}
      />
      <SaveTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setSaveTemplateModalOpen(false)}
      />
    </div >
  );
};

export default CampaignBuilder;
