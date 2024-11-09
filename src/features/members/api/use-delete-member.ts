import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.members)[':memberId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members)[':memberId']['$delete']
>;

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.members[':memberId']['$delete']({
        param,
      });

      console.log(response);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Member not found');
        } else if (response.status === 401) {
          throw new Error(
            'You are not allowed to delete this member or you are the only member'
          );
        } else {
          throw new Error('Failed to delete member');
        }
      }

      return await response.json();
    },
    onSuccess: ({ message }) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to delete member');
    },
  });
  return mutation;
};
