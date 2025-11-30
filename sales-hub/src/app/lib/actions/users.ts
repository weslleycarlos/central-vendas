'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

export async function inviteUser(formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { error: 'Unauthorized' };
    }

    const tenantId = session.user.tenantId;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !role || !password) {
        return { error: 'Missing fields' };
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: 'User already exists' };
        }

        // Check Plan Limits
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                planRel: true,
                _count: { select: { users: true } }
            }
        });

        if (!tenant) {
            return { error: 'Tenant not found' };
        }

        if (tenant.planRel) {
            const currentUsers = tenant._count.users;
            const maxUsers = tenant.planRel.maxUsers;

            if (currentUsers >= maxUsers) {
                return { error: `Limite de usuários atingido (${currentUsers}/${maxUsers}). Faça upgrade do plano.` };
            }
        }

        // Create User
        await prisma.user.create({
            data: {
                name,
                email,
                role,
                tenantId,
                password: await hash(password, 10)
            }
        });

        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Error inviting user:', error);
        return { error: 'Failed to invite user' };
    }
}

export async function adminChangePassword(formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    const userId = formData.get('userId') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!userId || !newPassword || newPassword.length < 6) {
        return { error: 'Invalid data' };
    }

    try {
        // Verify user belongs to tenant
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.tenantId !== session.user.tenantId) {
            return { error: 'User not found' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { password: await hash(newPassword, 10) }
        });

        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error('Error changing user password:', error);
        return { error: 'Failed to change password' };
    }
}
