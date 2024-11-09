import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MemberAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const MemberAvatar = ({
  name,
  className,
  fallbackClassName,
}: MemberAvatarProps) => {
  return (
    <Avatar
      className={cn(
        ' size-5 transition border border-neutral-300 rounded-full',
        className
      )}
    >
      <AvatarFallback
        className={cn(
          'bg-neutral-200 text-neutral-600 uppercase font-medium rounded-full',
          fallbackClassName
        )}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
