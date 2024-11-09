'use client';

import PageError from '@/components/page-error';
import { PageLoader } from '@/components/page-loader';
import { Analytics } from '@/components/ui/analytics';
import { Button } from '@/components/ui/button';
import { useGetProject } from '@/features/projects/api/use-get-project';
import { useGetProjectAnalytics } from '@/features/projects/api/use-get-project-analytics';
import { ProjectAvatar } from '@/features/projects/components/project-avatar';
import { useProjectId } from '@/features/projects/hooks/use-project-id';
import { TaskViewSwitcher } from '@/features/tasks/components/task-view-switcher';
import { Pencil1Icon } from '@radix-ui/react-icons';
import Link from 'next/link';

export const ProjectIdClient = () => {
  const projectId = useProjectId();
  const { data: project, isLoading: isProjectLoadind } = useGetProject({
    projectId,
  });
  const { data: anaylics, isLoading: isAnalyticsLoding } =
    useGetProjectAnalytics({ projectId });

  const isLoading = isProjectLoadind || isAnalyticsLoding;
  if (isLoading) return <PageLoader />;

  if (!project) return <PageError message="Project not found" />;

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar image={project?.image} name={project?.name ?? 'P'} />
          <p className="text-lg font-semibold">
            {isLoading ? 'Loading...' : project?.name}
          </p>
        </div>
        <div>
          <Button variant="secondary" size="sm" asChild>
            <Link
              href={`/workspaces/${project?.workspaceId}/projects/${project?.$id}/settings`}
            >
              <Pencil1Icon className="size-4 mr-2" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>
      {anaylics ? <Analytics data={anaylics} /> : null}
      <TaskViewSwitcher hideProjectFilter />
    </div>
  );
};
