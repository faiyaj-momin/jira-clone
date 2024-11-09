import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[':workspaceId']['$patch'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[':workspaceId']['$patch']
>;

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      const response = await client.api.workspaces[':workspaceId']['$patch']({
        form,
        param,
      });

      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }
      return await response.json();
    },
    onSuccess: ({ message, data }) => {
      toast.success(message || 'Workspace updated');
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', data?.$id] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to update workspace');
    },
  });
  return mutation;
};
