import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
    try {
        // Attempt to fetch balance to verify connection
        const balance = await stripe.balance.retrieve();
        return NextResponse.json({
            status: 'Success',
            message: 'Connected to Stripe API',
            mode: balance.livemode ? 'Live' : 'Test',
            balance_available: balance.available
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'Error',
            message: error.message
        }, { status: 500 });
    }
}
