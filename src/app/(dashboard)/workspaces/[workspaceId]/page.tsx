import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';

import React from 'react';
import { WorkspaceIdClient } from './client';

interface WorkspacePageProps {
  params: {
    workspaceId: string;
  };
}
const WorkspacePage = async () => {
  const user = await getCurrent();

  if (!user) redirect('/sign-in');
  return <WorkspaceIdClient />;
};

export default WorkspacePage;

export async function generateMetadata({
  params,
}: WorkspacePageProps): Promise<{ title: string; description: string }> {
  const { workspaceId } = params;
  return {
    title: `Workspace ${workspaceId}`,
    description: `Details and information about workspace ${workspaceId}.`,
  };
}
