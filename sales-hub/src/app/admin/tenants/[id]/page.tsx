import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ChangePlanModal from './change-plan-modal';
import TenantActions from './tenant-actions';

export default async function TenantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/');
    }

    const { id } = await params;

    const [tenant, plans] = await Promise.all([
        prisma.tenant.findUnique({
            where: { id },
            include: {
                planRel: true,
                _count: {
                    select: {
                        users: true,
                        products: true,
                        orders: true,
                        integrations: true
                    }
                },
                users: {
                    where: { role: 'ADMIN' },
                    take: 5
                }
            }
        }),
        prisma.plan.findMany({
            where: { active: true },
            orderBy: { price: 'asc' }
        }).then(plans => plans.map(plan => ({
            ...plan,
            price: Number(plan.price)
        })))
    ]);

    if (!tenant) {
        return <div>Loja não encontrada</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href="/admin/tenants" className="text-sm text-muted-foreground hover:underline mb-2 block">
                        &larr; Voltar para Lojas
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        {tenant.name}
                        <span className={`text-sm px-3 py-1 rounded-full border ${tenant.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            {tenant.status}
                        </span>
                    </h1>
                    <p className="text-secondary-text mt-1">{tenant.slug}.centralvendas.com.br</p>
                </div>
                <TenantActions tenantId={tenant.id} currentStatus={tenant.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Info Card */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">info</span>
                        Informações
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground">Plano</span>
                            <span className="font-medium flex items-center">
                                {tenant.planRel?.name || tenant.plan}
                                <ChangePlanModal
                                    tenantId={tenant.id}
                                    currentPlanId={tenant.planId || undefined}
                                    plans={plans}
                                />
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground">Documento</span>
                            <span className="font-medium">{tenant.document || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-2">
                            <span className="text-muted-foreground">Criado em</span>
                            <span className="font-medium">{new Date(tenant.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ID</span>
                            <span className="font-mono text-xs">{tenant.id}</span>
                        </div>
                    </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        Uso da Plataforma
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                            <div className="text-2xl font-bold">{tenant._count.users}</div>
                            <div className="text-xs text-muted-foreground">Usuários</div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                            <div className="text-2xl font-bold">{tenant._count.products}</div>
                            <div className="text-xs text-muted-foreground">Produtos</div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                            <div className="text-2xl font-bold">{tenant._count.orders}</div>
                            <div className="text-xs text-muted-foreground">Pedidos</div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                            <div className="text-2xl font-bold">{tenant._count.integrations}</div>
                            <div className="text-xs text-muted-foreground">Integrações</div>
                        </div>
                    </div>
                </div>

                {/* Admins */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                        Administradores
                    </h3>
                    <div className="space-y-3">
                        {tenant.users.map(user => (
                            <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {user.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>
                        ))}
                        {tenant.users.length === 0 && (
                            <p className="text-sm text-muted-foreground">Nenhum admin encontrado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
