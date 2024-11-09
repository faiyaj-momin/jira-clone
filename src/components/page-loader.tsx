import { Loader } from 'lucide-react';

export const PageLoader = () => {
  return (
    <div className="h-screen flex flex-col gap-y-2 items-center justify-center">
      <Loader className="animate-spin size-8 text-muted-foreground" />
    </div>
  );
};
