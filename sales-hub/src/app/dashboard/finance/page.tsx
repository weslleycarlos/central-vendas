import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function FinancePage() {
    const session = await auth();
    if (!session?.user?.tenantId) {
        redirect('/login');
    }

    const tenantId = session.user.tenantId;

    // Fetch Orders
    const orders = await prisma.order.findMany({
        where: {
            tenantId: tenantId,
            status: { not: 'CANCELED' }
        },
        include: {
            customer: true
        },
        orderBy: { createdAt: 'desc' }
    });

    // Calculate KPIs
    const totalSales = orders.reduce((acc, order) => acc + Number(order.total), 0);

    const paidOrders = orders.filter(order => order.paymentStatus === 'PAID');
    const totalReceipts = paidOrders.reduce((acc, order) => acc + Number(order.total), 0);

    const totalFees = orders.reduce((acc, order) => acc + Number(order.fee || 0), 0);

    const netIncome = totalReceipts - totalFees;

    // Helper for currency formatting
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
                <p className="text-secondary-text">Visão geral dos seus recebimentos e taxas.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-secondary-text">Total Vendido</h3>
                        <span className="material-symbols-outlined text-primary">attach_money</span>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
                    <p className="text-xs text-secondary-text mt-1">Bruto (exceto cancelados)</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-secondary-text">Recebimentos</h3>
                        <span className="material-symbols-outlined text-green-500">account_balance_wallet</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceipts)}</div>
                    <p className="text-xs text-secondary-text mt-1">Pedidos pagos</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-secondary-text">Taxas</h3>
                        <span className="material-symbols-outlined text-red-500">percent</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(totalFees)}</div>
                    <p className="text-xs text-secondary-text mt-1">Marketplace e Gateway</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-secondary-text">Líquido</h3>
                        <span className="material-symbols-outlined text-blue-500">savings</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(netIncome)}</div>
                    <p className="text-xs text-secondary-text mt-1">Recebimentos - Taxas</p>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="rounded-lg border border-border bg-card">
                <div className="p-6 border-b border-border">
                    <h3 className="font-semibold">Histórico de Pagamentos</h3>
                </div>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50 text-secondary-text">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Pedido</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Valor Bruto</th>
                                <th className="px-6 py-3">Taxa</th>
                                <th className="px-6 py-3">Líquido</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paidOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-secondary-text">
                                        Nenhum pagamento registrado.
                                    </td>
                                </tr>
                            ) : (
                                paidOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/50">
                                        <td className="px-6 py-4">
                                            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            #{order.externalId || order.id.slice(-6)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.customer?.name || 'Cliente Final'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatCurrency(Number(order.total))}
                                        </td>
                                        <td className="px-6 py-4 text-red-500">
                                            - {formatCurrency(Number(order.fee || 0))}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-green-600">
                                            {formatCurrency(Number(order.total) - Number(order.fee || 0))}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                Pago
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
