import { ContextDiff } from '../context/diff';

export type ActionType = 'generateSkill' | 'removeSkill';

export interface WorkspaceAction {
  type: ActionType;
  module: string;
}

export function generateActionsFromDiff(diff: ContextDiff): WorkspaceAction[] {
  const actions: WorkspaceAction[] = [];

  // Very naive mapping. Real implementation might look up specific module->skill heuristics
  for (const module of diff.addedModules) {
    actions.push({ type: 'generateSkill', module });
  }

  for (const module of diff.removedModules) {
    actions.push({ type: 'removeSkill', module });
  }

  // Could also add frameworks mapping here
  for (const framework of diff.addedFrameworks) {
    actions.push({ type: 'generateSkill', module: framework });
  }

  for (const framework of diff.removedFrameworks) {
    actions.push({ type: 'removeSkill', module: framework });
  }

  return actions;
}
