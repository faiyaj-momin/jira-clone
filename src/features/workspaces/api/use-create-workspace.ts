import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.workspaces)['$post']>;
type RequestType = InferRequestType<(typeof client.api.workspaces)['$post']>;

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.workspaces['$post']({ form });

      console.log(response);
      // if (!response.ok) {
      //     const {message} = await response.json()
      //     throw new Error(message)
      // }
      return await response.json();
    },
    onSuccess: ({ message }) => {
      toast.success(message || 'Workspace created');
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to create workspace');
    },
  });
  return mutation;
};
