'use client';

import { useState, useEffect, useActionState } from 'react';
import Modal from '@/components/ui/modal';
import { useFormStatus } from 'react-dom';
import { createOrder } from '@/app/lib/actions';

export default function CreateOrderModal({ products, customers }: { products: any[], customers: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const initialState = { message: '', errors: {} };
    const [state, dispatch] = useActionState(createOrder, initialState);

    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
        const product = products.find(p => p.id === selectedProduct);
        if (product) {
            setTotal(Number(product.price) * quantity);
        } else {
            setTotal(0);
        }
    }, [selectedProduct, quantity, products]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <span className="hidden md:block">Novo Pedido</span>
                <span className="md:hidden">+</span>
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Novo Pedido">
                <form action={dispatch}>
                    {/* Customer Select */}
                    <div className="mb-4">
                        <label htmlFor="customerId" className="mb-2 block text-sm font-medium text-foreground">
                            Cliente
                        </label>
                        <select
                            id="customerId"
                            name="customerId"
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                        >
                            <option value="">Cliente Balcão (Não identificado)</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Product Select */}
                    <div className="mb-4">
                        <label htmlFor="productId" className="mb-2 block text-sm font-medium text-foreground">
                            Produto
                        </label>
                        <select
                            id="productId"
                            name="productId"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                        >
                            <option value="">Selecione um produto</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} - R$ {Number(p.price).toFixed(2)} ({p.inventory?.quantity} un)
                                </option>
                            ))}
                        </select>
                        <div aria-live="polite" aria-atomic="true">
                            {state.errors?.productId &&
                                state.errors.productId.map((error: string) => (
                                    <p key={error} className="mt-2 text-sm text-destructive">
                                        {error}
                                    </p>
                                ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-4">
                        <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-foreground">
                            Quantidade
                        </label>
                        <input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                        />
                        <div aria-live="polite" aria-atomic="true">
                            {state.errors?.quantity &&
                                state.errors.quantity.map((error: string) => (
                                    <p key={error} className="mt-2 text-sm text-destructive">
                                        {error}
                                    </p>
                                ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-6 rounded-lg bg-background p-4 border border-border">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-secondary-text">Subtotal</span>
                            <span className="font-medium text-foreground">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border pt-2">
                            <span className="text-base font-bold text-foreground">Total</span>
                            <span className="text-lg font-bold text-primary">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                            </span>
                        </div>
                    </div>

                    <div aria-live="polite" aria-atomic="true">
                        {state.message && (
                            <p className="mt-2 text-sm text-destructive">{state.message}</p>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex h-10 items-center rounded-lg bg-background border border-border px-4 text-sm font-medium text-secondary-text transition-colors hover:bg-border/50 hover:text-foreground"
                        >
                            Cancelar
                        </button>
                        <SubmitButton />
                    </div>
                </form>
            </Modal>
        </>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
        >
            {pending ? 'Processando...' : 'Confirmar Pedido'}
        </button>
    );
}
