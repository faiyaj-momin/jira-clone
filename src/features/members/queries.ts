import { Query, type Databases } from 'node-appwrite';

import { DATABASE_ID, MEMBERS_ID } from '@/lib/config';
import { Member } from './types';

interface GetMemberProps {
  userId: string;
  workspaceId: string;
  databases: Databases;
}

/**
 * Gets a member document from the database by a given user ID and workspace ID.
 * @param {GetMemberProps} props
 * @param {string} props.userId - The user ID to search for.
 * @param {string} props.workspaceId - The workspace ID to search for.
 * @param {Databases} props.databases - The Appwrite Databases service instance.
 * @returns {Promise<{ $id: string } | undefined>} - The member document or undefined if not found.
 */
export const getMember = async ({
  userId,
  workspaceId,
  databases,
}: GetMemberProps): Promise<Member | undefined> => {
  try {
    const members = await databases.listDocuments<Member>(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal('userId', userId), Query.equal('workspaceId', workspaceId)]
    );

    if (members.total === 0) {
      return undefined;
    }

    return members.documents[0];
  } catch (error: unknown) {
    console.error('Error updating workspace:', error);

    return undefined;
  }
};
