import prisma from '@/lib/prisma';

async function main() {
    // 1. Get the first Tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.log('No tenant found');
        return;
    }

    // 2. Get a Customer
    let customer = await prisma.customer.findFirst({ where: { tenantId: tenant.id } });
    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                tenantId: tenant.id,
                name: 'Cliente Teste Financeiro',
                email: 'financeiro@teste.com'
            }
        });
    }

    // 3. Create a Product for the Order
    const product = await prisma.product.create({
        data: {
            tenantId: tenant.id,
            name: 'Produto Teste Financeiro',
            price: 200.00,
            description: 'Produto gerado automaticamente para teste financeiro'
        }
    });

    try {
        // 4. Create a Paid Order with Fee
        const order = await prisma.order.create({
            data: {
                tenantId: tenant.id,
                customerId: customer.id,
                status: 'COMPLETED',
                paymentStatus: 'PAID',
                total: 200.00,
                fee: 15.50, // Shopee Fee example
                items: {
                    create: {
                        productId: product.id,
                        quantity: 1,
                        price: 200.00,
                        subtotal: 200.00
                    }
                }
            }
        });

        console.log(`Created Order ${order.id} with Total: ${order.total} and Fee: ${order.fee}`);
    } catch (error) {
        console.error('Error seeding finance data:', error);
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
