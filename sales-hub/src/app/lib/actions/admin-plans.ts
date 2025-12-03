'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPlan(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const price = Number(formData.get('price'));
    const maxProducts = Number(formData.get('maxProducts'));
    const maxOrders = Number(formData.get('maxOrders'));
    const maxUsers = Number(formData.get('maxUsers'));

    if (!name || !slug || isNaN(price)) {
        return { error: 'Invalid data' };
    }

    try {
        await prisma.plan.create({
            data: {
                name,
                slug,
                price,
                maxProducts,
                maxOrders,
                maxUsers,
                active: true
            }
        });

        revalidatePath('/admin/plans');
        return { success: true };
    } catch (error) {
        console.error('Error creating plan:', error);
        return { error: 'Failed to create plan' };
    }
}

export async function updatePlan(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const maxProducts = formData.get('maxProducts') as string;
    const maxOrders = formData.get('maxOrders') as string;
    const maxUsers = formData.get('maxUsers') as string;
    const maxIntegrations = formData.get('maxIntegrations') as string;
    const active = formData.get('active') === 'on';

    if (!id || !name || !slug || !price) {
        return { error: 'Missing required fields' };
    }

    try {
        await prisma.plan.update({
            where: { id },
            data: {
                name,
                slug,
                description,
                price: Number(price),
                maxProducts: Number(maxProducts),
                maxOrders: Number(maxOrders),
                maxUsers: Number(maxUsers),
                maxIntegrations: Number(maxIntegrations),
                active
            }
        });

        revalidatePath('/admin/plans');
    } catch (error) {
        console.error('Error updating plan:', error);
        throw new Error('Failed to update plan');
    }
    redirect('/admin/plans');
}
