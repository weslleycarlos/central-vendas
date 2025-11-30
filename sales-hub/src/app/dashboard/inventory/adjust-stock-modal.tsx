'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { adjustStock } from '@/app/lib/actions';

export default function AdjustStockModal({ product }: { product: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const initialState = { message: '', errors: {} };
    const [state, dispatch] = useActionState(adjustStock, initialState);
    const [mode, setMode] = useState<'MOVEMENT' | 'SETTINGS'>('MOVEMENT');
    const [type, setType] = useState('IN');

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-primary hover:text-primary-hover transition-colors"
                title="Gerenciar Estoque"
            >
                <span className="material-symbols-outlined">edit_square</span>
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Gerenciar Estoque: ${product.name}`}>
                <div className="mb-6 flex border-b border-border">
                    <button
                        className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'MOVEMENT' ? 'border-b-2 border-primary text-primary' : 'text-secondary-text hover:text-foreground'}`}
                        onClick={() => setMode('MOVEMENT')}
                    >
                        Movimentação
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'SETTINGS' ? 'border-b-2 border-primary text-primary' : 'text-secondary-text hover:text-foreground'}`}
                        onClick={() => setMode('SETTINGS')}
                    >
                        Configurações
                    </button>
                </div>

                <form action={dispatch}>
                    <input type="hidden" name="productId" value={product.id} />

                    {mode === 'MOVEMENT' ? (
                        <>
                            {/* Type */}
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-foreground">Tipo de Movimentação</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="IN"
                                            checked={type === 'IN'}
                                            onChange={() => setType('IN')}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-foreground">Entrada (+)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="OUT"
                                            checked={type === 'OUT'}
                                            onChange={() => setType('OUT')}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-foreground">Saída (-)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="ADJUSTMENT"
                                            checked={type === 'ADJUSTMENT'}
                                            onChange={() => setType('ADJUSTMENT')}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-foreground">Correção (=)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="mb-4">
                                <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-foreground">
                                    {type === 'ADJUSTMENT' ? 'Nova Quantidade Total' : 'Quantidade'}
                                </label>
                                <input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="1"
                                    placeholder="0"
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

                            {/* Reason */}
                            <div className="mb-4">
                                <label htmlFor="reason" className="mb-2 block text-sm font-medium text-foreground">
                                    Motivo (Opcional)
                                </label>
                                <input
                                    id="reason"
                                    name="reason"
                                    type="text"
                                    placeholder="Ex: Compra, Perda, Inventário"
                                    className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <input type="hidden" name="type" value="UPDATE_MIN_STOCK" />
                            {/* Min Stock */}
                            <div className="mb-4">
                                <label htmlFor="minStock" className="mb-2 block text-sm font-medium text-foreground">
                                    Estoque Mínimo
                                </label>
                                <p className="mb-2 text-xs text-secondary-text">
                                    Quando o estoque atingir este nível, o produto será marcado como "Baixo Estoque".
                                </p>
                                <input
                                    id="minStock"
                                    name="minStock"
                                    type="number"
                                    min="0"
                                    defaultValue={product.inventory?.minStock || 0}
                                    className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                                />
                                <div aria-live="polite" aria-atomic="true">
                                    {state.errors?.minStock &&
                                        state.errors.minStock.map((error: string) => (
                                            <p key={error} className="mt-2 text-sm text-destructive">
                                                {error}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        </>
                    )}

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
                        <SubmitButton label={mode === 'MOVEMENT' ? 'Confirmar Movimentação' : 'Salvar Configuração'} />
                    </div>
                </form>
            </Modal>
        </>
    );
}

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
        >
            {pending ? 'Salvando...' : label}
        </button>
    );
}
