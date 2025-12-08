import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const productSchema = z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    sku: z.string().optional(),
    description: z.string().optional(),
});

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                tenantId: session.user.tenantId,
                deletedAt: null,
            },
            include: {
                inventory: true,
            },
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const json = await req.json();
        const body = productSchema.parse(json);

        // Check Plan Limits
        const tenant = await prisma.tenant.findUnique({
            where: { id: session.user.tenantId },
            include: {
                planRel: true,
                _count: {
                    select: {
                        products: { where: { deletedAt: null } }
                    }
                }
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }

        if (tenant.planRel) {
            const currentProducts = tenant._count.products;
            const maxProducts = tenant.planRel.maxProducts;

            if (currentProducts >= maxProducts) {
                return NextResponse.json({
                    error: `Limite de produtos atingido (${currentProducts}/${maxProducts}). Faça upgrade do plano.`
                }, { status: 403 });
            }
        }

        const product = await prisma.product.create({
            data: {
                tenantId: session.user.tenantId,
                name: body.name,
                price: body.price,
                sku: body.sku,
                description: body.description,
                inventory: {
                    create: {
                        quantity: 0,
                        minStock: 0,
                        tenant: {
                            connect: { id: session.user.tenantId }
                        }
                    }
                }
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
