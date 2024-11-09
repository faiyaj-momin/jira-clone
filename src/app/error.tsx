'use client';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const ErrorPage = () => {
  return (
    <div className="h-screen flex flex-col gap-y-2 items-center justify-center">
      <AlertTriangle className="size-6" />
      <p className="text-sm text-muted-foreground">Something went wrong</p>
      <Button variant="secondary" size="sm" asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
};

export default ErrorPage;
