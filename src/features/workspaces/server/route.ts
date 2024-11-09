import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { ApiResponse } from '@/lib/api-response';

import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { sessionMiddleware } from '@/lib/session-middleware';
import { ID, Models, Query } from 'node-appwrite';
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  WORKSPACES_ID,
  MEMBERS_ID,
  inviteCodeLength,
  TASKS_ID,
} from '@/lib/config';
import { MemberRole } from '@/features/members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/queries';
import { Workspace } from '../types';
import { z } from 'zod';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { TaskStatus } from '@/features/tasks/types';

const app = new Hono()
  .get('/', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');

    try {
      const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
        Query.equal('userId', user.$id),
      ]);

      if (members.total === 0) {
        return c.json(
          new ApiResponse<object>({
            statusCode: 404,
            message: 'Workspace not found',
            data: {},
            success: false,
          }),
          404
        );
      }

      /**
       * Extracts an array of workspace IDs from the members' documents.
       *
       * @constant {string[]} workspaceIds - An array of workspace IDs.
       * @returns {string[]} An array containing the workspace IDs of each member.
       */
      const workspaceIds: string[] = members.documents.map(
        (member) => member.workspaceId
      );

      const workspaces = await databases.listDocuments<Models.Document>(
        DATABASE_ID,
        WORKSPACES_ID,
        [Query.orderDesc('$createdAt'), Query.contains('$id', workspaceIds)]
      );

      if (workspaces.total === 0) {
        return c.json(
          new ApiResponse<object>({
            statusCode: 404,
            message: 'Workspace not found',
            data: {},
            success: false,
          }),
          404
        );
      }

      // const workspaces = workspacesResult.documents as Workspace[];

      return c.json(
        new ApiResponse<Workspace[]>({
          statusCode: 200,
          message: 'Workspaces retrieved',
          data: workspaces.documents as Workspace[],
          success: true,
        })
      );
    } catch (error: unknown) {
      console.log('Error retrieving workspaces:', error);

      let errorMessage = 'An error occurred while retrieving workspaces.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return c.json(
        new ApiResponse<object>({
          statusCode: 500,
          message: errorMessage,
          data: {},
          success: false,
        }),
        500
      );
    }
  })
  .post(
    '/',
    zValidator('form', createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');
      const storage = c.get('storage');

      const { name, image } = c.req.valid('form');

      let uploadedImageUrl: string | undefined;

      try {
        if (image instanceof File) {
          const file = await storage.createFile(
            IMAGES_BUCKET_ID,
            ID.unique(),
            image
          );

          const arrayBuffer = await storage.getFilePreview(
            IMAGES_BUCKET_ID,
            file.$id
          );

          uploadedImageUrl = `data:image/png;base64,${Buffer.from(
            arrayBuffer
          ).toString('base64')}`;
        }

        const existingWorkspace = await databases.listDocuments(
          DATABASE_ID,
          WORKSPACES_ID,
          [Query.equal('name', name), Query.equal('userId', user.$id)]
        );

        if (name === existingWorkspace.documents[0]?.name) {
          return c.json(
            new ApiResponse<object>({
              statusCode: 400,
              message: 'Workspace already exists',
              data: {},
              success: false,
            }),
            400
          );
        }

        const workspace = await databases.createDocument<Workspace>(
          DATABASE_ID,
          WORKSPACES_ID,
          ID.unique(),
          {
            name,
            userId: user.$id,
            imageUrl: uploadedImageUrl,
            inviteCode: generateInviteCode(inviteCodeLength),
          }
        );

        if (!workspace) {
          throw new Error('Failed to create workspace');
        }

        if (workspace) {
          const members = await databases.createDocument(
            DATABASE_ID,
            MEMBERS_ID,
            ID.unique(),
            {
              userId: user.$id,
              workspaceId: workspace.$id,
              role: MemberRole.ADMIN,
            }
          );

          if (!members) {
            throw new Error('Failed to create member');
          }
        }

        return c.json(
          new ApiResponse<Workspace>({
            success: true,
            statusCode: 201,
            message: 'Workspace created',
            data: workspace,
          }),
          201
        );
      } catch (error: unknown) {
        console.error('Error creating workspace:', error);

        let errorMessage = 'An error occurred while creating the workspace.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        return c.json(
          new ApiResponse<Workspace | object>({
            statusCode: 500,
            message: errorMessage,
            data: {},
            success: false,
          }),
          500
        );
      }
    }
  )
  .patch(
    '/:workspaceId',
    sessionMiddleware,
    zValidator('form', updateWorkspaceSchema),
    async (c) => {
      const databases = c.get('databases');
      const storage = c.get('storage');
      const user = c.get('user');

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid('form');

      try {
        const member = await getMember({
          userId: user.$id,
          workspaceId,
          databases,
        });

        if (!member || member.role !== MemberRole.ADMIN) {
          return c.json(
            new ApiResponse<Workspace | object>({
              statusCode: 401,
              message: 'Unauthorized request',
              data: {},
              success: false,
            }),
            401
          );
        }

        let uploadedImageUrl: string | undefined;

        if (image instanceof File) {
          const file = await storage.createFile(
            IMAGES_BUCKET_ID,
            ID.unique(),
            image
          );

          const arrayBuffer = await storage.getFilePreview(
            IMAGES_BUCKET_ID,
            file.$id
          );

          uploadedImageUrl = `data:image/png;base64,${Buffer.from(
            arrayBuffer
          ).toString('base64')}`;
        } else {
          uploadedImageUrl = image;
        }

        const workspace = await databases.updateDocument<Workspace>(
          DATABASE_ID,
          WORKSPACES_ID,
          workspaceId,
          {
            name,
            imageUrl: uploadedImageUrl,
          }
        );

        if (!workspace) {
          return c.json(
            new ApiResponse<Workspace | object>({
              statusCode: 400,
              message: 'Failed to update workspace.',
              data: {},
              success: false,
            }),
            400
          );
        }

        return c.json(
          new ApiResponse<Workspace>({
            statusCode: 200,
            message: 'Workspace updated successfully.',
            data: workspace,
            success: true,
          })
        );
      } catch (error: unknown) {
        console.error('Error updating workspace:', error);

        let errorMessage = 'An error occurred while updating the workspace.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        return c.json(
          new ApiResponse<Workspace | object>({
            statusCode: 500,
            message: errorMessage,
            data: {},
            success: false,
          }),
          500
        );
      }
    }
  )
  .delete('/:workspaceId', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    try {
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
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

      // TODO:: delete members, projects, and tasks

      await databases.deleteDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);

      return c.json(
        new ApiResponse<{ $id: string }>({
          success: true,
          statusCode: 200,
          message: 'Workspace deleted successfully',
          data: { $id: workspaceId },
        }),
        200
      );
    } catch (error: unknown) {
      console.error('Error updating workspace:', error);

      let errorMessage = 'An error occurred while updating the workspace.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return c.json(
        new ApiResponse<object>({
          statusCode: 500,
          message: errorMessage,
          data: {},
          success: false,
        }),
        500
      );
    }
  })
  .post('/:workspaceId/reset-invite-code', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { workspaceId } = c.req.param();

    try {
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
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

      // TODO:: delete members, projects, and tasks

      const workspace = await databases.updateDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          inviteCode: generateInviteCode(inviteCodeLength),
        }
      );

      return c.json(
        new ApiResponse<Workspace>({
          success: true,
          statusCode: 200,
          message: 'Reset invite code successfully',
          data: workspace,
        }),
        200
      );
    } catch (error: unknown) {
      console.error('Error updating workspace:', error);

      let errorMessage = 'An error occurred while updating the workspace.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return c.json(
        new ApiResponse<object>({
          statusCode: 500,
          message: errorMessage,
          data: {},
          success: false,
        }),
        500
      );
    }
  })
  .post(
    '/:workspaceId/join',
    sessionMiddleware,
    zValidator('json', z.object({ inviteCode: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { inviteCode } = c.req.valid('json');

      const databases = c.get('databases');
      const user = c.get('user');

      try {
        const member = await getMember({
          databases,
          workspaceId,
          userId: user.$id,
        });

        if (member) {
          return c.json(
            new ApiResponse<object>({
              statusCode: 400,
              message: 'You are already a member of this workspace.',
              data: {},
              success: false,
            }),
            400
          );
        }

        const workspace = await databases.getDocument<Workspace>(
          DATABASE_ID,
          WORKSPACES_ID,
          workspaceId
        );

        if (workspace.inviteCode !== inviteCode) {
          return c.json(
            new ApiResponse<object>({
              statusCode: 400,
              message: 'Invalid invite code.',
              data: {},
              success: false,
            }),
            403
          );
        }

        await databases.createDocument(DATABASE_ID, MEMBERS_ID, ID.unique(), {
          userId: user.$id,
          workspaceId,
          role: MemberRole.MEMBER,
        });

        return c.json(
          new ApiResponse<Workspace>({
            statusCode: 200,
            message: 'Joined workspace successfully.',
            data: workspace,
            success: true,
          })
        );
      } catch (error: unknown) {
        console.error('Error joining workspace:', error);

        let errorMessage = 'An error occurred while joining the workspace.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        return c.json(
          new ApiResponse<object>({
            statusCode: 500,
            message: errorMessage,
            data: {},
            success: false,
          }),
          500
        );
      }
    }
  )
  .get('/:workspaceId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { workspaceId } = c.req.param();

    const member = await getMember({
      userId: user.$id,
      workspaceId,
      databases,
    });

    if (!member) {
      return c.json(
        new ApiResponse({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: member,
        }),
        401
      );
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return c.json(
      new ApiResponse<Workspace>({
        success: true,
        statusCode: 200,
        message: 'Workspace fetched successfully',
        data: workspace,
      })
    );
  })
  .get('/:workspaceId/info', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const { workspaceId } = c.req.param();

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    );

    type Response = {
      $id: string;
      name: string;
      imageUrl: string | undefined;
    };
    return c.json(
      new ApiResponse<Response>({
        success: true,
        statusCode: 200,
        message: 'Workspace fetched successfully',
        data: {
          $id: workspace.$id,
          name: workspace.name,
          imageUrl: workspace?.imageUrl,
        },
      })
    );
  })
  .get('/:workspaceId/analytics', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');

    const { workspaceId } = c.req.param();

    const member = await getMember({
      userId: user.$id,
      workspaceId,
      databases,
    });

    if (!member) {
      return c.json(
        new ApiResponse<undefined>({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: undefined,
        }),
        401
      );
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    const taskCount = thisMonthTasks.total;
    const taskDifference = taskCount - lastMonthTasks.total;

    const thisMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('assigneeId', member.$id),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('assigneeId', member.$id),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    const assignedTasksCount = thisMonthAssignedTasks.total;
    const assignedTasksDifference = taskCount - lastMonthAssignedTasks.total;

    const thisMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    const incompleteTaskCount = thisMonthIncompleteTasks.total;
    const incompleteTaskDifference =
      incompleteTaskCount - lastMonthIncompleteTasks.total;

    const thisMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.equal('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
      ]
    );

    const completedTaskCount = thisMonthCompletedTasks.total;
    const completedTaskDifference =
      completedTaskCount - lastMonthCompletedTasks.total;

    const thisMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.lessThan('dueDate', now.toISOString()),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('workspaceId', workspaceId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.lessThan('dueDate', now.toISOString()),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const overdueTaskCount = thisMonthOverdueTasks.total;
    const overdueTaskDifference =
      overdueTaskCount - lastMonthOverdueTasks.total;

    return c.json(
      new ApiResponse({
        success: true,
        statusCode: 200,
        message: 'Analytics fetched successfully',
        data: {
          taskCount,
          taskDifference,
          assignedTasksCount,
          assignedTasksDifference,
          completedTaskCount,
          completedTaskDifference,
          incompleteTaskCount,
          incompleteTaskDifference,
          overdueTaskCount,
          overdueTaskDifference,
        },
      })
    );
  });

export default app;
