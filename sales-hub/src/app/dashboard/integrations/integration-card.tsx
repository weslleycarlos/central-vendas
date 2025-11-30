'use client';

import Link from 'next/link';
import { connectIntegration } from '@/app/lib/actions/connect-integration';

interface IntegrationCardProps {
    type: string;
    name: string;
    icon: string;
    description: string;
    integration: any;
    platformId: string;
}

export default function IntegrationCard({ type, name, icon, description, integration, platformId }: IntegrationCardProps) {
    return (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-2xl">{icon}</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{name}</h3>
                        <p className="text-sm text-secondary-text line-clamp-2">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${integration?.isActive ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-slate-50 text-slate-600 ring-slate-500/10'}`}>
                        {integration?.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    {integration && (
                        <Link
                            href={`/dashboard/integrations/${platformId}/settings`}
                            className="rounded-lg p-2 text-secondary-text hover:bg-background hover:text-foreground transition-colors"
                        >
                            <span className="material-symbols-outlined">settings</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border">
                {!integration ? (
                    <form action={connectIntegration}>
                        <input type="hidden" name="platformId" value={platformId} />
                        <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
                            Conectar
                        </button>
                    </form>
                ) : (
                    <div className="flex flex-col gap-2 w-full">
                        <div className="text-xs text-secondary-text text-center mb-2">
                            Conectado em: {new Date(integration.createdAt).toLocaleDateString()}
                        </div>
                        <Link
                            href={`/dashboard/integrations/${platformId}/products`}
                            className="w-full text-center bg-secondary text-secondary-foreground rounded-md py-2 text-sm font-medium hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">inventory_2</span>
                            Gerenciar Produtos
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
