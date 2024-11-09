'use client';
import Link from 'next/link';

import { Fragment } from 'react';
import { ArrowLeftIcon, MoreVerticalIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DottedSeparator } from '@/components/dotted-separator';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

import { useGetMembers } from '../api/use-get-members';
import { MemberAvatar } from './member-avatar';
import { useDeleteMember } from '../api/use-delete-member';
import { useUpdateMember } from '../api/use-update-member';
import { useConfirm } from '@/hooks/use-confirm';

import { MemberRole } from '../types';
import { MemberSkeleton } from './member-skeleton';

const MembersList = () => {
  const [ComfirmDialog, comfirm] = useConfirm(
    'Remove Member',
    'This member will be removed from the workspace',
    'destructive'
  );
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetMembers({ workspaceId });
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const isDisable = isDeletingMember || isUpdatingMember;

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      param: { memberId },
      json: { role },
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await comfirm();
    if (!ok) return;

    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
  };
  return (
    <Card className="w-full h-full border-none shadow-none">
      <ComfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 space-y-0">
        <Button asChild variant="secondary">
          <Link href={`/workspaces/${workspaceId}`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members List</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Fragment key={index}>
              <MemberSkeleton className="mb-1" />
              <Separator className="my-2.5" />
            </Fragment>
          ))}
        {data?.members.map((member, index) => (
          <Fragment key={member.$id}>
            <div className="flex items-center gap-2">
              <MemberAvatar
                className="size-10"
                fallbackClassName="text-lg"
                name={member.name}
              />
              <div className="flex flex-col">
                <p className="text-sm font-bold">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="ml-auto" variant="secondary" size="icon">
                    <MoreVerticalIcon className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuItem
                    className="font-medium"
                    onSelect={() =>
                      handleUpdateMember(member.$id, MemberRole.ADMIN)
                    }
                    disabled={data.role === MemberRole.MEMBER || isDisable}
                  >
                    Set as Administrator
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium"
                    onSelect={() =>
                      handleUpdateMember(member.$id, MemberRole.MEMBER)
                    }
                    disabled={data.role === MemberRole.MEMBER || isDisable}
                  >
                    Set as Member
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium text-amber-700"
                    onSelect={() => handleDeleteMember(member.$id)}
                    disabled={data.role === MemberRole.MEMBER || isDisable}
                  >
                    Remove {member.name}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {index < data?.members.length - 1 && (
              <Separator className="my-2.5" />
            )}
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

export default MembersList;
