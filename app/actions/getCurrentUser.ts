import prisma from '@/app/libs/prismadb';

async function getSession() {
    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/pages/api/auth/[...nextauth]');
    return await getServerSession(authOptions as any);
}

export default async function getCurrentUser() {
    try {
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
        console.error('getCurrentUser error:', error);
        return null;
    }
}
