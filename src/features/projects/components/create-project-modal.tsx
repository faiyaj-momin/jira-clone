'use client';
import { ResponsiveModal } from '@/components/ui/responsive-modal';

import { CreateProjectForm } from './create-project-form';
import { useCreateProjectModal } from '../hooks/use-create-project-modal';

export const CreateProjectModal = () => {
  const { isOpen, close, setIsOpen } = useCreateProjectModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateProjectForm onCancel={close} />
    </ResponsiveModal>
  );
};
