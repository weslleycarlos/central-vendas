import prisma from '@/lib/prisma';

async function main() {
    console.log('--- Tenants ---');
    const tenants = await prisma.tenant.findMany();
    console.table(tenants.map(t => ({ id: t.id, name: t.name, slug: t.slug })));

    console.log('\n--- Users ---');
    const users = await prisma.user.findMany();
    console.table(users.map(u => ({ id: u.id, email: u.email, tenantId: u.tenantId })));

    console.log('\n--- Orders ---');
    const orders = await prisma.order.findMany();
    console.table(orders.map(o => ({ id: o.id, tenantId: o.tenantId, total: o.total, fee: o.fee })));
}

main();
