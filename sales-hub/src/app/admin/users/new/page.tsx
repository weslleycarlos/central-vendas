'use client';

import { createInternalUser } from '@/app/lib/actions/admin-users';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function NewInternalUserPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError('');

        const result = await createInternalUser(formData);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            router.push('/admin/users');
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link href="/admin/users" className="text-sm text-muted-foreground hover:underline mb-6 block">
                &larr; Voltar para Equipe
            </Link>

            <h1 className="text-2xl font-bold mb-6">Novo Usuário Interno</h1>

            <form action={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome Completo</label>
                        <input
                            name="name"
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Ex: João Silva"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="joao@centralvendas.com.br"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Senha</label>
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Função</label>
                        <select
                            name="role"
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="ADMIN">Admin</option>
                            <option value="SUPPORT">Suporte</option>
                            <option value="READ_ONLY">Leitura</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Defina o nível de acesso deste usuário ao painel administrativo.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Link
                        href="/admin/users"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Criando...' : 'Criar Usuário'}
                    </button>
                </div>
            </form>
        </div>
    );
}
