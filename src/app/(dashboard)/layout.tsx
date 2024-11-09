import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import { CreateProjectModal } from '@/features/projects/components/create-project-modal';
import { CreateTaskModal } from '@/features/tasks/components/create-task-modal';
import { EditTaskModal } from '@/features/tasks/components/edit-task-modal';
import { CreateWorkspaceModal } from '@/features/workspaces/components/create-workspace-modal';
import { Suspense } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense>
      <div className="min-h-screen relative">
        <CreateWorkspaceModal />
        <CreateProjectModal />
        <CreateTaskModal />
        <EditTaskModal />
        <div className="flex w-full h-full">
          <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
            <Sidebar />
          </div>
          <div className="lg:pl-[264px] w-full">
            <div className="mx-auto max-w-screen-2xl h-full">
              <Navbar />
              <main className="h-full px-8 py-6 flex flex-col">{children}</main>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
