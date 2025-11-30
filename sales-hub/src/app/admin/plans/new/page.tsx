'use client';

import { useState } from 'react';
import { createPlan } from '@/app/lib/actions/admin-plans';
import { useRouter } from 'next/navigation';

export default function NewPlanPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        const result = await createPlan(formData);
        setIsLoading(false);

        if (result.success) {
            router.push('/admin/plans');
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Novo Plano</h1>

            <form action={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-border pb-2">Detalhes do Plano</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome do Plano</label>
                            <input
                                name="name"
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Ex: Pro"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Slug (Identificador)</label>
                            <input
                                name="slug"
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="pro"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Preço Mensal (R$)</label>
                        <input
                            name="price"
                            type="number"
                            step="0.01"
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="99.90"
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
                                required
                                defaultValue={100}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Máx. Pedidos/mês</label>
                            <input
                                name="maxOrders"
                                type="number"
                                required
                                defaultValue={50}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Máx. Usuários</label>
                            <input
                                name="maxUsers"
                                type="number"
                                required
                                defaultValue={1}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium hover:underline"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Criando...' : 'Criar Plano'}
                    </button>
                </div>
            </form>
        </div>
    );
}
