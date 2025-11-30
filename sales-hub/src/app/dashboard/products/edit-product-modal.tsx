'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProduct } from '@/app/lib/actions';

export default function EditProductModal({ product, categories }: { product: any, categories: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const initialState = { message: '', errors: {} };
    const [state, dispatch] = useActionState(updateProduct, initialState);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-primary hover:text-primary-hover transition-colors"
                title="Editar"
            >
                <span className="material-symbols-outlined">edit</span>
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Produto">
                <form action={dispatch}>
                    <input type="hidden" name="id" value={product.id} />

                    {/* Name */}
                    <div className="mb-4">
                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                            Nome do Produto
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            defaultValue={product.name}
                            placeholder="Digite o nome do produto"
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                        />
                        <div aria-live="polite" aria-atomic="true">
                            {state.errors?.name &&
                                state.errors.name.map((error: string) => (
                                    <p key={error} className="mt-2 text-sm text-destructive">
                                        {error}
                                    </p>
                                ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                        <label htmlFor="price" className="mb-2 block text-sm font-medium text-foreground">
                            Preço
                        </label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            defaultValue={Number(product.price)}
                            placeholder="0.00"
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                        />
                        <div aria-live="polite" aria-atomic="true">
                            {state.errors?.price &&
                                state.errors.price.map((error: string) => (
                                    <p key={error} className="mt-2 text-sm text-destructive">
                                        {error}
                                    </p>
                                ))}
                        </div>
                    </div>

                    {/* SKU */}
                    <div className="mb-4">
                        <label htmlFor="sku" className="mb-2 block text-sm font-medium text-foreground">
                            SKU (Opcional)
                        </label>
                        <input
                            id="sku"
                            name="sku"
                            type="text"
                            defaultValue={product.sku || ''}
                            placeholder="SKU-123"
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                        />
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                        <label htmlFor="categoryId" className="mb-2 block text-sm font-medium text-foreground">
                            Categoria (Opcional)
                        </label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            defaultValue={product.categoryId || ''}
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                        >
                            <option value="">Sem Categoria</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Image URL */}
                    <div className="mb-4">
                        <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium text-foreground">
                            URL da Imagem (Opcional)
                        </label>
                        <input
                            id="imageUrl"
                            name="imageUrl"
                            type="url"
                            defaultValue={product.imageUrl || ''}
                            placeholder="https://exemplo.com/imagem.jpg"
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
                            Descrição (Opcional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={product.description || ''}
                            placeholder="Descrição do produto"
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                        />
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
            {pending ? 'Salvando...' : 'Salvar Alterações'}
        </button>
    );
}
