'use client';

import { useState } from 'react';
import { adminChangePassword } from '@/app/lib/actions/users';

export default function AdminChangePasswordModal({ userId, userName }: { userId: string; userName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            await adminChangePassword(formData);
            setIsOpen(false);
            alert('Senha alterada com sucesso!');
        } catch (error: any) {
            alert(error.message || 'Erro ao alterar senha');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs text-primary hover:underline"
            >
                Alterar Senha
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Alterar Senha de {userName}</h2>
                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="userId" value={userId} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nova Senha</label>
                        <input
                            name="newPassword"
                            type="text" // Visible so admin knows what they typed
                            required
                            minLength={6}
                            placeholder="Nova senha"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
