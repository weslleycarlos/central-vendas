'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createCustomer } from '@/app/lib/actions';

export default function CreateCustomerModal() {
    const [isOpen, setIsOpen] = useState(false);
    const initialState = { message: '', errors: {} };
    const [state, dispatch] = useActionState(createCustomer, initialState);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <span className="hidden md:block">Novo Cliente</span>
                <span className="md:hidden">+</span>
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Novo Cliente">
                <form action={dispatch}>
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Name */}
                        <div className="col-span-2">
                            <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                                Nome *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Nome do cliente"
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

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="email@exemplo.com"
                                className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                            />
                            <div aria-live="polite" aria-atomic="true">
                                {state.errors?.email &&
                                    state.errors.email.map((error: string) => (
                                        <p key={error} className="mt-2 text-sm text-destructive">
                                            {error}
                                        </p>
                                    ))}
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
                                Telefone
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                placeholder="(00) 00000-0000"
                                className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                            />
                        </div>

                        {/* Document */}
                        <div>
                            <label htmlFor="document" className="mb-2 block text-sm font-medium text-foreground">
                                CPF/CNPJ
                            </label>
                            <input
                                id="document"
                                name="document"
                                type="text"
                                placeholder="000.000.000-00"
                                className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                            />
                        </div>

                        {/* Address */}
                        <div className="col-span-2">
                            <label htmlFor="address" className="mb-2 block text-sm font-medium text-foreground">
                                Endereço
                            </label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                placeholder="Rua, número, bairro"
                                className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label htmlFor="city" className="mb-2 block text-sm font-medium text-foreground">
                                Cidade
                            </label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                placeholder="Cidade"
                                className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                            />
                        </div>

                        {/* State */}
                        <div>
                            <label htmlFor="state" className="mb-2 block text-sm font-medium text-foreground">
                                Estado
                            </label>
                            <input
                                id="state"
                                name="state"
                                type="text"
                                placeholder="UF"
                                className="peer block w-full rounded-lg border border-border bg-input-bg py-2 pl-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary-text transition-all"
                            />
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
            {pending ? 'Salvando...' : 'Criar Cliente'}
        </button>
    );
}
