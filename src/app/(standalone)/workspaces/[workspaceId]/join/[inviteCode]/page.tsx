import { getCurrent } from '@/features/auth/queries';
import { JoinWorkspaceForm } from '@/features/workspaces/components/join-workspace-form';
import { getWrokspaceInfo } from '@/features/workspaces/queries';
import { redirect } from 'next/navigation';

interface WorkspaceIdJoinPageProps {
  params: {
    workspaceId: string;
    inviteCode: string;
  };
}

const WorkspaceIdJoinPage = async ({ params }: WorkspaceIdJoinPageProps) => {
  const user = await getCurrent();

  if (!user) redirect('/sign-in');

  const initialValues = await getWrokspaceInfo({
    workspaceId: params.workspaceId,
  });
  if (!initialValues) redirect('/');

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm intialValues={initialValues} />
    </div>
  );
};

export default WorkspaceIdJoinPage;
