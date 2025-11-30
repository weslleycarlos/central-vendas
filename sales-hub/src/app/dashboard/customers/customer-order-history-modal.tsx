'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';

export default function CustomerOrderHistoryModal({ customer, orders }: { customer: any, orders: any[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-secondary-text hover:text-primary transition-colors"
                title="Histórico de Pedidos"
            >
                <span className="material-symbols-outlined">history</span>
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Histórico de Pedidos: ${customer.name}`}>
                <div className="mt-4">
                    {orders.length === 0 ? (
                        <p className="text-sm text-secondary-text">Nenhum pedido encontrado para este cliente.</p>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-border">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-card">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                                            Data
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary-text uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-background divide-y divide-border">
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                                                #{order.id.slice(-5)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-text">
                                                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total))}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                        order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                                                            'bg-red-50 text-red-700 ring-red-600/10'
                                                    }`}>
                                                    {order.status === 'COMPLETED' ? 'Concluído' : order.status === 'PENDING' ? 'Pendente' : 'Cancelado'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex h-10 items-center rounded-lg bg-background border border-border px-4 text-sm font-medium text-secondary-text transition-colors hover:bg-border/50 hover:text-foreground"
                    >
                        Fechar
                    </button>
                </div>
            </Modal>
        </>
    );
}
