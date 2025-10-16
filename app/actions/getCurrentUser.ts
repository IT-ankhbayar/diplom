import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import type { AuthOptions } from 'next-auth';
import { headers } from 'next/headers'; // 👈 Next.js-ийн headers-ийг импортлов

export default async function getCurrentUser() {
    // 💡 АЛДААГ АРИЛГАХ ГОЛ АЛХАМ: 
    // headers() функцийг дуудаж, энэ функцийг ашиглаж буй
    // бүх хуудсыг ХАМГИЙН ЭХЭНД Dynamic болгоно.
    headers(); 
    
    // getServerSession-ийг try/catch-ээс гадна үлдээх нь зөв.
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