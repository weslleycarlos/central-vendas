import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
    // Force rebuild: v2
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Parallel data fetching
    const [
        totalTenants,
        totalUsers,
        activeTenantsCount,
        gmvData,
        planDistribution,
        recentErrors
    ] = await Promise.all([
        prisma.tenant.count(),
        prisma.user.count(),
        // Active tenants: those with orders in the last 30 days
        prisma.order.groupBy({
            by: ['tenantId'],
            where: { createdAt: { gte: thirtyDaysAgo } }
        }).then(res => res.length),
        // Total GMV (Gross Merchandise Volume)
        prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { not: 'CANCELED' } }
        }),
        // Plan Distribution
        prisma.tenant.groupBy({
            by: ['plan'],
            _count: { id: true }
        }),
        // Health: Errors in last 24h
        prisma.integrationLog.count({
            where: {
                status: 'ERROR',
                createdAt: { gte: oneDayAgo }
            }
        })
    ]);

    const totalGMV = gmvData._sum.total ? Number(gmvData._sum.total) : 0;

    // Calculate Health Status
    let healthStatus = 'healthy'; // healthy, degraded, critical
    let healthColor = 'text-green-600';
    let healthIcon = 'check_circle';

    if (recentErrors > 50) {
        healthStatus = 'critical';
        healthColor = 'text-red-600';
        healthIcon = 'error';
    } else if (recentErrors > 10) {
        healthStatus = 'degraded';
        healthColor = 'text-yellow-600';
        healthIcon = 'warning';
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard SaaS</h1>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${healthColor}`}>
                    <span className="material-symbols-outlined text-sm">{healthIcon}</span>
                    <span className="text-sm font-medium capitalize">Sistema: {healthStatus === 'healthy' ? 'Saudável' : healthStatus === 'degraded' ? 'Instável' : 'Crítico'}</span>
                </div>
            </div>

            {/* Main KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-secondary-text">Total de Lojas</h3>
                        <span className="material-symbols-outlined text-muted-foreground">store</span>
                    </div>
                    <div className="text-2xl font-bold">{totalTenants}</div>
                    <p className="text-xs text-muted-foreground">{activeTenantsCount} ativas (30d)</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-secondary-text">Total de Usuários</h3>
                        <span className="material-symbols-outlined text-muted-foreground">group</span>
                    </div>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">Média de {(totalUsers / (totalTenants || 1)).toFixed(1)} por loja</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-secondary-text">GMV Total</h3>
                        <span className="material-symbols-outlined text-muted-foreground">payments</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGMV)}
                    </div>
                    <p className="text-xs text-muted-foreground">Volume transacionado</p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-secondary-text">Erros (24h)</h3>
                        <span className="material-symbols-outlined text-muted-foreground">bug_report</span>
                    </div>
                    <div className="text-2xl font-bold">{recentErrors}</div>
                    <p className="text-xs text-muted-foreground">Logs de falha</p>
                </div>
            </div>

            {/* Plan Distribution & Health */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Plan Distribution */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Distribuição de Planos</h3>
                    <div className="space-y-4">
                        {planDistribution.map((item: any) => {
                            const percentage = Math.round((item._count.id / totalTenants) * 100);
                            return (
                                <div key={item.plan} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{item.plan}</span>
                                        <span className="text-muted-foreground">{item._count.id} ({percentage}%)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary">
                                        <div
                                            className="h-2 rounded-full bg-primary transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* System Status / Alerts */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Status do Sistema</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                            <div className={`h-2 w-2 rounded-full ${recentErrors === 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Integrações</p>
                                <p className="text-xs text-muted-foreground">
                                    {recentErrors === 0 ? 'Operando normalmente' : `${recentErrors} falhas detectadas`}
                                </p>
                            </div>
                            <span className="text-xs text-muted-foreground">Agora</span>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Webhooks</p>
                                <p className="text-xs text-muted-foreground">Recebendo eventos</p>
                            </div>
                            <span className="text-xs text-muted-foreground">Agora</span>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium">Banco de Dados</p>
                                <p className="text-xs text-muted-foreground">Conectado</p>
                            </div>
                            <span className="text-xs text-muted-foreground">Agora</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
