import React from 'react';
import { redirect } from 'next/navigation';

import { getCurrent } from '@/features/auth/queries';
import { ProjectIdClient } from './client';

interface ProjectIdPageProps {
  params: {
    workspaceId: string;
    projectId: string;
  };
}

const ProjectIdPage = async () => {
  const user = await getCurrent();

  if (!user) redirect('/sign-in');

  return <ProjectIdClient />;
};

export default ProjectIdPage;

export async function generateMetadata({
  params,
}: ProjectIdPageProps): Promise<{ title: string; description: string }> {
  const { projectId } = params;
  return {
    title: `Project ${projectId}`,
    description: `Details and information about project ${projectId}.`,
  };
}
