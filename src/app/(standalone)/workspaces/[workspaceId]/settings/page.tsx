import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';
import React from 'react';
import { WorkspaceSettingsCleint } from './client';

const WorkspaceSettingsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect('/sign-in');

  return <WorkspaceSettingsCleint />;
};

export default WorkspaceSettingsPage;
