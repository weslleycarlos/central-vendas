import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { createPortalSession } from '@/app/lib/actions/billing';

export default async function TenantBillingPage() {
    const session = await auth();
    if (!session?.user?.tenantId) {
        redirect('/');
    }

    const [tenant, invoices] = await Promise.all([
        prisma.tenant.findUnique({
            where: { id: session.user.tenantId },
            include: {
                planRel: true,
                subscriptions: {
                    where: { status: 'active' },
                    take: 1
                }
            }
        }),
        prisma.invoice.findMany({
            where: { tenantId: session.user.tenantId },
            orderBy: { createdAt: 'desc' }
        })
    ]);

    if (!tenant) return null;

    const currentSubscription = tenant.subscriptions[0];

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Faturamento e Assinatura</h1>

            {/* Current Plan */}
            <div className="bg-card rounded-xl border border-border shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Plano Atual</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentSubscription
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {currentSubscription ? 'Ativo' : 'Inativo'}
                    </span>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-2xl font-bold">{tenant.planRel?.name || 'Plano Gratuito'}</p>
                        <p className="text-muted-foreground mt-1">
                            {tenant.planRel?.price
                                ? `${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(tenant.planRel.price))}/mês`
                                : 'Grátis'}
                        </p>
                    </div>

                    <form action={createPortalSession}>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
                        >
                            Gerenciar Assinatura
                        </button>
                    </form>
                </div>

                {currentSubscription && (
                    <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
                        Próxima cobrança em: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    </div>
                )}
            </div>

            {/* Invoices */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-semibold">Histórico de Faturas</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Valor</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Fatura</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4">
                                        {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 font-medium">
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
                                        {invoice.pdfUrl && (
                                            <a
                                                href={invoice.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">download</span>
                                                PDF
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
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
