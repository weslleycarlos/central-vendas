import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminBillingPage() {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/');
    }

    const [subscriptions, invoices, tenants] = await Promise.all([
        prisma.subscription.findMany({
            where: { status: 'active' },
            include: { tenant: true }
        }),
        prisma.invoice.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { tenant: true }
        }),
        prisma.tenant.count()
    ]);

    // Calculate MRR (Mock calculation as we don't have price in Subscription yet, assuming average 99.90)
    const mrr = subscriptions.length * 99.90;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Faturamento e Assinaturas</h1>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">MRR (Estimado)</h3>
                    <p className="text-2xl font-bold mt-2">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
                    </p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Assinaturas Ativas</h3>
                    <p className="text-2xl font-bold mt-2">{subscriptions.length}</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Total de Lojas</h3>
                    <p className="text-2xl font-bold mt-2">{tenants}</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Faturas Recentes</h3>
                    <p className="text-2xl font-bold mt-2">{invoices.length}</p>
                </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-semibold">Últimas Faturas</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">Loja</th>
                                <th className="px-6 py-3">Valor</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">ID Stripe</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4 font-medium">{invoice.tenant.name}</td>
                                    <td className="px-6 py-4">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(invoice.amount))}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'PAID'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                        {invoice.stripeInvoiceId}
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        Nenhuma fatura encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
