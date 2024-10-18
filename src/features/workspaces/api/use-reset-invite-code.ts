import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[':workspaceId']['reset-invite-code']['$post'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[':workspaceId']['reset-invite-code']['$post']
>;

export const useResetInviteCode = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.workspaces[':workspaceId'][
        'reset-invite-code'
      ]['$post']({
        param,
      });

      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to failed to reset invite code');
      }
      return await response.json();
    },
    onSuccess: ({ data, message }) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', data?.$id] });
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });
  return mutation;
};
