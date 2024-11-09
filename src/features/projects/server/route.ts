import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ID, Models, Query } from 'node-appwrite';
import { getMember } from '@/features/members/queries';
import { sessionMiddleware } from '@/lib/session-middleware';
import { ApiResponse } from '@/lib/api-response';
import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  PROJECTS_ID,
  TASKS_ID,
} from '@/lib/config';
import { createProjectSchema, updateProjectSchema } from '../schemas';
import { Project } from '../types';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { TaskStatus } from '@/features/tasks/types';

const app = new Hono()
  .get(
    '/',
    sessionMiddleware,
    zValidator('query', z.object({ workspaceId: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid('query');

      const databases = c.get('databases');
      const user = c.get('user');

      if (!workspaceId) {
        return c.json(
          new ApiResponse<object>({
            success: false,
            statusCode: 400,
            message: 'Missing workspaceId',
            data: {},
          }),
          400
        );
      }

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

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        [Query.equal('workspaceId', workspaceId), Query.orderDesc('$createdAt')]
      );

      return c.json(
        new ApiResponse({
          statusCode: 200,
          message: 'Projects fetched successfully.',
          data: projects,
          success: true,
        }),
        200
      );
    }
  )
  .get('/:projectId', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    if (!project) {
      return c.json(
        new ApiResponse<object>({
          success: false,
          statusCode: 404,
          message: 'Project not found',
          data: {},
        }),
        404
      );
    }

    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
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

    return c.json(
      new ApiResponse<Project>({
        success: true,
        statusCode: 200,
        message: 'Project fetched successfully.',
        data: project,
      }),
      200
    );
  })
  .post(
    '/',
    sessionMiddleware,
    zValidator('form', createProjectSchema),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');
      const storage = c.get('storage');

      const { name, image, workspaceId } = c.req.valid('form');

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

        const existingProject = await databases.listDocuments(
          DATABASE_ID,
          PROJECTS_ID,
          [Query.equal('name', name), Query.equal('workspaceId', workspaceId)]
        );

        if (name === existingProject.documents[0]?.name) {
          return c.json(
            new ApiResponse<object>({
              statusCode: 400,
              message: 'Project already exists',
              data: {},
              success: false,
            }),
            400
          );
        }

        const project = await databases.createDocument(
          DATABASE_ID,
          PROJECTS_ID,
          ID.unique(),
          {
            name,
            workspaceId,
            imageUrl: uploadedImageUrl,
          }
        );

        return c.json(
          new ApiResponse<Models.Document>({
            success: true,
            statusCode: 201,
            message: 'Project created',
            data: project,
          }),
          201
        );
      } catch (error: unknown) {
        console.error('Error creating project:', error);

        let errorMessage = 'An error occurred while creating the project.';
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
  .patch(
    '/:projectId',
    sessionMiddleware,
    zValidator('form', updateProjectSchema),
    async (c) => {
      const databases = c.get('databases');
      const storage = c.get('storage');
      const user = c.get('user');

      const { projectId } = c.req.param();
      const { name, image } = c.req.valid('form');

      try {
        const existingProject = await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId
        );
        const member = await getMember({
          userId: user.$id,
          workspaceId: existingProject.workspaceId,
          databases,
        });

        if (!member) {
          return c.json(
            new ApiResponse<Project | object>({
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

        const project = await databases.updateDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
          {
            name,
            imageUrl: uploadedImageUrl,
          }
        );

        if (!project) {
          return c.json(
            new ApiResponse<Project | object>({
              statusCode: 400,
              message: 'Failed to update Project.',
              data: {},
              success: false,
            }),
            400
          );
        }

        return c.json(
          new ApiResponse<Project>({
            statusCode: 200,
            message: 'Project updated successfully.',
            data: project,
            success: true,
          })
        );
      } catch (error: unknown) {
        console.error('Error updating Project:', error);

        let errorMessage = 'An error occurred while updating the Project.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        return c.json(
          new ApiResponse<Project | object>({
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
  .delete('/:projectId', sessionMiddleware, async (c) => {
    const databases = c.get('databases');
    const user = c.get('user');
    const { projectId } = c.req.param();

    try {
      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId
      );

      const member = await getMember({
        databases,
        workspaceId: existingProject.workspaceId,
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

      // TODO:: delete members, projects, and tasks

      await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, projectId);

      return c.json(
        new ApiResponse<{ $id: string }>({
          success: true,
          statusCode: 200,
          message: 'Workspace deleted successfully',
          data: { $id: existingProject.$id },
        }),
        200
      );
    } catch (error: unknown) {
      console.error('Error deleting workspace:', error);

      let errorMessage = 'An error occurred while deleting the workspace.';
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
  .get('/:projectId/analytics', sessionMiddleware, async (c) => {
    const user = c.get('user');
    const databases = c.get('databases');

    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId
    );

    const member = await getMember({
      userId: user.$id,
      workspaceId: project.workspaceId,
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
        Query.equal('projectId', projectId),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('projectId', projectId),
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
        Query.equal('projectId', projectId),
        Query.equal('assigneeId', member.$id),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('projectId', projectId),
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
        Query.equal('projectId', projectId),
        Query.notEqual('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('projectId', projectId),
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
        Query.equal('projectId', projectId),
        Query.equal('status', TaskStatus.DONE),
        Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
        Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
      ]
    );

    const lastMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal('projectId', projectId),
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
        Query.equal('projectId', projectId),
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
        Query.equal('projectId', projectId),
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
