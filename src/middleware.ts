// middleware.js

import { NextRequest, NextResponse } from 'next/server';
import { getWrokspaces } from './features/workspaces/queries';
import { cookies } from 'next/headers';
import { getCurrent } from './features/auth/queries';

// Define the paths that require authorization
const protectedPaths = ['/dashboard', '/profile', '/settings', '/workspaces'];

export async function middleware(request: NextRequest) {
  console.log('middleware working at : ', request.nextUrl.pathname);
  const user = await getCurrent();
  const url = request.nextUrl;
  const workspaceId = cookies().get('current-workspace')?.value;

  let currentWorkspace = workspaceId;
  if (!workspaceId) {
    const workspaces = await getWrokspaces({ limit: 1 });
    currentWorkspace = workspaces.documents[0]?.$id || undefined;
  }

  const requiresAuth = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (
    user &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('sign-up') ||
      url.pathname === '/')
  ) {
    // Redirect to dashboard if token is found

    if (currentWorkspace) {
      const workspaceUrl = new URL(
        `/workspaces/${currentWorkspace}`,
        request.url
      );
      return NextResponse.redirect(workspaceUrl);
    } else {
      const workspaceUrl = new URL('/workspaces/create', request.url);
      return NextResponse.redirect(workspaceUrl);
    }
  }

  if (!user && requiresAuth) {
    // Redirect to login if no token is found
    const signInUrl = new URL('/sign-in', request.url);
    return NextResponse.redirect(signInUrl);
  }
  // If the path doesn't need auth or the user is authorized, continue the request
  return NextResponse.next();
}

// Specify the paths where middleware should be applied
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/workspaces/:path*',
    '/sign-in',
    '/sign-up',
    '/',
  ],
};
