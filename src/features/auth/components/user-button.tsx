'use client';

import { Loader, LogOut, User2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DottedSeparator } from '@/components/dotted-separator';

import { useLogout } from '../api/use-logout';
import { useCurrent } from '../api/use-current';
import Link from 'next/link';

export const UserButton = () => {
  const { mutate: logout } = useLogout();
  const { data: user, isLoading } = useCurrent();

  if (isLoading) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogOut = () => {
    window.localStorage.clear();
    logout();
  };

  const { name, email } = user;

  const avatarFallback = name
    ? name.charAt(0).toUpperCase()
    : (email.charAt(0).toUpperCase() ?? 'U');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="outline-none relative cursor-pointer"
      >
        <Avatar className="size-10 hover:opacity-75 transition border border-neutral-300 cursor-pointer">
          <AvatarImage src={'/default-user-avatar.jpg'} />
          <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={10}
        className="w-60"
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4 select-none">
          <Avatar className="size-[56px] border border-neutral-300">
            <AvatarImage src={'/default-user-avatar.jpg'} />
            <AvatarFallback className="bg-neutral-200 font-medium text-xl text-neutral-500 flex items-center justify-center">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center justify-center select-none cursor-default">
            <p className="text-sm font-medium text-neutral-900 select-none cursor-default">
              {name || 'User'}
            </p>
            <p className="text-xs text-neutral-500 select-none cursor-default">
              {email}
            </p>
          </div>

          <div>
            <DottedSeparator className="mb-1" />
          </div>

          <DropdownMenuItem
            asChild
            className="h-10 w-full flex gap-x-2 items-center justify-start font-medium cursor-pointer select-none"
          >
            <Link href="/profile">
              <User2 />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleLogOut}
            className="h-10 w-full flex gap-x-2 items-center justify-start text-amber-700 font-medium cursor-pointer select-none"
          >
            <LogOut />
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
