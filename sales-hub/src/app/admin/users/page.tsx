import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminUsersPage() {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/');
    }

    const users = await prisma.user.findMany({
        where: { tenantId: null }, // Internal users only
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Equipe SaaS</h1>
                <Link
                    href="/admin/users/new"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Novo Usuário
                </Link>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">Nome</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Função</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Criado em</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {user.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.active
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                            }`}>
                                            {user.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* Add Actions Component Here later */}
                                        <button className="text-muted-foreground hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                        Nenhum usuário interno encontrado.
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
