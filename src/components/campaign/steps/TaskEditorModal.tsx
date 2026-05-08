import React, { useState, useEffect } from 'react';
import { X, Settings, CheckCircle2, Gift, Plus, Loader2, Trash2, Users, Sparkles, Coins, Ticket, FileBadge2, Bell, ExternalLink, PanelBottom, Maximize2, MousePointerClick } from 'lucide-react';
import { theme } from '@/styles/design-tokens';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChallengeTask, ChallengeTaskLogic, ChallengeTaskReward } from '@/store/useStore';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventDefinition } from '@/services/metadataService';
import { useEditorStore } from '@/store/useEditorStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskEditorModalProps {
  task: ChallengeTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ChallengeTask) => void;
  availableEvents: EventDefinition[];
  isLoadingMetadata: boolean;
  availableRewards: { id: string; name: string; type: string; iconUrl?: string; description?: string; }[];
  onNavigateToDesign?: (interfaceId: string) => void;
  initialTab?: Tab;
}

type Tab = 'details' | 'logic' | 'reward' | 'nudge';

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  availableEvents,
  isLoadingMetadata,
  onNavigateToDesign,
  availableRewards,
  initialTab = 'details',
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [draft, setDraft] = useState<ChallengeTask | null>(null);

  const { availableProperties } = useEditorStore();

  useEffect(() => {
    if (task && isOpen) {
      const cloned = JSON.parse(JSON.stringify(task)); // Deep copy
      
      // LOGICAL MIGRATION: Convert old flat rewards array to the new Nested Operator matrix
      if (cloned.reward && cloned.reward.rewardGroups && cloned.reward.rewardGroups.length > 0) {
         if (cloned.reward.rewardGroups[0].rewardItemId !== undefined) {
            // It's a legacy flat array. Convert it to a single AND group safely
            cloned.reward.rewardGroups = [{
               operator: 'AND',
               rewards: [...cloned.reward.rewardGroups]
            }];
         }
      } else if (!cloned.reward || !cloned.reward.rewardGroups || cloned.reward.rewardGroups.length === 0) {
         // Default structured payload
         if (!cloned.reward) cloned.reward = { rewardGroups: [] };
         cloned.reward.rewardGroups = [{ operator: 'AND', rewards: [] }];
      }

      setDraft(cloned);
      setActiveTab('details');
    }
  }, [task, isOpen]);

  if (!isOpen || !draft) return null;

  const updateDraft = (updates: Partial<ChallengeTask>) => {
    setDraft({ ...draft, ...updates });
  };

  const validateDraft = (): string | null => {
    if (!draft.title || !draft.title.trim()) return "Task title is required.";

    if (draft.logic.eventGroups.length === 0) return "At least one event condition is required.";

    for (let gIdx = 0; gIdx < draft.logic.eventGroups.length; gIdx++) {
      const group = draft.logic.eventGroups[gIdx];
      if (group.events.length === 0) return `Event group ${gIdx + 1} has no events.`;
      
      for (let eIdx = 0; eIdx < group.events.length; eIdx++) {
        const ev = group.events[eIdx];
        if (!ev.eventId) return `Please select an event for Event ${eIdx + 1} in Group ${gIdx + 1}.`;
        
        if (!ev.count || ev.count < 1) return `Event '${ev.eventId}' must happen at least 1 time.`;

        if (ev.filters) {
          for (const f of ev.filters) {
            if (!f.field) return `A property filter is missing a selected property under '${ev.eventId}'.`;
            if (f.operator !== 'set' && f.operator !== 'not_set' && (!f.value || String(f.value).trim() === '')) {
              return `Value cannot be empty for property filter '${f.field}' under '${ev.eventId}'.`;
            }
          }
        }
      }
    }

    if (draft.logic.userFilters) {
      for (const uf of draft.logic.userFilters) {
        if (!uf.property) return "A user trigger condition is missing a selected property.";
        if (uf.operator !== 'set' && uf.operator !== 'not_set' && (!uf.value || String(uf.value).trim() === '')) {
          return `Value cannot be empty for user condition '${uf.property}'.`;
        }
      }
    }
    
    if (draft.logic.limits?.completionLimit !== undefined) {
      if (draft.logic.limits.completionLimit < 1) {
        return "Completion limit must be at least 1.";
      }
    }

    for (let gIdx = 0; gIdx < draft.reward.rewardGroups.length; gIdx++) {
      const group = draft.reward.rewardGroups[gIdx];
      const rewards = group.rewards || [];
      if (rewards.length === 0) return `Please add at least one reward item in Reward Group ${gIdx + 1}.`;
      
      for (let rIdx = 0; rIdx < rewards.length; rIdx++) {
        const rg = rewards[rIdx];
        if (!rg.rewardItemId) return `Please select a reward item for Reward ${rIdx + 1} in Group ${gIdx + 1}.`;
        if (!rg.allowVariable && (!rg.amount || rg.amount < 1)) return `Reward amount must be at least 1 for Reward ${rIdx + 1} in Group ${gIdx + 1}.`;

        if (rg.allowVariable && (!rg.variableConfig?.type || rg.variableConfig.type === 'random')) {
          const min = rg.variableConfig?.minAmount;
          const max = rg.variableConfig?.maxAmount;
          
          if (!min || min < 1) return `Please define a valid Min Amount (>= 1) for Variable Reward ${rIdx + 1} in Group ${gIdx + 1}.`;
          if (!max || max < 1) return `Please define a valid Max Amount (>= 1) for Variable Reward ${rIdx + 1} in Group ${gIdx + 1}.`;
          if (min >= max) return `Max amount must be strictly greater than Min amount in Variable Reward ${rIdx + 1} in Group ${gIdx + 1}.`;
        }

        if (rg.allowVariable && rg.variableConfig?.type === 'conditional') {
          const conditions = rg.variableConfig.conditions || [];
          if (conditions.length === 0) return `Please add at least one conditional rule for Variable Reward ${rIdx + 1} in Group ${gIdx + 1}.`;
          
          for (let i = 0; i < conditions.length; i++) {
            const c = conditions[i];
            if (!c.userProperty) return `Rule ${i + 1} in Reward ${rIdx + 1}, Group ${gIdx + 1} is missing a property.`;
            if (!c.operator) return `Rule ${i + 1} in Reward ${rIdx + 1}, Group ${gIdx + 1} is missing an operator.`;
            if (c.operator !== 'set' && c.operator !== 'not_set' && (!c.value || String(c.value).trim() === '')) {
               return `Rule ${i + 1} in Reward ${rIdx + 1}, Group ${gIdx + 1} needs a valid comparison value.`;
            }
            if (!c.payoutAmount || c.payoutAmount < 1) return `Rule ${i + 1} in Reward ${rIdx + 1}, Group ${gIdx + 1} needs a payout amount (>= 1).`;
          }

          if (!rg.variableConfig.fallbackAmount || rg.variableConfig.fallbackAmount < 1) {
            return `Please define a valid Fallback Payout (>= 1) for conditional rules in Reward ${rIdx + 1}, Group ${gIdx + 1}.`;
          }
        }
      }
    }

    return null;
  };

  const handleSaveAndClose = () => {
    const error = validateDraft();
    if (error) {
      toast.error(error);
      return;
    }

    if (onSave) {
      onSave(draft);
    }
    onClose();
  };

  // --- DETAILS TAB RENDER ---
  const renderDetailsTab = () => (
    <div className="p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Task Properties</h3>
        <p className="text-sm text-gray-500">Set up your task properties</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <Input
            value={draft.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            placeholder="Enter Your title"
            className="w-full bg-white border-gray-200"
          />
        </div>
      </div>
    </div>
  );

  // --- LOGIC TAB RENDER ---
  const renderLogicTab = () => {
    const updateLogic = (updates: Partial<ChallengeTaskLogic>) => {
      updateDraft({ logic: { ...draft.logic, ...updates } });
    };

    return (
      <div className="p-8 space-y-10">

        {/* Section 1: Event Trigger Conditions */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Event Trigger conditions</h3>
            <p className="text-sm text-gray-500">Add event based conditions for the task. Think of what must the user do in order to complete the task</p>
          </div>

          <div className="space-y-4">
            {draft.logic.eventGroups.map((group, gIdx) => (
              <div key={gIdx} className="bg-gray-50/50 border border-gray-100 rounded-xl p-6 relative">

                {/* Operator Selector for Group */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                   <div className="flex items-center gap-3 w-max">
                     <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Task Constraint:</span>
                     <Select
                         value={group.operator || 'AND'}
                         onValueChange={(val: any) => {
                           const newGroups = [...draft.logic.eventGroups];
                           newGroups[gIdx].operator = val;
                           updateLogic({ eventGroups: newGroups });
                         }}
                       >
                         <SelectTrigger className="w-[300px] h-9 text-sm font-medium bg-white shadow-sm border-gray-200 focus:ring-primary/20">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="AND">
                             <div className="flex items-center gap-2">
                               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                               <span>User must complete ALL of these events (AND)</span>
                             </div>
                           </SelectItem>
                           <SelectItem value="OR">
                             <div className="flex items-center gap-2">
                               <Sparkles className="w-4 h-4 text-purple-500" />
                               <span>User may complete ANY of these events (OR)</span>
                             </div>
                           </SelectItem>
                         </SelectContent>
                     </Select>
                   </div>

                   {/* Delete Entire Group */}
                   {draft.logic.eventGroups.length > 1 && (
                     <button
                       className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors ml-4"
                       onClick={() => {
                         const newGroups = draft.logic.eventGroups.filter((_, idx) => idx !== gIdx);
                         updateLogic({ eventGroups: newGroups });
                       }}
                       title="Delete Event Group"
                     >
                       <X size={16} />
                     </button>
                   )}
                </div>

                {group.events.map((ev, eIdx) => (
                  <div key={eIdx} className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">When user does</span>

                      <Select
                        value={ev.eventId || "select"}
                        onValueChange={(val) => {
                          const newGroups = [...draft.logic.eventGroups];
                          newGroups[gIdx].events[eIdx].eventId = val === "select" ? "" : val;
                          updateLogic({ eventGroups: newGroups });
                        }}
                      >
                        <SelectTrigger className="w-[200px] h-9 text-sm">
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingMetadata ? (
                            <div className="p-2 text-xs text-center text-muted-foreground">Loading events...</div>
                          ) : (
                            <>
                              <SelectItem value="select">Select event</SelectItem>
                              {Array.isArray(availableEvents) && availableEvents.map((event) => (
                                <SelectItem key={event._id || event.name} value={event.name}>
                                  {event.displayName || event.name}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>

                      <Select
                        value={ev.operator || 'gte'}
                        onValueChange={(val: any) => {
                          const newGroups = [...draft.logic.eventGroups];
                          newGroups[gIdx].events[eIdx].operator = val;
                          updateLogic({ eventGroups: newGroups });
                        }}
                      >
                        <SelectTrigger className="w-[200px] h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gte">greater than or equal to (&ge;)</SelectItem>
                          <SelectItem value="eq">exactly (=)</SelectItem>
                          <SelectItem value="lte">less than or equal to (&le;)</SelectItem>
                          <SelectItem value="gt">greater than (&gt;)</SelectItem>
                          <SelectItem value="lt">less than (&lt;)</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        value={ev.count || 1}
                        onChange={(e) => {
                          const newGroups = [...draft.logic.eventGroups];
                          newGroups[gIdx].events[eIdx].count = Number(e.target.value) || 1;
                          updateLogic({ eventGroups: newGroups });
                        }}
                        className="w-16 h-9"
                        min={1}
                      />

                      <span className="text-sm text-gray-500">time(s)</span>

                      {/* Delete Event from Group (Keep at least one) */}
                      {group.events.length > 1 && (
                        <button
                          className="text-gray-400 hover:text-red-500 ml-auto"
                          onClick={() => {
                            const newGroups = [...draft.logic.eventGroups];
                            newGroups[gIdx].events.splice(eIdx, 1);
                            updateLogic({ eventGroups: newGroups });
                          }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Filter specific properties for this event */}
                    {ev.filters && ev.filters.length > 0 && (
                      <div className="pl-4 border-l-2 border-gray-100 space-y-2 mt-4 ml-2">
                        {ev.filters.map((prop, pIdx) => (
                          <div key={prop.id || pIdx} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-10">where</span>

                            <Select
                              value={prop.field || 'select'}
                              onValueChange={(val) => {
                                const newGroups = [...draft.logic.eventGroups];
                                newGroups[gIdx].events[eIdx].filters[pIdx].field = val === 'select' ? '' : val;
                                updateLogic({ eventGroups: newGroups });
                              }}
                            >
                              <SelectTrigger className="w-[180px] h-8 text-sm">
                                <SelectValue placeholder="Select property" />
                              </SelectTrigger>
                              <SelectContent>
                                {(() => {
                                  const selectedEventDef = availableEvents?.find(e => e.name === ev.eventId);
                                  const eventProperties = selectedEventDef?.properties || [];

                                  return eventProperties.length > 0 ? (
                                    <>
                                      <SelectItem value="select">Select property</SelectItem>
                                      {eventProperties.map((p: any) => (
                                        <SelectItem key={p._id || p.name} value={p.name}>
                                          {p.displayName || p.name}
                                        </SelectItem>
                                      ))}
                                    </>
                                  ) : (
                                    <div className="p-2 text-xs text-muted-foreground text-center">
                                      No properties defined for this event.
                                    </div>
                                  );
                                })()}
                              </SelectContent>
                            </Select>

                            <Select
                              value={prop.operator || 'equals'}
                              onValueChange={(val) => {
                                const newGroups = [...draft.logic.eventGroups];
                                newGroups[gIdx].events[eIdx].filters[pIdx].operator = val;
                                updateLogic({ eventGroups: newGroups });
                              }}
                            >
                              <SelectTrigger className="w-[120px] h-8 text-sm">
                                <SelectValue placeholder="Operator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">equals</SelectItem>
                                <SelectItem value="not_equals">does not equal</SelectItem>
                                <SelectItem value="contains">contains</SelectItem>
                                <SelectItem value="greater_than">greater than</SelectItem>
                                <SelectItem value="less_than">less than</SelectItem>
                                <SelectItem value="greater_than_or_equal">at least (&ge;)</SelectItem>
                                <SelectItem value="less_than_or_equal">at most (&le;)</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              className="w-[150px] h-8 text-sm"
                              placeholder="Value"
                              value={String(prop.value || '')}
                              onChange={(e) => {
                                const newGroups = [...draft.logic.eventGroups];
                                newGroups[gIdx].events[eIdx].filters[pIdx].value = e.target.value;
                                updateLogic({ eventGroups: newGroups });
                              }}
                            />

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-lg"
                              onClick={() => {
                                const newGroups = [...draft.logic.eventGroups];
                                newGroups[gIdx].events[eIdx].filters.splice(pIdx, 1);
                                updateLogic({ eventGroups: newGroups });
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pl-[80px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-sm text-primary hover:text-primary/90 hover:bg-primary/5 px-2 -ml-2"
                        onClick={() => {
                          const newGroups = [...draft.logic.eventGroups];
                          if (!newGroups[gIdx].events[eIdx].filters) {
                            newGroups[gIdx].events[eIdx].filters = [];
                          }
                          newGroups[gIdx].events[eIdx].filters.push({
                            id: Math.random().toString(36).substr(2, 9),
                            field: '',
                            operator: 'equals',
                            value: ''
                          });
                          updateLogic({ eventGroups: newGroups });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Filter
                      </Button>
                    </div>

                  </div>
                ))}

                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/90 hover:bg-primary/5"
                    onClick={() => {
                      const newGroups = [...draft.logic.eventGroups];
                      newGroups[gIdx].events.push({ eventId: '', operator: 'gte', count: 1, filters: [] });
                      updateLogic({ eventGroups: newGroups });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Event
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/90 hover:bg-primary/5"
                onClick={() => {
                  const newGroups = [...draft.logic.eventGroups];
                  newGroups.push({ operator: 'AND', events: [{ eventId: '', operator: 'gte', count: 1, filters: [] }] });
                  updateLogic({ eventGroups: newGroups });
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Event Group
              </Button>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Section 2: User Trigger Conditions */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Trigger conditions</h3>
            <p className="text-sm text-gray-500">Add user based conditions for the task. Think of what must the user do in order to complete the task</p>
          </div>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm text-gray-700">All Users</span>
            </div>

            {(!draft.logic.userFilters || draft.logic.userFilters.length === 0) ? (
              <div className="text-sm text-muted-foreground pl-6">
                Task will be available to all users. Add filters to target specific segments.
              </div>
            ) : (
              <div className="space-y-3 pl-6 border-l-2 border-gray-200 ml-2">
                {draft.logic.userFilters.map((rule, index) => (
                  <div key={rule.id || index} className="flex items-center gap-3">
                    {index > 0 && (
                      <span className="text-xs font-bold text-muted-foreground bg-gray-200 px-2 py-1 rounded">AND</span>
                    )}

                    <div className="flex-1 flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                      <span className="text-sm text-muted-foreground px-2">where</span>

                      {/* Property Selector */}
                      <Select
                        value={rule.property || 'select'}
                        onValueChange={(val) => {
                          const newF = [...draft.logic.userFilters!];
                          newF[index].property = val === 'select' ? '' : val;
                          updateLogic({ userFilters: newF, userTrigger: 'segment' });
                        }}
                      >
                        <SelectTrigger className="w-[180px] h-8 text-sm">
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select">Select property</SelectItem>
                          {(() => {
                            const eventPropertyIds = new Set(
                              availableEvents?.flatMap(e =>
                                e.properties?.map((p: any) => p._id || p.id) || []
                              ) || []
                            );
                            const userProperties = availableProperties?.filter((p: any) =>
                              !eventPropertyIds.has(p._id || p.id)
                            ) || [];

                            return userProperties.map((prop: any) => (
                              <SelectItem key={prop.id || prop._id} value={prop.name}>
                                {prop.displayName || prop.name}
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>

                      {/* Operator Selector */}
                      <Select
                        value={rule.operator || 'equals'}
                        onValueChange={(val) => {
                          const newF = [...draft.logic.userFilters!];
                          newF[index].operator = val;
                          updateLogic({ userFilters: newF, userTrigger: 'segment' });
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-sm">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">equal to</SelectItem>
                          <SelectItem value="not_equals">not equal to</SelectItem>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="greater_than">greater than</SelectItem>
                          <SelectItem value="less_than">less than</SelectItem>
                          <SelectItem value="greater_than_or_equal">at least (&ge;)</SelectItem>
                          <SelectItem value="less_than_or_equal">at most (&le;)</SelectItem>
                          <SelectItem value="set">is set</SelectItem>
                          <SelectItem value="not_set">is not set</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Value Input */}
                      {rule.operator !== 'set' && rule.operator !== 'not_set' && (
                        <Input
                          className="w-[150px] h-8 text-sm"
                          placeholder="Value"
                          value={String(rule.value || '')}
                          onChange={(e) => {
                            const newF = [...draft.logic.userFilters!];
                            newF[index].value = e.target.value;
                            updateLogic({ userFilters: newF, userTrigger: 'segment' });
                          }}
                        />
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 rounded-lg ml-auto"
                        onClick={() => {
                          const newF = [...draft.logic.userFilters!];
                          newF.splice(index, 1);
                          const nextTrigger = newF.length === 0 ? 'all_users' : 'segment';
                          updateLogic({ userFilters: newF, userTrigger: nextTrigger });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pl-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newF = [...(draft.logic.userFilters || [])];
                  newF.push({ id: Math.random().toString(36).substr(2, 9), property: '', operator: 'equals', value: '' });
                  updateLogic({ userFilters: newF, userTrigger: 'segment' });
                }}
                className="text-primary hover:text-primary/90 h-8"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Filter
              </Button>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Section 3: Task Limits */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Task Limits</h3>
            <p className="text-sm text-gray-500">Control how many times users may begin or finish this task.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">User can attempt the task</span>
              <Select
                value={draft.logic.limits?.attemptFrequency || 'always'}
                onValueChange={(val: any) => updateLogic({ limits: { ...draft.logic.limits, attemptFrequency: val } })}
              >
                <SelectTrigger className="w-[180px] bg-white text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always</SelectItem>
                  <SelectItem value="once">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {draft.logic.limits?.completionLimit !== undefined ? (
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm font-medium text-gray-700">Total completion limit:</span>
                <Input
                  type="number"
                  value={draft.logic.limits.completionLimit}
                  onChange={(e) => updateLogic({ limits: { ...draft.logic.limits, completionLimit: Number(e.target.value) || 1 } })}
                  className="w-20 bg-white h-9"
                  min={1}
                />
                <button
                  className="text-gray-400 hover:text-red-500"
                  onClick={() => updateLogic({ limits: { ...draft.logic.limits, completionLimit: undefined } })}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 mt-2"
                onClick={() => updateLogic({ limits: { ...draft.logic.limits, completionLimit: 1 } })}
              >
                <Plus size={16} /> Add Completion Limit
              </button>
            )}
          </div>
        </section>

      </div>
    );
  };

  // --- REWARD TAB RENDER ---
  const renderRewardTab = () => {
    const updateReward = (updates: Partial<ChallengeTaskReward>) => {
      updateDraft({ reward: { ...draft.reward, ...updates } });
    };

    return (
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Task Rewards</h3>
          <p className="text-sm text-gray-500">Configure the reward for the task you just created</p>
        </div>

        <div className="space-y-6">
          {draft.reward.rewardGroups.map((group, gIdx) => (
            <div key={gIdx} className="border border-gray-100 rounded-xl p-6 relative bg-white shadow-sm">

              {/* Group Operator + Delete */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3 w-max">
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Reward Constraint:</span>
                  <Select
                    value={group.operator || 'AND'}
                    onValueChange={(val: any) => {
                      const newGroups = [...draft.reward.rewardGroups];
                      newGroups[gIdx].operator = val;
                      updateReward({ rewardGroups: newGroups });
                    }}
                  >
                    <SelectTrigger className="w-[320px] h-9 text-sm font-medium bg-white shadow-sm border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>User receives ALL of these rewards (AND)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="OR">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span>User receives ANY ONE of these rewards (OR)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {draft.reward.rewardGroups.length > 1 && (
                  <button
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors ml-4"
                    onClick={() => {
                      const newGroups = draft.reward.rewardGroups.filter((_: any, idx: number) => idx !== gIdx);
                      updateReward({ rewardGroups: newGroups });
                    }}
                    title="Delete Reward Group"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Inner Reward Items */}
              {(group.rewards || []).map((rw, rIdx) => (
                <div key={rIdx} className="mb-4 bg-gray-50/50 p-4 rounded-lg border border-gray-200 relative">

                  {(group.rewards || []).length > 1 && (
                    <button
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                      onClick={() => {
                        const newGroups = [...draft.reward.rewardGroups];
                        newGroups[gIdx].rewards.splice(rIdx, 1);
                        updateReward({ rewardGroups: newGroups });
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}

                  <div className="mb-4 relative z-10 w-full space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1 w-24">
                        <span className="text-sm font-medium text-gray-700">Amount</span>
                        <Input
                          type="number"
                          value={rw.amount || 1}
                          onChange={(e) => {
                            const newGroups = [...draft.reward.rewardGroups];
                            newGroups[gIdx].rewards[rIdx].amount = Number(e.target.value) || 1;
                            updateReward({ rewardGroups: newGroups });
                          }}
                          className="w-full bg-white h-9"
                          min={1}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-400 mt-6 shrink-0">x</span>
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-sm font-medium text-gray-700">Reward Item</span>
                        <Select
                          value={rw.rewardItemId || 'select'}
                          onValueChange={(val) => {
                            const newGroups = [...draft.reward.rewardGroups];
                            newGroups[gIdx].rewards[rIdx].rewardItemId = val === 'select' ? '' : val;
                            if (val !== 'select') {
                              // Inject name for offline SDK rendering
                              const rwObj = availableRewards.find(r => r.id === val);
                              if (rwObj) newGroups[gIdx].rewards[rIdx].name = rwObj.name;
                            }
                            updateReward({ rewardGroups: newGroups });
                          }}
                        >
                          <SelectTrigger className="w-full bg-white h-9">
                            <SelectValue placeholder="Select a reward item" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select">Select a reward item</SelectItem>
                            {availableRewards.map(r => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name} ({r.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {rw.rewardItemId && availableRewards.find(r => r.id === rw.rewardItemId) && (
                      <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                        {(() => {
                          const r = availableRewards.find(r => r.id === rw.rewardItemId)!;
                          let Icon = Gift;
                          if (r.type === 'coupon') Icon = Ticket;
                          else if (r.type === 'points') Icon = Coins;
                          else if (r.type === 'badge') Icon = FileBadge2;
                          else if (r.type === 'feature_unlock') Icon = Sparkles;
                          return (
                            <>
                              <div className="p-2 bg-white rounded shadow-sm border border-gray-100 shrink-0 flex items-center justify-center w-10 h-10">
                                {r.iconUrl ? (
                                  <img src={r.iconUrl} alt={r.name} className="max-w-full max-h-full object-contain" />
                                ) : (
                                  <Icon className="w-5 h-5 text-purple-600" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{r.name}</span>
                                <span className="text-xs text-gray-500 line-clamp-2">{r.description || `A ${r.type} reward module.`}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id={`variable-rewards-${gIdx}-${rIdx}`}
                      checked={rw.allowVariable || false}
                      onCheckedChange={(c) => {
                        const newGroups = [...draft.reward.rewardGroups];
                        newGroups[gIdx].rewards[rIdx].allowVariable = c;
                        updateReward({ rewardGroups: newGroups });
                      }}
                    />
                    <label htmlFor={`variable-rewards-${gIdx}-${rIdx}`} className="text-sm text-gray-700 font-medium flex items-center gap-2 cursor-pointer select-none">
                      Enable variable distribution engine
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild onClick={(e) => e.preventDefault()}>
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold cursor-help border border-gray-200 hover:bg-gray-200 transition-colors">?</span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[280px] p-3 text-xs bg-gray-900 text-gray-50">
                            If enabled, the SDK evaluates variable reward conditions at runtime based on user performance thresholds instead of the fixed fallback amount.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                  </div>

                  {rw.allowVariable && (
                    <div className="mt-4 p-5 border border-purple-100 bg-purple-50/40 rounded-xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-col gap-2 w-full max-w-[280px]">
                        <Label className="text-purple-900 font-semibold">Distribution Logic</Label>
                        <Select
                          value={rw.variableConfig?.type || 'random'}
                          onValueChange={(val: any) => {
                            const newGroups = [...draft.reward.rewardGroups];
                            newGroups[gIdx].rewards[rIdx].variableConfig = { ...newGroups[gIdx].rewards[rIdx].variableConfig, type: val as any };
                            updateReward({ rewardGroups: newGroups });
                          }}
                        >
                          <SelectTrigger className="bg-white border-purple-200 shadow-sm"><SelectValue/></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="random">Random Range Generation</SelectItem>
                            <SelectItem value="conditional">Conditional Tiers (Rules Base)</SelectItem>
                            <SelectItem value="sdk_calculated">SDK Calculated</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] text-gray-500">How should the final payout be calculated?</p>
                      </div>

                      {(!rw.variableConfig?.type || rw.variableConfig.type === 'random') && (
                        <div className="flex gap-6 items-end">
                          <div className="flex flex-col gap-1.5 w-28">
                            <Label className="text-gray-700 font-medium text-xs">Min Amount</Label>
                            <Input
                              type="number" min={1} placeholder="e.g. 10"
                              value={rw.variableConfig?.minAmount || ''}
                              onChange={(e) => {
                                const newGroups = [...draft.reward.rewardGroups];
                                newGroups[gIdx].rewards[rIdx].variableConfig = { ...newGroups[gIdx].rewards[rIdx].variableConfig, type: 'random', minAmount: Number(e.target.value) };
                                updateReward({ rewardGroups: newGroups });
                              }}
                              className="bg-white h-9 shadow-sm"
                            />
                          </div>
                          <span className="text-gray-300 font-bold mb-2">to</span>
                          <div className="flex flex-col gap-1.5 w-28">
                            <Label className="text-gray-700 font-medium text-xs">Max Amount</Label>
                            <Input
                              type="number" min={1} placeholder="e.g. 50"
                              value={rw.variableConfig?.maxAmount || ''}
                              onChange={(e) => {
                                const newGroups = [...draft.reward.rewardGroups];
                                newGroups[gIdx].rewards[rIdx].variableConfig = { ...newGroups[gIdx].rewards[rIdx].variableConfig, type: 'random', maxAmount: Number(e.target.value) };
                                updateReward({ rewardGroups: newGroups });
                              }}
                              className="bg-white h-9 shadow-sm"
                            />
                          </div>
                        </div>
                      )}

                      {rw.variableConfig?.type === 'conditional' && (
                        <div className="flex flex-col gap-4 bg-white/50 p-4 rounded-xl border border-purple-50">
                          {rw.variableConfig.conditions?.map((rule, ruleIdx) => (
                            <div key={rule.id || ruleIdx} className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                              <div className="flex items-center gap-2 justify-between">
                                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-widest px-2 py-0.5 bg-purple-50 rounded">
                                  {ruleIdx === 0 ? "If User Condition" : "Else If User Condition"}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const newGroups = [...draft.reward.rewardGroups];
                                    const conds = [...(newGroups[gIdx].rewards[rIdx].variableConfig?.conditions || [])];
                                    conds.splice(ruleIdx, 1);
                                    newGroups[gIdx].rewards[rIdx].variableConfig!.conditions = conds;
                                    updateReward({ rewardGroups: newGroups });
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 p-1 rounded-md"
                                ><X size={14}/></button>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap mt-1">
                                <Select
                                  value={rule.userProperty || 'select'}
                                  onValueChange={(val) => {
                                    const newGroups = [...draft.reward.rewardGroups];
                                    newGroups[gIdx].rewards[rIdx].variableConfig!.conditions![ruleIdx].userProperty = val === 'select' ? '' : val;
                                    updateReward({ rewardGroups: newGroups });
                                  }}
                                >
                                  <SelectTrigger className="w-[160px] h-8 text-xs bg-gray-50"><SelectValue placeholder="Select Property"/></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="select">Select...</SelectItem>
                                    {availableProperties?.map((p: any) => (
                                      <SelectItem key={p.id || p._id} value={p.name}>{p.displayName || p.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={rule.operator || 'equals'}
                                  onValueChange={(val) => {
                                    const newGroups = [...draft.reward.rewardGroups];
                                    newGroups[gIdx].rewards[rIdx].variableConfig!.conditions![ruleIdx].operator = val;
                                    updateReward({ rewardGroups: newGroups });
                                  }}
                                >
                                  <SelectTrigger className="w-[120px] h-8 text-xs bg-gray-50"><SelectValue/></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="equals">equals</SelectItem>
                                    <SelectItem value="not_equals">not equal</SelectItem>
                                    <SelectItem value="greater_than">&gt; greater than</SelectItem>
                                    <SelectItem value="less_than">&lt; less than</SelectItem>
                                    <SelectItem value="contains">contains</SelectItem>
                                    <SelectItem value="set">is set</SelectItem>
                                  </SelectContent>
                                </Select>

                                {rule.operator !== 'set' && rule.operator !== 'not_set' && (
                                  <Input
                                    className="w-[120px] h-8 text-xs"
                                    placeholder="Value"
                                    value={String(rule.value || '')}
                                    onChange={(e) => {
                                      const newGroups = [...draft.reward.rewardGroups];
                                      newGroups[gIdx].rewards[rIdx].variableConfig!.conditions![ruleIdx].value = e.target.value;
                                      updateReward({ rewardGroups: newGroups });
                                    }}
                                  />
                                )}

                                <span className="text-[11px] font-bold text-gray-500 uppercase ml-2 tracking-widest flex items-center gap-1">
                                  <CheckCircle2 size={12}/> Then Payout
                                </span>
                                <Input
                                  className="w-[80px] h-8 text-xs bg-purple-50 border-purple-200 font-bold"
                                  type="number" min={1} placeholder="Amt"
                                  value={rule.payoutAmount || ''}
                                  onChange={(e) => {
                                    const newGroups = [...draft.reward.rewardGroups];
                                    newGroups[gIdx].rewards[rIdx].variableConfig!.conditions![ruleIdx].payoutAmount = Number(e.target.value);
                                    updateReward({ rewardGroups: newGroups });
                                  }}
                                />
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-between items-center px-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                const newGroups = [...draft.reward.rewardGroups];
                                if (!newGroups[gIdx].rewards[rIdx].variableConfig) newGroups[gIdx].rewards[rIdx].variableConfig = { type: 'conditional', conditions: [] };
                                if (!newGroups[gIdx].rewards[rIdx].variableConfig!.conditions) newGroups[gIdx].rewards[rIdx].variableConfig!.conditions = [];
                                newGroups[gIdx].rewards[rIdx].variableConfig!.conditions!.push({
                                  id: `cond_${Date.now()}`,
                                  userProperty: '',
                                  operator: 'equals',
                                  value: '',
                                  payoutAmount: 1
                                });
                                updateReward({ rewardGroups: newGroups });
                              }}
                              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1.5 px-3 py-1.5 hover:bg-purple-100 rounded-md transition-colors"
                            ><Plus size={14}/> Add Rule Scenario</button>
                          </div>

                          <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1">
                              Else Default Payout
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">If no conditions match:</span>
                              <Input
                                className="w-[100px] h-8 text-xs bg-white font-bold"
                                type="number" min={1} placeholder="Amt"
                                value={rw.variableConfig?.fallbackAmount || ''}
                                onChange={(e) => {
                                  const newGroups = [...draft.reward.rewardGroups];
                                  if (!newGroups[gIdx].rewards[rIdx].variableConfig) newGroups[gIdx].rewards[rIdx].variableConfig = { type: 'conditional' };
                                  newGroups[gIdx].rewards[rIdx].variableConfig!.fallbackAmount = Number(e.target.value);
                                  updateReward({ rewardGroups: newGroups });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {rw.variableConfig?.type === 'sdk_calculated' && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 mt-2">
                          <div className="p-1.5 bg-yellow-100 rounded-lg shrink-0 mt-0.5">
                            <Settings className="w-4 h-4 text-yellow-700" />
                          </div>
                          <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                            SDK Calculated mode bypasses central Dashboard logic. The underlying device / app SDK must manually intercept this reward payload and dynamically calculate the appropriate value entirely from local app state based on your internal specifications!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add Reward Item (within this group) */}
              <div className="pt-3 border-t border-gray-100 mt-3">
                <button
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  onClick={() => {
                    const newGroups = [...draft.reward.rewardGroups];
                    newGroups[gIdx].rewards.push({ amount: 1, rewardItemId: '', allowVariable: false });
                    updateReward({ rewardGroups: newGroups });
                  }}
                >
                  <Plus size={16} /> Add Reward
                </button>
              </div>
            </div>
          ))}

          {/* Add Reward Group (new outer group) */}
          <div className="pt-2">
            <button
              className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
              onClick={() => {
                const newGroups = [...draft.reward.rewardGroups];
                newGroups.push({ operator: 'AND' as const, rewards: [{ amount: 1, rewardItemId: '', allowVariable: false }] });
                updateReward({ rewardGroups: newGroups });
              }}
            >
              <Plus size={16} /> Add Reward Group
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- NUDGE TAB RENDER ---
  const renderNudgeTab = () => {
    const { currentCampaign, addInterface, deleteInterface, setActiveInterface } = useEditorStore.getState();
    const nudgeIface = draft.completionNudgeId
      ? currentCampaign?.interfaces?.find((i: any) => i.id === draft.completionNudgeId)
      : null;
    const hasNudge = !!nudgeIface;

    const NUDGE_TYPES = [
      { id: 'fullpage', label: 'Full Page', shapeColor: '#8B5CF6', bg: '#F5F3FF', description: 'Full screen overlay experience.' },
      { id: 'bottomsheet', label: 'Bottom Sheet', shapeColor: '#6366F1', bg: '#EEF2FF', description: 'Slides up from the bottom of the screen.' },
      { id: 'floater', label: 'Floater', shapeColor: '#10B981', bg: '#ECFDF5', description: 'Floating notification widget.' },
    ];

    const handleCreateNudge = (nudgeType: string) => {
      const interfaceName = `${draft.title} — Completion`;
      const newId = addInterface(nudgeType as any, interfaceName);
      updateDraft({ completionNudgeId: newId } as any);
      toast.success(`Completion nudge created (${nudgeType})`);
    };

    const handleRemoveNudge = () => {
      if (!draft.completionNudgeId) return;
      if (window.confirm('Remove this completion nudge? The interface design will also be deleted.')) {
        deleteInterface(draft.completionNudgeId);
        updateDraft({ completionNudgeId: undefined } as any);
        toast.success('Nudge removed');
      }
    };

    const handleDesignNudge = () => {
      if (!draft.completionNudgeId) return;
      // Save current draft first
      const error = validateDraft();
      if (error) {
        toast.error(error);
        return;
      }
      onSave(draft);
      onClose();
      // Navigate
      setActiveInterface(draft.completionNudgeId);
      if (onNavigateToDesign) {
        onNavigateToDesign(draft.completionNudgeId);
      }
    };

    return (
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Completion Nudge</h3>
          <p className="text-sm text-gray-500">Configure a notification that appears when the user completes this task.</p>
        </div>

        {hasNudge ? (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Bell size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Nudge Active</p>
                    <p className="text-sm text-gray-500">
                      Type: <span className="font-medium capitalize text-emerald-700">{nudgeIface.nudgeType}</span>
                      {' · '}
                      <span className="text-gray-400">{nudgeIface.name}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDesignNudge}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
                  >
                    <Sparkles size={14} />
                    Design Nudge
                    <ExternalLink size={12} />
                  </button>
                  <button
                    onClick={handleRemoveNudge}
                    className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400 italic">
              This nudge will be displayed to the user immediately when they complete this task.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 mb-4">Choose a nudge type for the completion notification:</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {NUDGE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleCreateNudge(type.id)}
                  className="group text-left outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-xl"
                >
                  {/* Visual Shape Card — matches DesignStep "Select Nudge Type" dialog */}
                  <div
                    className="relative overflow-hidden rounded-xl border border-gray-200 group-hover:border-gray-300 group-hover:shadow-md transition-all duration-200 mb-3"
                    style={{ aspectRatio: '9/16', backgroundColor: type.bg }}
                  >
                    {/* Full Page: full colored fill */}
                    {type.id === 'fullpage' && (
                      <div style={{ width: '100%', height: '100%', backgroundColor: type.shapeColor, opacity: 0.35 }} />
                    )}
                    {/* Bottom Sheet: colored panel at bottom */}
                    {type.id === 'bottomsheet' && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: type.shapeColor, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }} />
                    )}
                    {/* Floater: green circle at bottom-right */}
                    {type.id === 'floater' && (
                      <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '48px', height: '48px', backgroundColor: type.shapeColor, borderRadius: '50%' }} />
                    )}

                    {/* Hover "Select" pill */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white px-4 py-2 rounded-full shadow-md text-xs font-semibold" style={{ color: type.shapeColor }}>
                        Select
                      </div>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 text-center">{type.label}</h4>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-400">
                <strong>Tip:</strong> After selecting a type, click "Design Nudge" to customize the visual appearance using the full design editor.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white flex flex-col w-[70%] h-[85vh] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Task</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs Layout */}
          <div className="border-b border-gray-100 px-6">
            <div className="flex gap-4 max-w-4xl mx-auto py-2">

              <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all flex-1 justify-center ${activeTab === 'details' ? 'bg-gray-50 border border-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <Settings size={18} className={activeTab === 'details' ? 'text-gray-900' : 'text-gray-400'} />
                Task Details
              </button>

              <button
                onClick={() => setActiveTab('logic')}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all flex-1 justify-center ${activeTab === 'logic' ? 'bg-gray-50 border border-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <CheckCircle2 size={18} className={activeTab === 'logic' ? 'text-gray-900' : 'text-gray-400'} />
                Task Logic
              </button>

              <button
                onClick={() => setActiveTab('reward')}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all flex-1 justify-center ${activeTab === 'reward' ? 'bg-gray-50 border border-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <Gift size={18} className={activeTab === 'reward' ? 'text-gray-900' : 'text-gray-400'} />
                Task Reward
              </button>

              <button
                onClick={() => setActiveTab('nudge')}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all flex-1 justify-center ${activeTab === 'nudge' ? 'bg-gray-50 border border-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <Bell size={18} className={activeTab === 'nudge' ? 'text-gray-900' : 'text-gray-400'} />
                Nudge
              </button>

            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <div className="max-w-4xl mx-auto py-4">
              {activeTab === 'details' && renderDetailsTab()}
              {activeTab === 'logic' && renderLogicTab()}
              {activeTab === 'reward' && renderRewardTab()}
              {activeTab === 'nudge' && renderNudgeTab()}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4 bg-white flex justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={onClose} className="rounded-lg">Cancel</Button>
            <Button onClick={handleSaveAndClose} className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm">
              Save Task
            </Button>
          </div>

        </div>
      </div>
    </>
  );
};
