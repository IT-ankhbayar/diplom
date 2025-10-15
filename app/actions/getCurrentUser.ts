import prisma from '@/app/libs/prismadb';

// Lazily import getServerSession and authOptions at runtime so Next's static
// analysis doesn't detect `headers()` usage during the build phase. This
// prevents DYNAMIC_SERVER_USAGE errors when other server modules import this
// file during build-time operations (like API route bundling).
async function getSession() {
    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/pages/api/auth/[...nextauth]');
    return await getServerSession(authOptions as any);
}

export default async function getCurrentUser() {
    try {
        // `getServerSession` may return a session-like object; use `any` locally
        // because we imported it dynamically. We still guard runtime access.
        const session: any = await getSession();

        if (!session?.user?.email) {
            return null;
        }

        const currentUser = await prisma.user.findUnique({
            where: {
                email: session.user.email as string
            }
        });

        if (!currentUser) {
            return null;
        }

        return {
            ...currentUser,
            createdAt: currentUser.createdAt.toISOString(),
            updatedAt: currentUser.updatedAt.toISOString(),
            emailVerified: currentUser.emailVerified?.toISOString() || null,
            role: currentUser.role,
            verified: currentUser.verified,
            verificationImage: currentUser.verificationImage
        };
        
    } catch (error: unknown) {
        // Log the error for debugging; keep return value consistent
        // `unknown` avoids use of `any` and satisfies lint rules when we reference it.
        console.error('getCurrentUser error:', error);
        return null;
    }
}