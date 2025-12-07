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
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
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

type Step = 'targeting' | 'goals' | 'design';

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
    applyTemplate
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
      // Don't reload if it's already the current campaign
      if (currentCampaign?.id === campaignId) return;
      loadCampaign(campaignId);
    }
  }, [searchParams, loadCampaign, currentCampaign?.id]);

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
        if (currentCampaign) {
          resetCurrentCampaign();
        }
        setActiveStep('design');
      }
      else {
        if (!currentCampaign || currentCampaign.nudgeType !== nudgeType) {
          createCampaign(experienceType as any, nudgeType as any);
          setActiveStep('design');
        }
      }
    }
  }, [searchParams, createCampaign, resetCurrentCampaign, currentCampaign?.nudgeType]);

  const handleSave = async () => {
    if (!currentCampaign) return;
    try {
      await saveCampaign();
      toast.success('Campaign saved successfully');
    } catch (error) {
      toast.error('Failed to save campaign');
    }
  };

  const handleLaunch = async () => {
    if (!currentCampaign) return;
    try {
      updateStatus('active');
      await saveCampaign();
      toast.success('Campaign launched successfully!');
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

  const steps = [
    { id: 'targeting', label: 'Targeting', icon: Target },
    { id: 'goals', label: 'Goals & Rollout', icon: Flag },
    { id: 'design', label: 'Design', icon: Palette },
  ];

  // In Template Mode, show only the editor (fullscreen)
  if (editorMode === 'template') {
    return <DesignStep />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold">Campaign Builder</span>
        </div>

        <div className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id as Step)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {step.label}
                  {isActive && <div className="ml-auto w-1 h-4 bg-primary rounded-full" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t text-xs text-muted-foreground">
          <p>Campaign ID:</p>
          <code className="bg-muted px-1 py-0.5 rounded">{currentCampaign?.id || 'New'}</code>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
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
                      value={currentCampaign?.schedule?.startDate || ''}
                      onChange={(e) => updateSchedule({
                        ...currentCampaign?.schedule,
                        startDate: e.target.value
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="datetime-local"
                      value={currentCampaign?.schedule?.endDate || ''}
                      onChange={(e) => updateSchedule({
                        ...currentCampaign?.schedule,
                        endDate: e.target.value
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Zone</label>
                    <Input
                      type="text"
                      placeholder="e.g. UTC, Asia/Kolkata"
                      value={currentCampaign?.schedule?.timeZone || ''}
                      onChange={(e) => updateSchedule({
                        ...currentCampaign?.schedule,
                        timeZone: e.target.value
                      })}
                    />
                  </div>

                  {currentCampaign?.schedule && (
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

            <Button
              size="sm"
              onClick={handleLaunch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              disabled={isSaving}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Launch
            </Button>
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
              {activeStep === 'design' && <DesignStep />}
            </>
          )}
        </main>
      </div>

      {/* Global Modals for Campaign Builder */}
      <CampaignTemplateGallery
        isOpen={isTemplateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={(template) => {
          applyTemplate(template);
          setTemplateModalOpen(false);
          toast.success(`Applied template: ${template.name}`);
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
    </div>
  );
};

export default CampaignBuilder;
