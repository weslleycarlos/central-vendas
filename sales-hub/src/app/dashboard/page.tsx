import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function Dashboard() {
    const session = await auth();
    const tenantId = session?.user?.tenantId;

    if (!tenantId) {
        return <div>Acesso negado.</div>;
    }

    // 1. Sales Last 7 Days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await prisma.order.findMany({
        where: {
            tenantId: tenantId,
            createdAt: { gte: sevenDaysAgo },
            status: { not: 'CANCELED' } // Assuming we exclude canceled
        },
        select: { total: true }
    });

    const totalSales7Days = recentOrders.reduce((acc, order) => acc + Number(order.total), 0);

    // 2. Critical Stock
    const criticalStockCount = await prisma.inventory.count({
        where: {
            tenantId: tenantId,
            quantity: { lte: prisma.inventory.fields.minStock } // This might need raw query or JS filter if Prisma doesn't support field comparison directly in where yet for SQLite/all adapters easily. 
            // Actually Prisma doesn't support comparing two fields in `where` directly in standard API.
            // Let's fetch low stock items and count in JS for MVP simplicity or use a raw query if performance matters later.
            // For now, let's fetch items where quantity is low. Wait, we can't easily do col comparison.
            // Let's fetch all inventory and filter in JS for this MVP scale.
        }
    });

    // Workaround for field comparison: Fetch all inventory (optimized: select only needed fields)
    const allInventory = await prisma.inventory.findMany({
        where: { tenantId: tenantId },
        select: { quantity: true, minStock: true }
    });
    const lowStockCount = allInventory.filter(i => i.quantity <= i.minStock).length;


    // 3. Total Products
    const totalProducts = await prisma.product.count({
        where: { tenantId: tenantId }
    });

    // 4. Recent Orders (List)
    const lastOrders = await prisma.order.findMany({
        where: { tenantId: tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { customer: true }
    });

    // 5. Integrations Status
    const integrations = await prisma.integration.findMany({
        where: { tenantId: tenantId },
        select: { type: true, isActive: true }
    });

    return (
        <div className="w-full space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>

            {/* KPI Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card title="Vendas (7 dias)" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSales7Days)} icon="payments" color="text-green-600" />
                <Card title="Estoque Crítico" value={`${lowStockCount} itens`} icon="warning" color="text-red-600" />
                <Card title="Produtos Ativos" value={totalProducts.toString()} icon="inventory_2" color="text-blue-600" />
                <Card title="Integrações" value={`${integrations.filter(i => i.isActive).length} / ${integrations.length}`} icon="hub" color="text-purple-600" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Orders */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Pedidos Recentes</h2>
                        <Link href="/dashboard/orders" className="text-sm text-primary hover:underline">Ver todos</Link>
                    </div>
                    <div className="flow-root">
                        <ul role="list" className="-my-5 divide-y divide-border">
                            {lastOrders.map((order) => (
                                <li key={order.id} className="py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                Pedido #{order.id.slice(0, 8)}
                                            </p>
                                            <p className="text-sm text-secondary-text truncate">
                                                {order.customer?.name || 'Cliente Balcão'}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center text-base font-semibold text-foreground">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total))}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {lastOrders.length === 0 && (
                                <li className="py-4 text-sm text-secondary-text">Nenhum pedido recente.</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Integration Status */}
                <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Status das Integrações</h2>
                    <div className="space-y-4">
                        {integrations.length > 0 ? (
                            integrations.map((integration, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-background border border-border">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-secondary-text">
                                            {integration.type === 'WHATSAPP' ? 'chat' : 'shopping_bag'}
                                        </span>
                                        <span className="font-medium text-foreground">{integration.type}</span>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${integration.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {integration.isActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-secondary-text">Nenhuma integração configurada.</div>
                        )}
                        <Link href="/dashboard/channels" className="block w-full text-center rounded-md bg-primary/10 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                            Configurar Canais
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
    return (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-background border border-border ${color}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <p className="text-sm font-medium text-secondary-text">{title}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}
