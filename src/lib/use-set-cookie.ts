import { useMutation } from '@tanstack/react-query';
import { InferResponseType, InferRequestType } from 'hono';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<
  (typeof client.api)['set-cookie']['$post'],
  200
>;
type RequestType = InferRequestType<(typeof client.api)['set-cookie']['$post']>;

export const useSetCookie = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ query }) => {
      const response = await client.api['set-cookie']['$post']({ query });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message);
      }

      return await response.json();
    },
  });
  return mutation;
};
