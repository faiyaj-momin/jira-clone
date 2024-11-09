'use client';
import { RiAddCircleFill } from 'react-icons/ri';
import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces';

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { WorkspaceAvatar } from '@/features/workspaces/components/workspace-avatar';
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useCreateWorkspaceModal } from '@/features/workspaces/hooks/use-create-workspace-modal';
import { useCallback } from 'react';
import { useSetCookie } from '@/lib/use-set-cookie';

export const WorkspaceSwitcher = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { open } = useCreateWorkspaceModal();

  const { data: workspaces } = useGetWorkspaces();
  const { mutate } = useSetCookie();

  const onSelect = useCallback(
    (id: string) => {
      mutate({
        query: { name: 'current-workspace', value: id, days: '30' },
      });
      localStorage.setItem('current-workspace', id);
      router.push(`/workspaces/${id}`);
    },
    [router, mutate]
  );

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500 uppercase">workspace</p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>
      <Select onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
          <SelectValue
            placeholder="No workspace selected"
            className="text-neutral-500"
          />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.map((workspace) => (
            <SelectItem key={workspace.$id} value={workspace.$id}>
              <div className="flex justify-start items-center gap-3 font-medium">
                <WorkspaceAvatar
                  name={workspace.name}
                  image={workspace.imageUrl}
                />
                <span className="truncate">{workspace.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
