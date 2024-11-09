import { Models } from 'node-appwrite';

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_REVIEW = 'IN_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export type Task = Models.Document & {
  name: string;
  description?: string;
  status: TaskStatus;
  workspaceId: string;
  assigneeId: string;
  projectId: string;
  position: number;
  dueDate: string;
};
