'use server';

import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createCheckoutSession(planId: string) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error('Unauthorized');
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id: session.user.tenantId },
        include: { planRel: true }
    });

    if (!tenant) {
        throw new Error('Tenant not found');
    }

    // Map internal plan ID to Stripe Price ID
    // In a real app, you'd store stripePriceId in the Plan model
    // For now, we'll assume the planId passed IS the Stripe Price ID or map it
    // Let's assume we need to fetch the plan to get the price ID, 
    // but for simplicity, let's say the UI passes the Stripe Price ID directly 
    // OR we store stripePriceId in our Plan model.

    // Let's update Plan model to have stripePriceId later. 
    // For now, we'll mock it or expect the planId to be the stripePriceId if we were using it directly.
    // BUT, we are using our internal planId. So we need to find the plan.

    const plan = await prisma.plan.findUnique({
        where: { id: planId }
    });

    if (!plan) {
        throw new Error('Plan not found');
    }

    // HARDCODED MAPPING FOR DEMO (You should add stripePriceId to Plan model)
    // Replace these with your actual Stripe Price IDs
    const stripePriceId = 'price_1Q...';

    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: tenant.stripeCustomerId || undefined,
            line_items: [
                {
                    price: stripePriceId, // Use dynamic ID in production
                    quantity: 1,
                },
            ],
            metadata: {
                tenantId: tenant.id,
                planId: plan.id,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
        });

        if (checkoutSession.url) {
            redirect(checkoutSession.url);
        }
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new Error('Failed to create checkout session');
    }
}

export async function createPortalSession() {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error('Unauthorized');
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id: session.user.tenantId }
    });

    if (!tenant?.stripeCustomerId) {
        throw new Error('No billing account found');
    }

    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: tenant.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        });

        if (portalSession.url) {
            redirect(portalSession.url);
        }
    } catch (error) {
        console.error('Error creating portal session:', error);
        throw new Error('Failed to create portal session');
    }
}
