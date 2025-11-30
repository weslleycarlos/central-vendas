'use client';

import { useState } from 'react';
import { updateTenantStatus } from '@/app/lib/actions/admin-tenants';
import { useRouter } from 'next/navigation';

export default function TenantActions({ tenantId, currentStatus }: { tenantId: string, currentStatus: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Tem certeza que deseja mudar o status para ${newStatus}?`)) return;

        setIsLoading(true);
        const result = await updateTenantStatus(tenantId, newStatus);
        setIsLoading(false);

        if (result.success) {
            router.refresh();
        } else {
            alert(result.error);
        }
    };

    const handleImpersonate = () => {
        alert('Funcionalidade de Impersonate em breve!');
    };

    return (
        <div className="flex gap-3">
            {currentStatus === 'ACTIVE' ? (
                <button
                    onClick={() => handleStatusChange('SUSPENDED')}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
                >
                    Suspender Loja
                </button>
            ) : (
                <button
                    onClick={() => handleStatusChange('ACTIVE')}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200"
                >
                    Ativar Loja
                </button>
            )}

            <button
                onClick={handleImpersonate}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Acessar como Loja
            </button>
        </div>
    );
}
