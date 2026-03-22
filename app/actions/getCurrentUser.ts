import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { toSafeUserDto } from '@/app/lib/userDto';
import type { AuthOptions } from 'next-auth';
import { headers } from 'next/headers'; // 👈 Next.js-ийн headers-ийг импортлов

export default async function getCurrentUser() {

    headers();

    const session = await getServerSession(authOptions as AuthOptions);

    try {
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

        return toSafeUserDto(currentUser);

    } catch (error: unknown) {
        console.error('getCurrentUser error:', error);
        return null;
    }
}
