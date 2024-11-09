import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType } from 'hono';

import { client } from '@/lib/rpc';
import { useRouter } from 'next/navigation';

type ResponseType = InferResponseType<(typeof client.api.auth.logout)['$post']>;

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.auth.logout['$post']();

      const result = (await response.json()) as ResponseType;

      if (!response.ok) {
        throw new Error(result.message);
      }

      return result;
    },
    onSuccess: ({ message }) => {
      toast.success(message || 'Logout successful');
      router.refresh();
      queryClient.invalidateQueries();
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to logout');
    },
  });
  return mutation;
};
