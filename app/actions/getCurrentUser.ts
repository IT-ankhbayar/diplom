import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/app/libs/prismadb';

export async function getSession() {
    return await getServerSession(authOptions);
}

export default async function getCurrentUser() {
    try {
        const session = await getSession();

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
        // eslint-disable-next-line no-console
        console.error('getCurrentUser error:', error);
        return null;
    }
}