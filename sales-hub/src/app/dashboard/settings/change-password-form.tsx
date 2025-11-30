'use client';

import { useState } from 'react';
import { changePassword } from '@/app/lib/actions/auth';

export default function ChangePasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setMessage(null);

        const result = await changePassword(formData);
        setIsLoading(false);

        if (result.success) {
            setMessage({ text: 'Senha alterada com sucesso!', type: 'success' });
            // Optional: reset form
            (document.getElementById('change-password-form') as HTMLFormElement)?.reset();
        } else {
            setMessage({ text: result.error || 'Erro ao alterar senha', type: 'error' });
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Alterar Senha</h2>
            <form id="change-password-form" action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nova Senha</label>
                    <input
                        name="newPassword"
                        type="password"
                        required
                        minLength={6}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Confirmar Senha</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={6}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>

                {message && (
                    <div className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-secondary text-secondary-foreground border border-border px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Alterando...' : 'Atualizar Senha'}
                    </button>
                </div>
            </form>
        </div>
    );
}
