'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

export async function inviteUser(formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error('Unauthorized');
    }

    const tenantId = session.user.tenantId;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !role || !password) {
        throw new Error('Missing fields');
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new Error('User already exists');
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
            throw new Error('Tenant not found');
        }

        if (tenant.planRel) {
            const currentUsers = tenant._count.users;
            const maxUsers = tenant.planRel.maxUsers;

            if (currentUsers >= maxUsers) {
                throw new Error(`Limite de usuários atingido (${currentUsers}/${maxUsers}). Faça upgrade do plano.`);
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
    } catch (error: any) {
        console.error('Error inviting user:', error);
        throw new Error(error.message || 'Failed to invite user');
    }
}

export async function adminChangePassword(formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId || session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
        throw new Error('Unauthorized');
    }

    const userId = formData.get('userId') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!userId || !newPassword || newPassword.length < 6) {
        throw new Error('Invalid data');
    }

    try {
        // Verify user belongs to tenant
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.tenantId !== session.user.tenantId) {
            throw new Error('User not found');
        }

        await prisma.user.update({
            where: { id: userId },
            data: { password: await hash(newPassword, 10) }
        });

        revalidatePath('/dashboard/settings');
    } catch (error) {
        console.error('Error changing user password:', error);
        throw new Error('Failed to change password');
    }
}
