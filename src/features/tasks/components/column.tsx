'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Task, TaskStatus } from '@/features/tasks/types';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, EyeIcon, MoreVertical } from 'lucide-react';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { MemberAvatar } from '@/features/members/components/member-avatar';
import { TaskDate } from './task-date';
import { Badge } from '@/components/ui/badge';
import { snakeCaseToTitleCase } from '@/lib/utils';
import { CheckCircle, Circle, Clock, CircleHelp } from 'lucide-react';
import { TaskActions } from './task-actions';

const Icons: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.TODO]: <Circle className="size-3" />,
  [TaskStatus.BACKLOG]: <CircleHelp className="size-3" />,
  [TaskStatus.IN_PROGRESS]: <Clock className="size-3" />,
  [TaskStatus.IN_REVIEW]: <EyeIcon className="size-3" />,
  [TaskStatus.DONE]: <CheckCircle className="size-3" />,
};

export const columns: ColumnDef<Task>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Task Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.original.name;

      return <p className="line-clamp-1">{name}</p>;
    },
  },
  {
    accessorKey: 'project',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Project
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const project = row.original.project;

      return (
        <div className="flex items-center gap-x-2 text-sm font-semibold">
          <ProjectAvatar
            className="size-6"
            name={project.name}
            image={project.imageUrl}
          />
          <p className="line-clamp-1">{project.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'assignee',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Assignee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const assignee = row.original.assignee;

      return (
        <div className="flex items-center gap-x-2 text-sm font-semibold">
          <MemberAvatar className="size-6" name={assignee.name} />
          <p className="line-clamp-1">{assignee.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dueDate = row.original.dueDate;
      const status = row.original.status;

      return (
        <TaskDate
          value={dueDate}
          className={`${status === 'DONE' && 'line-through text-emerald-600'}`}
        />
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const stutas = row.original.status;

      return (
        <div className="flex items-center gap-x-2 text-sm font-semibold">
          <Badge variant={stutas} className={`line-clamp-1 min-w-[6.5rem]`}>
            <div className="flex justify-start items-center gap-x-1">
              {Icons[stutas]}
              {snakeCaseToTitleCase(stutas)}
            </div>
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const id = row.original.$id;
      const projectId = row.original.projectId;
      return (
        <TaskActions id={id} projectId={projectId}>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </TaskActions>
      );
    },
  },
];
