'use client';

import { useFormState } from 'react-dom';
import { createProduct } from '@/app/lib/actions';
import Link from 'next/link';

export default function CreateProductPage() {
    const initialState = { message: '', errors: {} };
    const [state, dispatch] = useFormState(createProduct, initialState);

    return (
        <main>
            <h1 className="mb-4 text-xl md:text-2xl font-bold text-foreground">Criar Produto</h1>
            <form action={dispatch}>
                <div className="rounded-lg bg-card border border-border p-4 md:p-6 shadow-sm">
                    {/* Name */}
                    <div className="mb-4">
                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                            Nome do Produto
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Digite o nome do produto"
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                            aria-describedby="name-error"
                        />
                        <div id="name-error" aria-live="polite" aria-atomic="true">
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
                            placeholder="0.00"
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                            aria-describedby="price-error"
                        />
                        <div id="price-error" aria-live="polite" aria-atomic="true">
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
                            placeholder="SKU-123"
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
                            placeholder="Descrição do produto"
                            className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                        />
                    </div>

                    <div aria-live="polite" aria-atomic="true">
                        {state.message && (
                            <p className="mt-2 text-sm text-destructive">{state.message}</p>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <Link
                        href="/dashboard/products"
                        className="flex h-10 items-center rounded-lg bg-background border border-border px-4 text-sm font-medium text-secondary-text transition-colors hover:bg-border/50 hover:text-foreground"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        Criar Produto
                    </button>
                </div>
            </form>
        </main>
    );
}
