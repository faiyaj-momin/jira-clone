import { useParams } from 'next/navigation';

export const useInviteCode = () => {
  const params = useParams();
  // const workspaceId = params.workspaceId;

  return params.inviteCode as string;
};
