import { Hono } from 'hono';
import { APP_ENV } from './config';
import { setCookie } from 'hono/cookie';
import { sessionMiddleware } from './session-middleware';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ApiResponse } from './api-response';

const setCookieSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Cookie name cannot be empty' })
    .max(256, { message: 'Cookie name is too long' }),
  value: z
    .string()
    .min(1, { message: 'Cookie value cannot be empty' })
    .max(2048, { message: 'Cookie value is too long' }),
  days: z.string().optional(),
  path: z.string().min(1, { message: 'Path connot be empty' }).default('/'),
  sameSite: z.enum(['Strict', 'Lax', 'None']).optional().default('Lax'),
});

const app = new Hono().post(
  '/',
  sessionMiddleware,
  zValidator('query', setCookieSchema),
  async (c) => {
    const { name, value, days, path, sameSite } = c.req.valid('query');

    const parseDays = days ? parseInt(days) : null;

    const maxAge = parseDays ? parseDays * 24 * 60 * 60 : 7 * 24 * 60 * 60;

    setCookie(c, name, value, {
      maxAge,
      path,
      sameSite,
      secure: APP_ENV === 'production',
    });
    return c.json(
      new ApiResponse<undefined>({
        success: true,
        statusCode: 200,
        message: 'Cookie set successfully',
        data: undefined,
      })
    );
  }
);

export default app;
