import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.tasks)['bulk-update']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)['bulk-update']['$post']
>;

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.tasks['bulk-update']['$post']({
        json,
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const result = await response.json();

      // Ensure the result has the required structure
      if (!result.data) {
        throw new Error('Invalid response structure');
      }

      return result;
    },
    onSuccess: ({ message }) => {
      toast.success(message || 'tasks updated');
      queryClient.invalidateQueries({ queryKey: ['project-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to update tasks');
    },
  });
  return mutation;
};
