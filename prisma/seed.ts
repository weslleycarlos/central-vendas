import { PrismaClient, Prisma } from '@prisma/client'
import { hash } from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    // Create Super Admin
    const superAdminEmail = 'admin@centralvendas.com'
    const existingAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } })

    if (!existingAdmin) {
        const passwordHash = await hash('password123', 10)
        await prisma.user.create({
            data: {
                name: 'Super Admin',
                email: superAdminEmail,
                password: passwordHash,
                role: 'SUPER_ADMIN',
            },
        })
        console.log('Super Admin created')
    }

    // Create Demo Tenant
    const demoTenantSlug = 'demo-loja'
    let demoTenant = await prisma.tenant.findUnique({ where: { slug: demoTenantSlug } })

    if (!demoTenant) {
        demoTenant = await prisma.tenant.create({
            data: {
                name: 'Loja Exemplo',
                slug: demoTenantSlug,
                plan: 'PRO',
            },
        })
        console.log('Demo Tenant created')
    }

    // Create Tenant Admin
    const tenantAdminEmail = 'loja@exemplo.com'
    const existingTenantAdmin = await prisma.user.findUnique({ where: { email: tenantAdminEmail } })

    if (!existingTenantAdmin && demoTenant) {
        const passwordHash = await hash('password123', 10)
        await prisma.user.create({
            data: {
                name: 'Dono da Loja',
                email: tenantAdminEmail,
                password: passwordHash,
                role: 'ADMIN',
                tenantId: demoTenant.id,
            },
        })
        console.log('Tenant Admin created')
    }

    // Create some products
    if (demoTenant) {
        const productCount = await prisma.product.count({ where: { tenantId: demoTenant.id } })
        if (productCount === 0) {
            // Create Product
            const product = await prisma.product.create({
                data: {
                    tenantId: demoTenant.id,
                    name: 'Produto Exemplo',
                    description: 'Descrição do produto exemplo',
                    price: new Prisma.Decimal(99.90),
                    sku: 'PROD-001',
                    inventory: {
                        create: {
                            tenantId: demoTenant.id,
                            quantity: 100,
                            minStock: 10
                        }
                    },
                    stockMovements: {
                        create: {
                            tenantId: demoTenant.id,
                            quantity: 100,
                            type: 'ADJUSTMENT',
                            reason: 'Estoque Inicial'
                        }
                    }
                }
            });

            // Create Customer
            await prisma.customer.create({
                data: {
                    tenantId: demoTenant.id,
                    name: 'Cliente Exemplo',
                    email: 'cliente@exemplo.com',
                    phone: '11999999999',
                    status: 'ACTIVE',
                    notes: 'Cliente fiel'
                }
            });

            console.log('Seed completed successfully');
        }
    }

    // Seed Integration Platforms
    const platforms = ['Shopee', 'Mercado Livre', 'OLX', 'WhatsApp'];
    for (const name of platforms) {
        const slug = name.toLowerCase().replace(' ', '-');
        await prisma.integrationPlatform.upsert({
            where: { slug },
            update: {},
            create: { name, slug, isActive: true }
        });
    }
    console.log('Integration Platforms seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
