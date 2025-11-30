import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { updateTenantSettings } from '@/app/lib/actions/settings';
import InviteUserModal from './invite-user-modal';
import ChangePasswordForm from './change-password-form';
import AdminChangePasswordModal from './admin-change-password-modal';
import SubscriptionModal from './subscription-modal';

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.tenantId) {
        redirect('/login');
    }

    const tenantId = session.user.tenantId;

    // Fetch Tenant Data
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
            users: true,
            planRel: true
        }
    });

    if (!tenant) return <div>Tenant not found</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configurações da Loja</h1>
                <p className="text-secondary-text">Gerencie o perfil da sua empresa e usuários.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_300px]">
                {/* Main Content: Profile Form */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold mb-4">Perfil da Empresa</h2>
                        <form action={updateTenantSettings} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nome da Loja</label>
                                    <input
                                        name="name"
                                        defaultValue={tenant.name}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email de Contato</label>
                                    <input
                                        name="email"
                                        defaultValue={tenant.email || ''}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Telefone</label>
                                    <input
                                        name="phone"
                                        defaultValue={tenant.phone || ''}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cor Principal</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            name="primaryColor"
                                            defaultValue={tenant.primaryColor || '#000000'}
                                            className="h-10 w-10 rounded-md border border-input p-1"
                                        />
                                        <input
                                            type="text"
                                            name="primaryColorText"
                                            defaultValue={tenant.primaryColor || '#000000'}
                                            readOnly
                                            className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Endereço</label>
                                <input
                                    name="address"
                                    defaultValue={tenant.address || ''}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cidade</label>
                                    <input
                                        name="city"
                                        defaultValue={tenant.city || ''}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Estado</label>
                                    <input
                                        name="state"
                                        defaultValue={tenant.state || ''}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">CEP</label>
                                    <input
                                        name="zipCode"
                                        defaultValue={tenant.zipCode || ''}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Users Section */}
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Usuários</h2>
                            <InviteUserModal />
                        </div>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted/50 text-secondary-text">
                                    <tr>
                                        <th className="px-4 py-2">Nome</th>
                                        <th className="px-4 py-2">Email</th>
                                        <th className="px-4 py-2">Função</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {tenant.users.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/50">
                                            <td className="px-4 py-2 font-medium">{user.name || 'Sem Nome'}</td>
                                            <td className="px-4 py-2">{user.email}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        {user.role}
                                                    </span>
                                                    <AdminChangePasswordModal userId={user.id} userName={user.name || 'Usuário'} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Plan Info */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-semibold mb-2">Seu Plano</h3>
                        <div className="text-2xl font-bold text-primary mb-1">{tenant.planRel?.name || tenant.plan}</div>
                        <p className="text-sm text-secondary-text mb-4">
                            {tenant.planRel ? (
                                <span className="space-y-1 block mt-2">
                                    <span className="block">Produtos: {tenant.planRel.maxProducts}</span>
                                    <span className="block">Usuários: {tenant.planRel.maxUsers}</span>
                                    <span className="block">Pedidos/mês: {tenant.planRel.maxOrders}</span>
                                </span>
                            ) : 'Recursos básicos ativos.'}
                        </p>
                        <SubscriptionModal plan={tenant.planRel ? {
                            name: tenant.planRel.name,
                            maxProducts: tenant.planRel.maxProducts,
                            maxOrders: tenant.planRel.maxOrders,
                            maxUsers: tenant.planRel.maxUsers,
                            price: Number(tenant.planRel.price)
                        } : null} />
                    </div>

                    <ChangePasswordForm />
                </div>
            </div>
        </div>
    );
}
