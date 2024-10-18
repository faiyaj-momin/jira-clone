import { Models, Query } from 'node-appwrite';
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from '@/lib/config';
import { getMember } from '@/features/members/queries';
import { type Workspace } from './types';
import { createSessionClient } from '@/lib/appwrite';

export const getWrokspaces = async () => {
  try {
    const { account, databases } = await createSessionClient();

    const user = await account.get();

    const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
      Query.equal('userId', user.$id),
    ]);

    if (members.total === 0) {
      return { documents: [], total: 0 };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const workspaceIds = members.documents.map(
      (member: Models.Document) => member.workspaceId
    );

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.orderDesc('$createdAt'), Query.contains('$id', workspaceIds)]
    );

    return workspaces;
  } catch {
    return { documents: [], total: 0 };
  }
};

interface GetWrokspaceProps {
  workspaceId: string;
}

export const getWrokspace = async ({ workspaceId }: GetWrokspaceProps) => {
  try {
    const { account, databases } = await createSessionClient();

    const user = await account.get();

    if (!user) return null;

    const member = await getMember({
      userId: user.$id,
      databases,
      workspaceId,
    });

    if (!member) return null;

    const workspaces = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    if (!workspaces) return null;

    return workspaces;
  } catch (error) {
    console.error(error);
    return null;
  }
};

interface GetWrokspaceInfoProps {
  workspaceId: string;
}

export const getWrokspaceInfo = async ({
  workspaceId,
}: GetWrokspaceInfoProps) => {
  try {
    const { account, databases } = await createSessionClient();

    const user = await account.get();

    if (!user) return null;

    const workspaces = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    if (!workspaces) return null;

    return {
      name: workspaces.name,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
