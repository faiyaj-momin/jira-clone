import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface PageErrorProps {
  message: string;
}

const PageError = ({ message = 'Something went wrong' }: PageErrorProps) => {
  return (
    <div className="h-screen flex flex-col gap-y-2 items-center justify-center">
      <AlertTriangle className="size-6 text-muted-foreground mb-2" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
};

export default PageError;
