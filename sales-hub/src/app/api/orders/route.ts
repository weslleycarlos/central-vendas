import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const orderItemSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1),
});

const orderSchema = z.object({
    customerId: z.string().uuid().optional(),
    items: z.array(orderItemSchema).min(1),
    status: z.string().optional(),
    notes: z.string().optional(),
});

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            where: {
                tenantId: session.user.tenantId,
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                customer: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const json = await req.json();
        const body = orderSchema.parse(json);

        // Calculate total and verify stock
        let total = 0;
        const orderItemsData = [];

        for (const item of body.items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                include: { inventory: true }
            });

            if (!product || product.tenantId !== session.user.tenantId) {
                return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
            }

            if (product.inventory && product.inventory.quantity < item.quantity) {
                return NextResponse.json({ error: `Insufficient stock for product ${product.name}` }, { status: 400 });
            }

            const subtotal = Number(product.price) * item.quantity;
            total += subtotal;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                subtotal: subtotal
            });
        }

        // Transaction to create order and update stock
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    tenantId: session.user.tenantId!,
                    customerId: body.customerId,
                    sellerId: session.user.id,
                    status: body.status || "PENDING",
                    total: total,
                    notes: body.notes,
                    items: {
                        create: orderItemsData
                    }
                },
                include: {
                    items: true
                }
            });

            // Update stock
            for (const item of body.items) {
                await tx.inventory.update({
                    where: { productId: item.productId },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            return newOrder;
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
