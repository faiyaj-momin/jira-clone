import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/rpc';

interface UseGetMembersProps {
  workspaceId: string;
}

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
  const query = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: async () => {
      const response = await client.api.members.$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        } else {
          throw new Error('Failed to get workspaces');
        }
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
