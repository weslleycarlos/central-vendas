'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function createTenant(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const document = formData.get('document') as string;
    const planId = formData.get('planId') as string;
    const adminName = formData.get('adminName') as string;
    const adminEmail = formData.get('adminEmail') as string;
    const adminPassword = formData.get('adminPassword') as string;

    if (!name || !slug || !adminEmail || !adminPassword || !planId) {
        return { error: 'Missing required fields' };
    }

    try {
        // Check if slug exists
        const existingTenant = await prisma.tenant.findUnique({
            where: { slug }
        });

        if (existingTenant) {
            return { error: 'Slug already exists' };
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingUser) {
            return { error: 'User email already exists' };
        }

        // Fetch plan details to set initial limits (optional, if we copy limits to tenant)
        // For now, we rely on the relation.

        // Transaction to create tenant and admin user
        await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    slug,
                    document,
                    planId, // Link to Plan model
                    plan: 'CUSTOM', // Legacy field, maybe keep or ignore
                    status: 'ACTIVE'
                }
            });

            await tx.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: await hash(adminPassword, 10),
                    role: 'ADMIN',
                    tenantId: tenant.id
                }
            });
        });

        revalidatePath('/admin/tenants');
        return { success: true };
    } catch (error) {
        console.error('Error creating tenant:', error);
        return { error: 'Failed to create tenant' };
    }
}

export async function updateTenantStatus(tenantId: string, status: string) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { status }
        });

        revalidatePath(`/admin/tenants/${tenantId}`);
        revalidatePath('/admin/tenants');
        return { success: true };
    } catch (error) {
        console.error('Error updating tenant status:', error);
        return { error: 'Failed to update status' };
    }
}

export async function updateTenantPlan(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    const tenantId = formData.get('tenantId') as string;
    const planId = formData.get('planId') as string;

    if (!tenantId || !planId) {
        return { error: 'Missing fields' };
    }

    try {
        await prisma.tenant.update({
            where: { id: tenantId },
            data: { planId }
        });

        revalidatePath(`/admin/tenants/${tenantId}`);
        revalidatePath('/admin/tenants');
        return { success: true };
    } catch (error) {
        console.error('Error updating tenant plan:', error);
        return { error: 'Failed to update plan' };
    }
}
