'use client';

import { useState } from 'react';

interface Plan {
    name: string;
    maxProducts: number;
    maxOrders: number;
    maxUsers: number;
    price: number;
}

export default function SubscriptionModal({ plan }: { plan: Plan | null }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full rounded-lg border border-primary text-primary px-4 py-2 text-sm font-medium hover:bg-primary/5 transition-colors"
            >
                Gerenciar Assinatura
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg border border-border">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Sua Assinatura</h2>
                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {plan ? (
                    <div className="space-y-6">
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-lg">{plan.name}</span>
                                <span className="text-primary font-bold">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(plan.price))}
                                    <span className="text-xs font-normal text-muted-foreground">/mês</span>
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Produtos</span>
                                    <span className="font-medium">{plan.maxProducts}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pedidos/mês</span>
                                    <span className="font-medium">{plan.maxOrders}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Usuários</span>
                                    <span className="font-medium">{plan.maxUsers}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-medium text-sm">Ações</h3>
                            <button
                                disabled
                                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
                            >
                                Fazer Upgrade (Em breve)
                            </button>
                            <button
                                disabled
                                className="w-full rounded-lg border border-destructive text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/5 opacity-50 cursor-not-allowed"
                            >
                                Cancelar Assinatura
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Nenhum plano ativo encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
