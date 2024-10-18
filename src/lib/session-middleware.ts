import 'server-only';

import {
  Client,
  Account,
  Storage,
  Databases,
  type Account as AccountType,
  type Databases as DatabaseType,
  type Storage as StorageType,
  type Users as UsersType,
  Models,
} from 'node-appwrite';

import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';

import { AUTH_COOKIE } from '@/features/auth/constants';

type AdditionalContext = {
  Variables: {
    account: AccountType;
    storage: StorageType;
    databases: DatabaseType;
    users: UsersType;
    user: Models.User<Models.Preferences>;
  };
};

/**
 * Session middleware
 *
 * @function sessionMiddleware
 * @param {Hono.Context} c - The Hono context object
 * @param {() => Promise<void>} next - The next middleware in the stack
 * @returns {Promise<void>} Next middleware
 *
 * @description
 * This middleware checks for the presence of an Appwrite session cookie
 * and sets the `account` and `user` variables in the context object.
 * If the cookie is not present, it returns a 401 response.
 */
export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

    const session = getCookie(c, AUTH_COOKIE);

    if (!session) {
      return c.json({ success: false, message: 'Unauthorized' }, 401);
    }

    client.setSession(session);

    const account = new Account(client);
    const storage = new Storage(client);
    const databases = new Databases(client);

    const user = await account.get();

    c.set('account', account);
    c.set('storage', storage);
    c.set('databases', databases);
    c.set('user', user);

    await next();
  }
);
