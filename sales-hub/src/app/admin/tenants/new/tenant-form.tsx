'use client';

import { useState } from 'react';
import { createTenant } from '@/app/lib/actions/admin-tenants';
import { useRouter } from 'next/navigation';

interface Plan {
    id: string;
    name: string;
    price: number;
}

export default function TenantForm({ plans }: { plans: Plan[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        const result = await createTenant(formData);
        setIsLoading(false);

        if (result.success) {
            router.push('/admin/tenants');
        } else {
            alert(result.error);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
            <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b border-border pb-2">Dados da Loja</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome da Loja</label>
                        <input
                            name="name"
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Minha Loja"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Slug (URL)</label>
                        <input
                            name="slug"
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="minhaloja"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Documento (CPF/CNPJ)</label>
                        <input
                            name="document"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="00.000.000/0000-00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Plano</label>
                        <select
                            name="planId"
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Selecione um plano...</option>
                            {plans.map(plan => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(plan.price))}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold border-b border-border pb-2">Admin Inicial</h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Admin</label>
                    <input
                        name="adminName"
                        required
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="João Silva"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            name="adminEmail"
                            type="email"
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="joao@loja.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Senha</label>
                        <input
                            name="adminPassword"
                            type="password"
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="******"
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
                    {isLoading ? 'Criando...' : 'Criar Loja'}
                </button>
            </div>
        </form>
    );
}
