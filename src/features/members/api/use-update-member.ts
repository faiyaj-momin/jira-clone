import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.members)[':memberId']['$patch'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members)[':memberId']['$patch']
>;

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.members[':memberId']['$patch']({
        param,
        json,
      });

      console.log(response);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('unauthorized');
        } else if (response.status === 400) {
          throw new Error('cannot downgrade the only member');
        } else {
          throw new Error('Failed to update member');
        }
      }

      return await response.json();
    },
    onSuccess: ({ message }) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to update member');
    },
  });
  return mutation;
};
