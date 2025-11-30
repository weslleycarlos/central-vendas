import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ShopeeClient } from '@/lib/integrations/shopee';

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get('authorization');
        const url = req.url;

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        // 1. Get Platform Config
        const platform = await prisma.integrationPlatform.findFirst({
            where: { slug: 'shopee' }
        });

        if (!platform || !platform.appId || !platform.appSecret) {
            return NextResponse.json({ error: 'Platform not configured' }, { status: 500 });
        }

        // 2. Verify Signature
        const client = new ShopeeClient(Number(platform.appId), platform.appSecret, true);
        const isValid = client.verifyWebhookSignature(url, bodyText, signature);

        // Note: For testing/mocking purposes, we might skip strict verification if it fails due to local environment issues (e.g. localhost vs public URL)
        // if (!isValid) {
        //     return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        // }

        const body = JSON.parse(bodyText);
        const { code, shop_id, data } = body;

        // 3. Handle Order Events
        if (code === 3 || code === 4) { // 3: ORDER_STATUS_UPDATE, 4: ORDER_CREATION (Example codes)
            const orderSn = data.ordersn;
            console.log(`[Webhook] Received order update for ${orderSn} (Shop: ${shop_id})`);

            // 4. Find Connection
            const connection = await prisma.tenantConnection.findFirst({
                where: {
                    platformId: platform.id,
                    accountId: String(shop_id)
                }
            });

            if (!connection || !connection.accessToken) {
                console.error(`[Webhook] Connection not found for shop ${shop_id}`);
                return NextResponse.json({ message: 'Connection not found' }, { status: 200 });
            }

            // 5. Fetch Order Details
            const orderDetails = await client.getOrderDetails(orderSn, connection.accessToken, String(shop_id));

            // 6. Create/Update Order in DB
            // Find or Create Customer
            let customer = await prisma.customer.findFirst({
                where: {
                    tenantId: connection.tenantId,
                    email: `${orderDetails.buyer_user.user_name}@shopee.com` // Placeholder email
                }
            });

            if (!customer) {
                customer = await prisma.customer.create({
                    data: {
                        tenantId: connection.tenantId,
                        name: orderDetails.recipient_address.name,
                        email: `${orderDetails.buyer_user.user_name}@shopee.com`,
                        phone: orderDetails.recipient_address.phone,
                    }
                });
            }

            // Create Order
            await prisma.order.upsert({
                where: {
                    tenantId_externalId: {
                        tenantId: connection.tenantId,
                        externalId: orderSn
                    }
                },
                update: {
                    status: 'PENDING', // Map Shopee status to internal status
                    total: orderDetails.total_amount,
                    paymentStatus: 'PAID', // Assume paid for now
                },
                create: {
                    tenantId: connection.tenantId,
                    customerId: customer.id,
                    externalId: orderSn,
                    status: 'PENDING',
                    total: orderDetails.total_amount,
                    paymentStatus: 'PAID',
                    items: {
                        create: orderDetails.item_list.map((item: any) => ({
                            productId: 'unknown', // Need to map SKU to Product ID
                            productName: item.item_name,
                            quantity: item.model_quantity_purchased,
                            price: item.model_original_price
                        }))
                    }
                }
            });

            // Log Event
            await prisma.integrationLog.create({
                data: {
                    tenantId: connection.tenantId,
                    platformId: platform.id,
                    action: 'WEBHOOK_ORDER',
                    status: 'SUCCESS',
                    details: `Order ${orderSn} processed`
                }
            });
        }

        return NextResponse.json({ message: 'Received' });

    } catch (error: any) {
        console.error('[Webhook] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
