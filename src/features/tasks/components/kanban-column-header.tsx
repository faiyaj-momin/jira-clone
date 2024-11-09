import React from 'react';
import { TaskStatus } from '../types';
import { snakeCaseToTitleCase } from '@/lib/utils';
import {
  CheckCircle,
  Circle,
  CircleHelp,
  Clock,
  EyeIcon,
  PlusIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Icons: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.TODO]: <Circle className="size-4 text-red-500" />,
  [TaskStatus.BACKLOG]: <CircleHelp className="size-4 text-pink-500" />,
  [TaskStatus.IN_PROGRESS]: <Clock className="size-4 text-yellow-500" />,
  [TaskStatus.IN_REVIEW]: <EyeIcon className="size-4 text-blue-500" />,
  [TaskStatus.DONE]: <CheckCircle className="size-4 text-emerald-500" />,
};

interface KanbanColumnHeaderProps {
  board: TaskStatus;
  taskCount: number;
}
const KanbanColumnHeader = ({ board, taskCount }: KanbanColumnHeaderProps) => {
  return (
    <div className="px-2 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        {Icons[board]}
        <h2 className="text-sm font-medium">{snakeCaseToTitleCase(board)}</h2>
        <div className="size-5 flex items-center justify-center rounded-md bg-neutral-200 text-xs text-neutral-700 font-medium">
          {taskCount}
        </div>
      </div>
      <Button size="icon" variant="ghost" className="size-5" onClick={() => {}}>
        <PlusIcon className="size-4 text-neutral-500" />
      </Button>
    </div>
  );
};

export default KanbanColumnHeader;
