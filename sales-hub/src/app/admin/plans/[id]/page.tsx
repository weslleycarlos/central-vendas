import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { updatePlan } from '@/app/lib/actions/admin-plans';

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/');
    }

    const { id } = await params;

    const plan = await prisma.plan.findUnique({
        where: { id }
    });

    if (!plan) {
        return <div>Plano não encontrado</div>;
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Editar Plano</h1>

            <form action={updatePlan} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
                <input type="hidden" name="id" value={plan.id} />

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Informações Básicas</h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome do Plano</label>
                        <input
                            name="name"
                            defaultValue={plan.name}
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Slug</label>
                            <input
                                name="slug"
                                defaultValue={plan.slug}
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Preço (R$)</label>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue={Number(plan.price)}
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descrição</label>
                        <textarea
                            name="description"
                            defaultValue={plan.description || ''}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Limites</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Máx. Produtos</label>
                            <input
                                name="maxProducts"
                                type="number"
                                defaultValue={plan.maxProducts}
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Máx. Pedidos/mês</label>
                            <input
                                name="maxOrders"
                                type="number"
                                defaultValue={plan.maxOrders}
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Máx. Usuários</label>
                            <input
                                name="maxUsers"
                                type="number"
                                defaultValue={plan.maxUsers}
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Máx. Integrações</label>
                            <input
                                name="maxIntegrations"
                                type="number"
                                defaultValue={plan.maxIntegrations}
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="active"
                            defaultChecked={plan.active}
                            id="active"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="active" className="text-sm font-medium">Plano Ativo</label>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="submit"
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
}
