import { useParams } from 'next/navigation';

export const useWorkspaceId = () => {
  const params = useParams();
  // const workspaceId = params.workspaceId;

  return params.workspaceId as string;
};
