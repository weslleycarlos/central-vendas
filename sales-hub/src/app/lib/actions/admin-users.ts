'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

export async function logActivity(
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    details?: string,
    status: string = 'SUCCESS'
) {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details,
                status
            }
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}

export async function createInternalUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!name || !email || !password || !role) {
        return { error: 'Missing required fields' };
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: 'User already exists' };
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: await hash(password, 10),
                role,
                tenantId: null, // Internal user
                active: true
            }
        });

        await logActivity(
            session.user.id!,
            'CREATE',
            'USER',
            newUser.id,
            `Created internal user ${email} with role ${role}`
        );

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error creating internal user:', error);
        return { error: 'Failed to create user' };
    }
}

export async function updateInternalUserStatus(userId: string, active: boolean) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { active }
        });

        await logActivity(
            session.user.id!,
            'UPDATE',
            'USER',
            userId,
            `Updated user status to ${active ? 'Active' : 'Inactive'}`
        );

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error updating user status:', error);
        return { error: 'Failed to update user status' };
    }
}
