import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;
        const tenantId = session.metadata?.tenantId;

        if (!tenantId) {
            return new NextResponse('Tenant ID is missing from metadata', { status: 400 });
        }

        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                stripeCustomerId: subscription.customer as string,
                planId: session.metadata?.planId, // Assuming planId is passed in metadata
                status: 'ACTIVE'
            }
        });

        await prisma.subscription.create({
            data: {
                tenantId: tenantId,
                stripeSubscriptionId: subscription.id,
                status: subscription.status,
                planId: session.metadata?.planId as string,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
            }
        });
    }

    if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        // Find tenant by stripe subscription id (via Subscription model)
        const subscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId },
            include: { tenant: true }
        });

        if (subscription) {
            await prisma.invoice.create({
                data: {
                    tenantId: subscription.tenantId,
                    subscriptionId: subscription.id,
                    stripeInvoiceId: invoice.id,
                    amount: invoice.amount_paid / 100, // Stripe amount is in cents
                    status: 'PAID',
                    pdfUrl: invoice.hosted_invoice_url,
                    paidAt: new Date(invoice.status_transitions.paid_at! * 1000)
                }
            });

            // Update subscription period
            const stripeSub = await stripe.subscriptions.retrieve(subscriptionId) as any;
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                    currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                    status: stripeSub.status
                }
            });
        }
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as any;

        await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
            }
        });
    }

    // Log the event
    await prisma.activityLog.create({
        data: {
            action: 'WEBHOOK_RECEIVED',
            entity: 'STRIPE',
            entityId: event.id,
            details: `Received event ${event.type}`,
            metadata: JSON.stringify(event),
            status: 'SUCCESS'
        }
    });

    return new NextResponse(null, { status: 200 });
}
