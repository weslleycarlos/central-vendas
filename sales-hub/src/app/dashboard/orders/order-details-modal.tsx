'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';
import { useActionState } from 'react';
import { updateOrderStatus, updateOrderPaymentStatus } from '@/app/lib/actions';

export default function OrderDetailsModal({ order }: { order: any }) {
    const [isOpen, setIsOpen] = useState(false);

    // Status Actions
    const [statusState, statusDispatch] = useActionState(updateOrderStatus, { message: '' });
    const [paymentState, paymentDispatch] = useActionState(updateOrderPaymentStatus, { message: '' });

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-primary hover:text-primary-hover transition-colors text-sm font-medium"
            >
                Ver Detalhes
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Pedido #${order.id.slice(0, 8)}`}>
                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex justify-between items-start border-b border-border pb-4">
                        <div>
                            <p className="text-sm text-secondary-text">Data</p>
                            <p className="font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-secondary-text">Cliente</p>
                            <p className="font-medium text-foreground">{order.customer?.name || 'Cliente Balcão'}</p>
                        </div>
                    </div>

                    {/* Items List */}
                    <div>
                        <h3 className="text-sm font-medium text-secondary-text mb-3 uppercase tracking-wider">Itens do Pedido</h3>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-card">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-secondary-text">Produto</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-secondary-text">Qtd</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-secondary-text">Preço</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-secondary-text">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-background divide-y divide-border">
                                    {order.items.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2 text-sm text-foreground">{item.product.name}</td>
                                            <td className="px-4 py-2 text-sm text-foreground text-right">{item.quantity}</td>
                                            <td className="px-4 py-2 text-sm text-foreground text-right">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.price))}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-foreground text-right">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.subtotal))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end mt-4">
                            <div className="text-right">
                                <p className="text-sm text-secondary-text">Total do Pedido</p>
                                <p className="text-2xl font-bold text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total))}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-border">
                        {/* Order Status */}
                        <form action={statusDispatch} className="space-y-2">
                            <input type="hidden" name="orderId" value={order.id} />
                            <label className="block text-sm font-medium text-foreground">Status do Pedido</label>
                            <div className="flex gap-2">
                                <select
                                    name="newStatus"
                                    defaultValue={order.status}
                                    className="flex-1 rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value="PENDING">Pendente</option>
                                    <option value="COMPLETED">Concluído</option>
                                    <option value="CANCELED">Cancelado</option>
                                </select>
                                <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
                                    Atualizar
                                </button>
                            </div>
                            {statusState?.message && <p className="text-xs text-secondary-text">{statusState.message}</p>}
                        </form>

                        {/* Payment Status */}
                        <form action={paymentDispatch} className="space-y-2">
                            <input type="hidden" name="orderId" value={order.id} />
                            <label className="block text-sm font-medium text-foreground">Status do Pagamento</label>
                            <div className="flex gap-2">
                                <select
                                    name="newPaymentStatus"
                                    defaultValue={order.paymentStatus || 'PENDING'}
                                    className="flex-1 rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value="PENDING">Pendente</option>
                                    <option value="PAID">Pago</option>
                                    <option value="REFUNDED">Reembolsado</option>
                                </select>
                                <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
                                    Atualizar
                                </button>
                            </div>
                            {paymentState?.message && <p className="text-xs text-secondary-text">{paymentState.message}</p>}
                        </form>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg bg-background border border-border px-4 py-2 text-sm font-medium text-secondary-text hover:bg-border/50 hover:text-foreground transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
