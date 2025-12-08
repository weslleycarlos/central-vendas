import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const integrationSchema = z.object({
    type: z.string(), // WHATSAPP, MERCADO_LIVRE, etc.
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
    config: z.string().optional(), // JSON string
});

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const integrations = await prisma.integration.findMany({
            where: {
                tenantId: session.user.tenantId,
            },
        });
        return NextResponse.json(integrations);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const json = await req.json();
        const body = integrationSchema.parse(json);

        const integration = await prisma.integration.upsert({
            where: {
                tenantId_type: {
                    tenantId: session.user.tenantId,
                    type: body.type
                }
            },
            update: {
                apiKey: body.apiKey,
                apiSecret: body.apiSecret,
                accessToken: body.accessToken,
                config: body.config,
                isActive: true
            },
            create: {
                tenantId: session.user.tenantId,
                type: body.type,
                apiKey: body.apiKey,
                apiSecret: body.apiSecret,
                accessToken: body.accessToken,
                config: body.config,
            },
        });

        return NextResponse.json(integration, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
    }
}
