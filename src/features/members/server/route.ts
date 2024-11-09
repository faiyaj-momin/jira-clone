import { createAdminClient } from '@/lib/appwrite';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { getMember } from '../queries';
import { ApiResponse } from '@/lib/api-response';
import { DATABASE_ID, MEMBERS_ID } from '@/lib/config';
import { Query } from 'node-appwrite';
import { Member, MemberRole } from '../types';

const app = new Hono()
  .get(
    '/',
    sessionMiddleware,
    zValidator('query', z.object({ workspaceId: z.string() })),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get('databases');
      const user = c.get('user');
      const { workspaceId } = c.req.valid('query');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json(
          new ApiResponse<object>({
            success: false,
            statusCode: 401,
            message: 'Unauthorized',
            data: {},
          }),
          401
        );
      }

      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal('workspaceId', workspaceId)]
      );

      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name,
            email: user.email,
          };
        })
      );

      return c.json(
        new ApiResponse({
          success: true,
          statusCode: 200,
          message: 'Members retrieved',
          data: {
            ...member,
            members: populatedMembers,
            total: members.total,
          },
        }),
        200
      );
    }
  )
  .delete(':memberId', sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get('user');
    const databases = c.get('databases');
    const memberToDelete = await databases.getDocument(
      DATABASE_ID,
      MEMBERS_ID,
      memberId
    );
    const allMemberInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal('workspaceId', memberToDelete.workspaceId)]
    );

    const member = await getMember({
      databases,
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json(
        new ApiResponse<object>({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: {},
        }),
        401
      );
    }

    if (
      member?.$id !== memberToDelete.$id &&
      member?.role !== MemberRole.ADMIN
    ) {
      return c.json(
        new ApiResponse<object>({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: {},
        }),
        401
      );
    }

    if (allMemberInWorkspace.total === 0) {
      return c.json(
        new ApiResponse<object>({
          success: false,
          statusCode: 400,
          message: 'cannot delete last member in workspace',
          data: {},
        })
      );
    }

    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    return c.json(
      new ApiResponse<{ $id: string }>({
        success: true,
        statusCode: 200,
        message: 'Member deleted',
        data: { $id: memberToDelete.$id },
      }),
      200
    );
  })
  .patch(
    ':memberId',
    sessionMiddleware,
    zValidator('json', z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { role } = c.req.valid('json');
      const { memberId } = c.req.param();
      const user = c.get('user');
      const databases = c.get('databases');
      const memberToUpdate = await databases.getDocument(
        DATABASE_ID,
        MEMBERS_ID,
        memberId
      );
      const allMemberInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal('workspaceId', memberToUpdate.workspaceId)]
      );

      const member = await getMember({
        databases,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json(
          new ApiResponse<object>({
            success: false,
            statusCode: 401,
            message: 'Unauthorized',
            data: {},
          }),
          401
        );
      }

      if (member?.role !== MemberRole.ADMIN) {
        return c.json(
          new ApiResponse<object>({
            success: false,
            statusCode: 401,
            message: 'Unauthorized',
            data: {},
          }),
          401
        );
      }

      if (allMemberInWorkspace.total === 0) {
        return c.json(
          new ApiResponse<object>({
            success: false,
            statusCode: 400,
            message: 'cannot downgrade the only member',
            data: {},
          })
        );
      }

      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        role: role,
      });

      return c.json(
        new ApiResponse<{ $id: string }>({
          success: true,
          statusCode: 200,
          message: 'Member updated',
          data: { $id: memberToUpdate.$id },
        }),
        200
      );
    }
  );

export default app;
