import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import React from 'react';

export const MemberSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('mb-1', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 transition border border-neutral-300 rounded-full" />
          <div className="flex flex-col gap-y-1">
            <Skeleton className="text-sm font-bold w-32 h-4" />
            <Skeleton className="text-xs text-muted-foreground w-56 h-3" />
          </div>
        </div>
        <Skeleton className="w-8 h-8" />
      </div>
    </div>
  );
};
