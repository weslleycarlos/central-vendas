import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminTenantsPage() {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/');
    }

    const tenants = await prisma.tenant.findMany({
        include: {
            _count: {
                select: { users: true }
            },
            planRel: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Gerenciar Lojas</h1>
                <Link
                    href="/admin/tenants/new"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
                >
                    Nova Loja
                </Link>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50 text-secondary-text">
                            <tr>
                                <th className="px-6 py-3">Nome</th>
                                <th className="px-6 py-3">Slug</th>
                                <th className="px-6 py-3">Plano</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Usuários</th>
                                <th className="px-6 py-3">Criado em</th>
                                <th className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {tenant.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            {tenant.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-secondary-text">{tenant.slug}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${(tenant.planRel?.name || tenant.plan) === 'FREE'
                                            ? 'bg-gray-50 text-gray-600 ring-gray-500/10'
                                            : 'bg-green-50 text-green-700 ring-green-600/20'
                                            }`}>
                                            {tenant.planRel?.name || tenant.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${tenant.status === 'ACTIVE'
                                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                                            : 'bg-red-50 text-red-700 ring-red-600/10'
                                            }`}>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-secondary-text">{tenant._count.users}</td>
                                    <td className="px-6 py-4 text-secondary-text">
                                        {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            href={`/admin/tenants/${tenant.id}`}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            Detalhes
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
