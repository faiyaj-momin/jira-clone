import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api.projects)[':projectId']['$delete'],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.projects)[':projectId']['$delete']
>;

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.projects[':projectId']['$delete']({
        param,
      });

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
    onSuccess: ({ message, data }) => {
      toast.success(message || 'Project deleted');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.$id] });
    },
    onError: ({ message }) => {
      toast.error(message || 'Failed to delete project');
    },
  });
  return mutation;
};

/**
 export const useUpdateProject = () => {
   const queryClient = useQueryClient();
   const mutation = useMutation<ResponseType, Error, RequestType>({
     mutationFn: async ({ form, param }) => {
       const response = await client.api.projects[':projectId']['$patch']({
         form,
         param
       });
 
       const result = await response.json();
 
       console.log(response);
       if (!response.ok) {
           const {message} = await response.json()
           throw new Error(message)
       }
       return result;
     },
     onSuccess: ({ message, data }) => {
       toast.success(message || 'project updated');
       queryClient.invalidateQueries({ queryKey: ['projects'] });
       queryClient.invalidateQueries({ queryKey: ['project', data?.$id] });
     },
     onError: ({ message }) => {
       toast.error(message || 'Failed to update project');
     },
   });
   return mutation;
 };
 
 **/
