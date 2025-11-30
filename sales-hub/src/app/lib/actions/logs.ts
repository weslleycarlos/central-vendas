'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function getLogs(filters: {
    startDate?: string;
    endDate?: string;
    action?: string;
    tenantId?: string;
    status?: string;
    page?: number;
    limit?: number;
}) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.startDate && filters.endDate) {
        where.createdAt = {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate)
        };
    }

    if (filters.action) {
        where.action = filters.action;
    }

    if (filters.tenantId) {
        where.tenantId = filters.tenantId;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    try {
        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                where,
                include: {
                    user: { select: { name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.activityLog.count({ where })
        ]);

        return {
            logs,
            total,
            pages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error fetching logs:', error);
        return { error: 'Failed to fetch logs' };
    }
}

export async function exportLogs(filters: any) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        return { error: 'Unauthorized' };
    }

    // Similar logic to getLogs but without pagination
    // For simplicity, we'll just return the data and let the client handle CSV conversion
    // In a real app, we might stream a CSV file.

    // Reusing getLogs logic (simplified)
    const result = await getLogs({ ...filters, limit: 10000 }); // Limit export to 10k for now

    if ('error' in result) return result;

    return { logs: result.logs };
}
