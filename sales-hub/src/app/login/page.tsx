'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 font-display">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center justify-center pb-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '36px' }}>insights</span>
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Bem-vindo de volta!</h1>
                    <p className="mt-2 text-base font-normal text-secondary-text">Faça login para acessar sua conta.</p>
                </div>

                <form action={dispatch} className="mt-8 flex flex-col gap-4">
                    <label className="flex flex-col">
                        <p className="pb-2 text-sm font-medium text-foreground">E-mail</p>
                        <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3 text-secondary-text">mail</span>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="seu@email.com"
                                className="h-12 w-full flex-1 rounded-lg border border-border bg-input-bg p-3 pl-10 text-base font-normal text-foreground placeholder:text-secondary-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </label>

                    <label className="flex flex-col">
                        <p className="pb-2 text-sm font-medium text-foreground">Senha</p>
                        <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3 text-secondary-text">lock</span>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Sua senha"
                                className="h-12 w-full flex-1 rounded-lg border border-border bg-input-bg p-3 pl-10 pr-10 text-base font-normal text-foreground placeholder:text-secondary-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <button type="button" className="absolute right-3 text-secondary-text hover:text-primary transition-colors">
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                            </button>
                        </div>
                    </label>

                    <div className="mt-2 text-right">
                        <a href="#" className="text-sm font-medium text-primary hover:underline">Esqueceu a senha?</a>
                    </div>

                    <LoginButton />

                    <div
                        className="flex h-8 items-end justify-center space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {errorMessage && (
                            <p className="text-sm text-destructive font-medium">{errorMessage}</p>
                        )}
                    </div>
                </form>

                <div className="relative mt-8 flex items-center">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="mx-4 flex-shrink text-sm text-secondary-text">OU</span>
                    <div className="flex-grow border-t border-border"></div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-secondary-text">
                        Não tem uma conta?{' '}
                        <a href="#" className="font-semibold text-primary hover:underline">Cadastre-se</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white transition-all hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {pending ? 'Entrando...' : 'Entrar'}
        </button>
    );
}
