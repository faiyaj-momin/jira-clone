import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';
import React from 'react';

interface WorkspacePageProps {
  params: {
    workspaceId: string;
  };
}
const WorkspacePage = async ({ params }: WorkspacePageProps) => {
  const user = await getCurrent();

  if (!user) redirect('/sign-in');
  return <div>current workspace {params.workspaceId}</div>;
};

export default WorkspacePage;
