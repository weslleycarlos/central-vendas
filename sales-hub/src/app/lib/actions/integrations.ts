'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ShopeeClient } from '@/lib/integrations/shopee';
import { revalidatePath } from 'next/cache';

export async function publishProducts(formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { error: 'Unauthorized' };
    }

    const platformId = formData.get('platformId') as string;
    const productIds = (formData.get('productIds') as string).split(',');

    if (!platformId || productIds.length === 0) {
        return { error: 'Missing platform or products' };
    }

    // 1. Get Connection
    const connection = await prisma.tenantConnection.findUnique({
        where: {
            tenantId_platformId: {
                tenantId: session.user.tenantId,
                platformId: platformId
            }
        },
        include: { platform: true }
    });

    if (!connection || !connection.accessToken) {
        return { error: 'Not connected to this platform' };
    }

    // 2. Get Platform Config (Admin)
    const platform = connection.platform;
    if (!platform.appId || !platform.appSecret) {
        return { error: 'Platform not configured by Admin' };
    }

    // 3. Initialize Client
    const client = new ShopeeClient(Number(platform.appId), platform.appSecret, true); // Sandbox

    // 4. Process Products
    const results = [];
    for (const productId of productIds) {
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId }
            });

            if (!product) continue;

            // Call Shopee API
            const response = await client.publishProduct(product, connection.accessToken, connection.accountId!);

            // Update/Create Listing
            await prisma.productListing.upsert({
                where: {
                    productId_connectionId: {
                        productId: productId,
                        connectionId: connection.id
                    }
                },
                update: {
                    status: 'SYNCED',
                    externalId: String(response.item_id),
                    lastSync: new Date(),
                    errorMessage: null
                },
                create: {
                    productId: productId,
                    connectionId: connection.id,
                    status: 'SYNCED',
                    externalId: String(response.item_id),
                    lastSync: new Date()
                }
            });

            results.push({ productId, status: 'success' });

        } catch (error: any) {
            console.error(`Error publishing product ${productId}:`, error);

            // Log error in Listing
            await prisma.productListing.upsert({
                where: {
                    productId_connectionId: {
                        productId: productId,
                        connectionId: connection.id
                    }
                },
                update: {
                    status: 'ERROR',
                    errorMessage: error.message,
                    lastSync: new Date()
                },
                create: {
                    productId: productId,
                    connectionId: connection.id,
                    status: 'ERROR',
                    errorMessage: error.message,
                    lastSync: new Date()
                }
            });

            results.push({ productId, status: 'error', message: error.message });
        }
    }

    revalidatePath(`/dashboard/integrations/${platformId}/products`);
    return { success: true, results };
}
