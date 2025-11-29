import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const inventorySchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int(),
    minStock: z.number().int().optional(),
    location: z.string().optional(),
});

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const inventory = await prisma.inventory.findMany({
            where: {
                tenantId: session.user.tenantId,
            },
            include: {
                product: true,
            },
        });
        return NextResponse.json(inventory);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const json = await req.json();
        const body = inventorySchema.parse(json);

        // Check if product belongs to tenant
        const product = await prisma.product.findUnique({
            where: { id: body.productId }
        });

        if (!product || product.tenantId !== session.user.tenantId) {
            return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 });
        }

        const inventory = await prisma.inventory.upsert({
            where: {
                productId: body.productId,
            },
            update: {
                quantity: body.quantity,
                minStock: body.minStock,
                location: body.location,
            },
            create: {
                tenantId: session.user.tenantId,
                productId: body.productId,
                quantity: body.quantity,
                minStock: body.minStock ?? 0,
                location: body.location,
            },
        });

        return NextResponse.json(inventory, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
    }
}
