'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateTenantSettings(formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error('Unauthorized');
    }

    const tenantId = session.user.tenantId;

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zipCode = formData.get('zipCode') as string;
    const primaryColor = formData.get('primaryColor') as string;

    try {
        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name,
                email,
                phone,
                address,
                city,
                state,
                zipCode,
                primaryColor
            }
        });

        revalidatePath('/dashboard/settings');
    } catch (error) {
        console.error('Error updating settings:', error);
        throw new Error('Failed to update settings');
    }
}
