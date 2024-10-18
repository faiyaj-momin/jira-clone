import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[':workspaceId']['join']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[':workspaceId']['join']['$post']
>;

export const useJoinWorkspace = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.workspaces[':workspaceId']['join'][
        '$post'
      ]({
        json,
        param,
      });

      console.log(response);
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Already joined workspace');
        } else if (response.status === 403) {
          throw new Error('Invalid invite code.');
        } else {
          throw new Error('Failed to join workspace');
        }
      }
      return await response.json();
    },
    onSuccess: ({ data, message }) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', data?.$id] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to join workspace');
    },
  });
  return mutation;
};
