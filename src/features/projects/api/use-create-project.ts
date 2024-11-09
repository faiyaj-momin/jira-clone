import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.projects)['$post']>;
type RequestType = InferRequestType<(typeof client.api.projects)['$post']>;

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.projects['$post']({ form });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      const result = await response.json();

      // Ensure the result has the required structure
      if (!result.data || !result.data.$id) {
        throw new Error('Invalid response structure');
      }

      return result;
    },
    onSuccess: ({ message }) => {
      toast.success(message || 'project created');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to create project');
    },
  });
  return mutation;
};
