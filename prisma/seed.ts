import { PrismaClient } from '@prisma/client'
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
            await prisma.product.create({
                data: {
                    tenantId: demoTenant.id,
                    name: 'Produto Exemplo 1',
                    price: 99.90,
                    sku: 'PROD-001',
                    inventory: {
                        create: {
                            quantity: 10,
                            minStock: 2,
                            tenantId: demoTenant.id
                        }
                    }
                }
            })
            console.log('Product created')
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
