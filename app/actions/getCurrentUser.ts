import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import type { AuthOptions } from 'next-auth';

export default async function getCurrentUser() {
    try {
        const session = await getServerSession(authOptions as AuthOptions);

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
        console.error('getCurrentUser error:', error);
        return null;
    }
}
