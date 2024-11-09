import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';
import { useRouter } from 'next/navigation';

type ResponseType = InferResponseType<(typeof client.api.auth.login)['$post']>;
type RequestType = InferRequestType<(typeof client.api.auth.login)['$post']>;

export const useLogin = () => {
  const router = useRouter();

  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.login['$post']({ json });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: ({ message }) => {
      toast.success(message);
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ['current'] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to login');
    },
  });
  return mutation;
};
