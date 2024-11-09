import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.tasks)[':taskId']['$patch']
>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[':taskId']['$patch']
>;

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.tasks[':taskId']['$patch']({
        json,
        param,
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const result = await response.json();

      // Ensure the result has the required structure
      if (!result.data || !result.data?.['$id']) {
        throw new Error('Invalid response structure');
      }

      return result;
    },
    onSuccess: ({ message, data }) => {
      toast.success(message || 'task updated');
      queryClient.invalidateQueries({ queryKey: ['project-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.$id] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to update task');
    },
  });
  return mutation;
};
