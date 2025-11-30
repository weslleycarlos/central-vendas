import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function ReportsPage() {
    const session = await auth();
    if (!session?.user?.tenantId) {
        redirect('/login');
    }

    const tenantId = session.user.tenantId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Sales by Period (Last 30 Days)
    const orders = await prisma.order.findMany({
        where: {
            tenantId: tenantId,
            status: { not: 'CANCELED' },
            createdAt: { gte: thirtyDaysAgo }
        },
        select: {
            createdAt: true,
            total: true
        },
        orderBy: { createdAt: 'asc' }
    });

    // Group by day
    const salesByDay: Record<string, number> = {};
    orders.forEach(order => {
        const date = order.createdAt.toLocaleDateString('pt-BR');
        salesByDay[date] = (salesByDay[date] || 0) + Number(order.total);
    });

    const salesData = Object.entries(salesByDay).map(([date, total]) => ({ date, total }));

    // 2. Best Selling Products
    const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
            order: {
                tenantId: tenantId,
                status: { not: 'CANCELED' }
            }
        },
        _sum: {
            quantity: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 5
    });

    // Fetch product names for the top products
    const productIds = topProducts.map(p => p.productId);
    const productsInfo = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true }
    });

    const bestSellers = topProducts.map(item => {
        const product = productsInfo.find(p => p.id === item.productId);
        return {
            name: product?.name || 'Produto Desconhecido',
            quantity: item._sum.quantity || 0
        };
    });


    // 3. Low Stock Alerts
    const lowStockProducts = await prisma.product.findMany({
        where: {
            tenantId: tenantId,
            inventory: {
                quantity: { lte: prisma.inventory.fields.minStock } // This comparison might not work directly in Prisma without raw query or specific syntax depending on DB
                // Prisma doesn't support comparing two columns in `where` clause directly in standard API yet easily.
                // We will fetch products with inventory and filter in JS for MVP simplicity.
            }
        },
        include: {
            inventory: true
        }
    });

    // Actually, let's fetch all products with inventory and filter.
    // Optimization: We could use raw query, but for MVP JS filter is fine.
    const allInventory = await prisma.inventory.findMany({
        where: { tenantId: tenantId },
        include: { product: true }
    });

    const lowStock = allInventory.filter(inv => inv.quantity <= inv.minStock).map(inv => ({
        name: inv.product.name,
        quantity: inv.quantity,
        minStock: inv.minStock
    }));

    // Helper for currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
                <p className="text-secondary-text">Análise de vendas e estoque.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Sales Chart (Table for MVP) */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Vendas (Últimos 30 dias)</h3>
                    {salesData.length === 0 ? (
                        <p className="text-sm text-secondary-text">Sem vendas no período.</p>
                    ) : (
                        <div className="relative overflow-x-auto max-h-[300px]">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted/50 text-secondary-text">
                                    <tr>
                                        <th className="px-4 py-2">Data</th>
                                        <th className="px-4 py-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {salesData.map((item) => (
                                        <tr key={item.date}>
                                            <td className="px-4 py-2">{item.date}</td>
                                            <td className="px-4 py-2 font-medium">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Best Sellers */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold mb-4">Produtos Mais Vendidos</h3>
                    {bestSellers.length === 0 ? (
                        <p className="text-sm text-secondary-text">Nenhuma venda registrada.</p>
                    ) : (
                        <ul className="space-y-3">
                            {bestSellers.map((product, index) => (
                                <li key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm font-medium">{product.name}</span>
                                    </div>
                                    <span className="text-sm text-secondary-text">{product.quantity} un.</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Low Stock Alert */}
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold">Alerta de Estoque Baixo</h3>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                        {lowStock.length}
                    </span>
                </div>

                {lowStock.length === 0 ? (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Estoque saudável.
                    </p>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 text-secondary-text">
                                <tr>
                                    <th className="px-4 py-2">Produto</th>
                                    <th className="px-4 py-2">Atual</th>
                                    <th className="px-4 py-2">Mínimo</th>
                                    <th className="px-4 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {lowStock.map((item, index) => (
                                    <tr key={index} className="hover:bg-muted/50">
                                        <td className="px-4 py-2 font-medium">{item.name}</td>
                                        <td className="px-4 py-2 text-red-600 font-bold">{item.quantity}</td>
                                        <td className="px-4 py-2">{item.minStock}</td>
                                        <td className="px-4 py-2">
                                            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                                Repor
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
