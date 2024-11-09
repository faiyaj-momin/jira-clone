'use client';
import { cn } from '@/lib/utils';
import { SettingsIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from 'react-icons/go';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { usePathname } from 'next/navigation';

const routes = [
  {
    label: 'Home',
    path: '',
    icon: GoHome,
    avtiveIcon: GoHomeFill,
  },
  {
    label: 'My Tasks',
    path: '/tasks',
    icon: GoCheckCircle,
    avtiveIcon: GoCheckCircleFill,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: SettingsIcon,
    avtiveIcon: SettingsIcon,
  },
  {
    label: 'Members',
    path: '/members',
    icon: UsersIcon,
    avtiveIcon: UsersIcon,
  },
];
const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  return (
    <ul>
      {routes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.path}`;
        const isActive = fullHref === pathname;

        const Icon = isActive ? item.avtiveIcon : item.icon;

        return (
          <li key={item.label}>
            <Link href={fullHref}>
              <div
                className={cn(
                  'flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500',
                  isActive &&
                    'bg-white shadow-sm hover:opacity-100 text-primary'
                )}
              >
                <Icon className="size-5 text-neutral-500" />
                <span>{item.label}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default Navigation;
