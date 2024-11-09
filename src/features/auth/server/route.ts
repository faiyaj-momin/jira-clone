import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ID } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite';

import { deleteCookie, setCookie } from 'hono/cookie';

import { AUTH_COOKIE } from '../constants';
import { loginSchema, registerSchema } from '../schemas';
import { sessionMiddleware } from '@/lib/session-middleware';
import { ApiResponse } from '@/lib/api-response';

const app = new Hono()
  .get('/current', sessionMiddleware, async (c) => {
    const user = c.get('user');

    return c.json({ data: user });
  })
  .post('/login', zValidator('json', loginSchema), async (c) => {
    try {
      const { email, password } = c.req.valid('json');

      const { account } = await createAdminClient();

      const session = await account.createEmailPasswordSession(email, password);
      setCookie(c, AUTH_COOKIE, session.secret, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
      });

      if (!session) {
        return c.json(
          new ApiResponse<object>({
            success: false,
            statusCode: 401,
            message: 'Invalid credentials',
            data: {},
          }),
          401
        );
      }

      // console.log(email, password, session);
      return c.json(
        new ApiResponse<object>({
          success: true,
          statusCode: 200,
          message: 'Login successful',
          data: session,
        }),
        200
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.startsWith('Invalid credentials')) {
          return c.json(
            new ApiResponse<object>({
              statusCode: 401,
              message:
                'Invalid credentials. Please check the email and password.',
              data: {},
              success: false,
            }),
            401
          );
        }

        console.error('Error logging in:', error.message);
      }

      return c.json(
        new ApiResponse<object>({
          statusCode: 500,
          message: 'An error occurred while updating the workspace.',
          data: {},
          success: false,
        }),
        500
      );
    }
  })
  .post('/register', zValidator('json', registerSchema), async (c) => {
    try {
      const { name, email, password } = c.req.valid('json');

      const { account } = await createAdminClient();

      await account.create(ID.unique(), email, password, name);

      const session = await account.createEmailPasswordSession(email, password);

      setCookie(c, AUTH_COOKIE, session.secret, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
      });
      // console.log(name, email, password);

      return c.json(
        new ApiResponse({
          success: true,
          statusCode: 201,
          message: 'Registration successful. please verify your email.',
          data: session,
        }),
        201
      );
    } catch (error: unknown) {
      console.error('Error while user registering:', error);

      let errorMessage = 'An error occurred while user registering.';
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
  .post('/logout', sessionMiddleware, async (c) => {
    const account = c.get('account');

    try {
      deleteCookie(c, AUTH_COOKIE);
      deleteCookie(c, 'current-workspace');
      await account.deleteSession('current');

      return c.json(
        new ApiResponse<object>({
          success: true,
          statusCode: 200,
          message: 'Logout successful',
          data: {},
        }),
        200
      );
    } catch (error: unknown) {
      console.error('Error while user logout:', error);

      let errorMessage = 'An error occurred while user logout.';
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
  });

export default app;
