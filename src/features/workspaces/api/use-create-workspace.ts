import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';
import { useRouter } from 'next/navigation';

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)['$post'],
  201
>;
type RequestType = InferRequestType<(typeof client.api.workspaces)['$post']>;

export const useCreateWorkspace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.workspaces['$post']({ form });
      if (!response.ok) {
        throw new Error(
          (await response.json()).message || 'Failed to create workspace'
        );
      }
      return await response.json();
    },
    onSuccess: ({ message }) => {
      toast.success(message || 'Workspace created');
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to create workspace');
    },
  });
  return mutation;
};
