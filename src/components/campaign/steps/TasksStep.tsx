import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useStore, ChallengeTask, ChallengeTaskLogic, ChallengeTaskReward } from '@/store/useStore';
import { Plus, MoreHorizontal, Pencil, Trash2, Tag, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskEditorModal } from './TaskEditorModal';

const defaultLogic = (): ChallengeTaskLogic => ({
  eventGroups: [{
    operator: 'AND',
    events: [{ eventId: '', operator: 'gte', count: 1, filters: [] }]
  }],
  userTrigger: 'all_users',
  limits: { attemptFrequency: 'always' }
});

const defaultReward = (): ChallengeTaskReward => ({
  rewardGroups: []
});

const newTask = (index: number): ChallengeTask => ({
  id: `task_${Date.now()}_${index}`,
  title: `Task #${index + 1}`,
  logic: defaultLogic(),
  reward: defaultReward()
});

export const TasksStep: React.FC = () => {
  const { currentCampaign, updateCampaign, availableEvents, isLoadingMetadata, fetchMetadata } = useEditorStore();
  const { rewards } = useStore();
  const [modalTaskIdx, setModalTaskIdx] = useState<number | null>(null);

  React.useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  if (!currentCampaign) return null;

  const challengeDetails = currentCampaign.challengeDetails || {
    tasks: [],
    executionOrder: 'any_order',
    hideOnCompletion: true,
    allowMultipleSimultaneousTasks: true
  };
  const tasks = challengeDetails.tasks || [];

  const updateTask = (index: number, updated: ChallengeTask) => {
    const newTasks = [...tasks];
    newTasks[index] = updated;
    updateCampaign({
      challengeDetails: { ...challengeDetails, tasks: newTasks }
    });
  };

  const addTask = () => {
    const freshTask = newTask(tasks.length);
    updateCampaign({
      challengeDetails: { ...challengeDetails, tasks: [...tasks, freshTask] }
    });
    setModalTaskIdx(tasks.length);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIdx = result.source.index;
    const destIdx = result.destination.index;
    
    if (sourceIdx === destIdx) return;
    
    const newTasks = Array.from(tasks);
    const [reorderedItem] = newTasks.splice(sourceIdx, 1);
    newTasks.splice(destIdx, 0, reorderedItem);
    
    updateCampaign({ challengeDetails: { ...challengeDetails, tasks: newTasks } });
  };

  const renameTask = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt('Enter new name for task:', tasks[index].title);
    if (newName !== null && newName.trim() !== '') {
      const newTasks = [...tasks];
      newTasks[index] = { ...newTasks[index], title: newName.trim() };
      updateCampaign({ challengeDetails: { ...challengeDetails, tasks: newTasks } });
    }
  };

  const deleteTask = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      const newTasks = tasks.filter((_, i) => i !== index);
      updateCampaign({ challengeDetails: { ...challengeDetails, tasks: newTasks } });
    }
  };

  const availableRewards = rewards || [];

  // Helper formatting to display logic string roughly mimicking screenshot
  const formatLogic = (logic: ChallengeTaskLogic) => {
    if (!logic.eventGroups || logic.eventGroups.length === 0) return 'No conditions set';
    
    // We parse the very first group to keep table neat
    const group = logic.eventGroups[0];
    if (!group.events || group.events.length === 0) return 'Empty group';

    const opMap: Record<string, string> = { gte: '≥', eq: '=', gt: '>' };
    
    const eventStrings = group.events.map(ev => {
       const name = ev.eventId || 'Unknown Event';
       return `${name} ${opMap[ev.operator] || '≥'} ${ev.count}`;
    });

    const joiner = group.operator === 'OR' ? ' OR ' : ' AND ';
    return eventStrings.join(joiner);
  };

  const formatRewardItem = (rwConfig: any) => {
    if (!rwConfig || !rwConfig.rewardItemId) return 'Missing Item';
    const rwObj = availableRewards.find(r => r.id === rwConfig.rewardItemId);
    const name = rwObj ? rwObj.name : 'Unknown';

    if (rwConfig.allowVariable) {
      const type = rwConfig.variableConfig?.type || 'random';
      if (type === 'random') return `${rwConfig.variableConfig?.minAmount || 1}-${rwConfig.variableConfig?.maxAmount || 1}x ${name} (Var)`;
      if (type === 'conditional') return `Conditional Rules x ${name}`;
      if (type === 'sdk_calculated') return `SDK Controlled x ${name}`;
    }
    return `${rwConfig.amount || 1}x ${name}`;
  };

  const formatReward = (reward: ChallengeTaskReward) => {
    if (!reward.rewardGroups || reward.rewardGroups.length === 0) return 'No rewards given';
    
    // Just parse the first group to keep table neat
    const group = reward.rewardGroups[0];
    if (!group.rewards || group.rewards.length === 0) {
       // Support legacy flat format map migration visually
       if ((group as any).rewardItemId) {
          return formatRewardItem(group);
       }
       return 'Empty group';
    }

    const rwStrings = group.rewards.map(r => formatRewardItem(r));
    const joiner = group.operator === 'OR' ? ' OR ' : ' AND ';
    return rwStrings.join(joiner);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Tasks</h2>
        <p className="text-gray-500">Set up tasks for your users to complete.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4 w-1/3">Title</th>
              <th className="px-6 py-4 w-1/3">Logic</th>
              <th className="px-6 py-4 w-1/3 flex justify-between items-center pr-4">
                <span>Reward</span>
                <button
                  onClick={addTask}
                  className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-200"
                >
                  <Plus size={16} />
                </button>
              </th>
            </tr>
          </thead>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks-droppable">
              {(provided) => (
                <tbody 
                  className="divide-y divide-gray-100"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {tasks.map((t, idx) => (
                    <Draggable key={t.id} draggableId={t.id} index={idx}>
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${snapshot.isDragging ? 'bg-indigo-50 shadow-md ring-1 ring-indigo-200' : ''}`}
                          onClick={() => setModalTaskIdx(idx)}
                          style={provided.draggableProps.style}
                        >
                          <td className="px-6 py-4 w-1/3">
                            <div className="flex items-center gap-3">
                              <div 
                                {...provided.dragHandleProps} 
                                className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing p-1 -ml-2 rounded"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <GripVertical size={16} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{t.title}</span>
                                <span className="text-xs text-gray-500 font-mono mt-0.5" title={t.id}>{t.id.substring(0, 15)}...</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {formatLogic(t.logic)}
                          </td>
                          <td className="px-6 py-4 text-gray-500 flex justify-between items-center">
                            {formatReward(t.reward)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-gray-400 hover:text-gray-600 px-2 flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal size={16} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setModalTaskIdx(idx); }}>
                                  <Pencil className="w-4 h-4 mr-2 text-muted-foreground" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => renameTask(idx, e)}>
                                  <Tag className="w-4 h-4 mr-2 text-muted-foreground" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => deleteTask(idx, e)} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <tr>
                    <td colSpan={3} className="px-6 py-4">
                      <button
                        onClick={addTask}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                      >
                        <Plus size={16} /> Add Task...
                      </button>
                    </td>
                  </tr>
                </tbody>
              )}
            </Droppable>
          </DragDropContext>
        </table>
      </div>

      {modalTaskIdx !== null && tasks[modalTaskIdx] && (
        <TaskEditorModal
          task={tasks[modalTaskIdx]}
          isOpen={true}
          onClose={() => setModalTaskIdx(null)}
          onSave={(updated) => updateTask(modalTaskIdx, updated)}
          availableEvents={availableEvents || []}
          isLoadingMetadata={isLoadingMetadata}
          availableRewards={availableRewards}
        />
      )}
    </div>
  );
};
