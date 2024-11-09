'use client';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetProjects } from '../../projects/api/use-get-projects';
import { useGetMembers } from '@/features/members/api/use-get-members';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { useGetTask } from '../api/use-get-task';
import { EditTaskForm } from './edit-task-form';

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditTaskFormWrapper = ({
  onCancel,
  id,
}: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const { data: initialValue, isLoading: isLoadingTask } = useGetTask({
    taskId: id,
  });
  const { data: projects, isLoading: isLoadingProject } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const projectOption = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name as string,
    imageUrl: project.imageUrl as string,
  }));

  const memberOption = members?.members.map((member) => ({
    id: member.$id,
    name: member.name,
  }));

  const isLoading = isLoadingMembers || isLoadingProject || isLoadingTask;

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex justify-center items-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!initialValue) return null;

  return (
    <div>
      <EditTaskForm
        onCancel={onCancel}
        projectOptions={projectOption ?? []}
        memberOptions={memberOption ?? []}
        initialValues={initialValue}
      />
    </div>
  );
};
