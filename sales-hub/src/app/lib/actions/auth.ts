'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function changePassword(formData: FormData) {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: 'Unauthorized' };
    }

    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!newPassword || newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'Passwords do not match' };
    }

    try {
        const hashedPassword = await hash(newPassword, 10);

        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        console.error('Error changing password:', error);
        return { error: 'Failed to change password' };
    }
}
