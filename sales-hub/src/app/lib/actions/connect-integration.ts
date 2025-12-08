'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ShopeeClient } from '@/lib/integrations/shopee';
import { redirect } from 'next/navigation';

export async function connectIntegration(formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error('Unauthorized');
    }

    const platformId = formData.get('platformId') as string;
    if (!platformId) {
        throw new Error('Missing platform ID');
    }

    // 1. Get Platform Config
    const platform = await prisma.integrationPlatform.findUnique({
        where: { id: platformId }
    });

    if (!platform || !platform.isActive) {
        throw new Error('Platform not active or found');
    }

    if (!platform.appId || !platform.appSecret) {
        throw new Error('Platform not configured by Admin');
    }

    // 2. Initialize Client
    const client = new ShopeeClient(Number(platform.appId), platform.appSecret, true); // Sandbox

    // 3. Generate Auth URL
    // In production, this would be your actual domain
    const redirectUrl = `http://localhost:3000/api/integrations/auth/${platform.slug}/callback`;
    const authUrl = client.getAuthUrl(redirectUrl);

    // 4. Redirect User
    redirect(authUrl);
}
