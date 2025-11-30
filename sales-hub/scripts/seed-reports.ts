import prisma from '@/lib/prisma';

async function main() {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return;

    const customer = await prisma.customer.findFirst({ where: { tenantId: tenant.id } });
    if (!customer) return;

    // 1. Create a Product for Best Seller
    const bestSeller = await prisma.product.create({
        data: {
            tenantId: tenant.id,
            name: 'Produto Top Vendas',
            price: 50.00,
            inventory: {
                create: {
                    tenantId: tenant.id,
                    quantity: 100,
                    minStock: 10
                }
            }
        }
    });

    // 2. Create a Product for Low Stock
    await prisma.product.create({
        data: {
            tenantId: tenant.id,
            name: 'Produto Estoque Baixo',
            price: 100.00,
            inventory: {
                create: {
                    tenantId: tenant.id,
                    quantity: 2,
                    minStock: 5
                }
            }
        }
    });

    // 3. Create Past Orders (Sales Trend)
    const dates = [5, 10, 15, 20]; // Days ago
    for (const daysAgo of dates) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        await prisma.order.create({
            data: {
                tenantId: tenant.id,
                customerId: customer.id,
                status: 'COMPLETED',
                paymentStatus: 'PAID',
                total: 150.00, // 3 items * 50
                createdAt: date,
                items: {
                    create: {
                        productId: bestSeller.id,
                        quantity: 3,
                        price: 50.00,
                        subtotal: 150.00
                    }
                }
            }
        });
    }

    console.log('Reports data seeded!');
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
