import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/rpc';
import { TaskStatus } from '../types';

interface useGetProjectsProps {
  workspaceId: string;
  projectId?: string | null;
  status?: TaskStatus | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  search?: string | null;
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  assigneeId,
  dueDate,
  status,
  search,
}: useGetProjectsProps) => {
  const query = useQuery({
    queryKey: [
      'tasks',
      workspaceId,
      projectId,
      status,
      search,
      assigneeId,
      dueDate,
    ],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          assigneeId: assigneeId ?? undefined,
          search: search ?? undefined,
          dueDate: dueDate ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get tasks');
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};