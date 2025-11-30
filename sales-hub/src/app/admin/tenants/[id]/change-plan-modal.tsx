'use client';

import { useState } from 'react';
import { updateTenantPlan } from '@/app/lib/actions/admin-tenants';

interface Plan {
    id: string;
    name: string;
    price: number;
}

interface ChangePlanModalProps {
    tenantId: string;
    currentPlanId?: string;
    plans: Plan[];
}

export default function ChangePlanModal({ tenantId, currentPlanId, plans }: ChangePlanModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        await updateTenantPlan(formData);
        setIsLoading(false);
        setIsOpen(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs text-primary hover:underline ml-2"
            >
                (Alterar)
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg border border-border">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Alterar Plano</h2>
                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="tenantId" value={tenantId} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Selecione o Novo Plano</label>
                        <select
                            name="planId"
                            defaultValue={currentPlanId || ''}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="" disabled>Selecione um plano...</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                    {plan.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(plan.price))}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
