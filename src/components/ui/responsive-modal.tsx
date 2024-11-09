'use client';
import { useMedia } from 'react-use';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from './drawer';

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const ResponsiveModal = ({
  open,
  onOpenChange,
  children,
}: ResponsiveModalProps) => {
  const isDesktop = useMedia('(min-width: 1024px)', true);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full lg:max-w-lg p-0 border-none overflow-y-auto hide-scrollbar max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="sr-only">Responsive Modal</DialogTitle>
            <DialogDescription className="sr-only">
              Responsive Modal
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="sr-only">Responsive Modal</DrawerTitle>
          <DrawerDescription className="sr-only">
            Responsive Modal
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-auto hide-scrollbar max-h-[85vh]">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
