import { redirect } from 'next/navigation';

import { getCurrent } from '@/features/auth/queries';
import MembersList from '@/features/members/components/members-list';

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
      <MembersList />
    </div>
  );
};

export default WorkspaceIdMembersPage;
