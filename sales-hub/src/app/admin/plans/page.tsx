import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminPlansPage() {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/');
    }

    const plans = await prisma.plan.findMany({
        include: {
            _count: {
                select: { tenants: true }
            }
        },
        orderBy: { price: 'asc' }
    });

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Gerenciar Planos</h1>
                <Link
                    href="/admin/plans/new"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
                >
                    Novo Plano
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan) => (
                    <div key={plan.id} className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground">{plan.slug}</p>
                            </div>
                            <span className="text-xl font-bold text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(plan.price))}
                            </span>
                        </div>

                        <div className="space-y-3 flex-1">
                            <div className="flex justify-between text-sm border-b border-border pb-2">
                                <span className="text-muted-foreground">Produtos</span>
                                <span className="font-medium">{plan.maxProducts}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b border-border pb-2">
                                <span className="text-muted-foreground">Pedidos/mês</span>
                                <span className="font-medium">{plan.maxOrders}</span>
                            </div>
                            <div className="flex justify-between text-sm border-b border-border pb-2">
                                <span className="text-muted-foreground">Usuários</span>
                                <span className="font-medium">{plan.maxUsers}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Lojas Ativas</span>
                                <span className="font-medium">{plan._count.tenants}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border flex justify-end">
                            <Link
                                href={`/admin/plans/${plan.id}`}
                                className="text-sm text-primary hover:underline font-medium"
                            >
                                Editar
                            </Link>
                        </div>
                    </div>
                ))}

                {plans.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-muted-foreground">
                        Nenhum plano cadastrado.
                    </div>
                )}
            </div>
        </div>
    );
}
