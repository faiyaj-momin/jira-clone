import { redirect } from 'next/navigation';

import { getCurrent } from '@/features/auth/queries';
import MembersList from '@/features/members/components/members-list';
import { Suspense } from 'react';

const WorkspaceIdMembersPage = async () => {
  const user = await getCurrent();
  if (!user) redirect('/sign-in');

  return (
    <div
      className="w-ful lg:max-w-[576px]"
      style={{
        width: 576,
      }}
    >
      <Suspense fallback={<h1>Loading...</h1>}>
        <MembersList />
      </Suspense>
    </div>
  );
};

export default WorkspaceIdMembersPage;
