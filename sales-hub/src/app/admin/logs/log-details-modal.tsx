'use client';

import { useState } from 'react';

export default function LogDetailsModal({ log }: { log: any }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-primary hover:underline text-xs"
            >
                Ver Detalhes
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl border border-border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Detalhes do Log</h2>
                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block">ID</span>
                            <span className="font-mono">{log.id}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Data</span>
                            <span>{new Date(log.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Ação</span>
                            <span className="font-medium">{log.action}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Entidade</span>
                            <span>{log.entity} {log.entityId && `(${log.entityId})`}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Usuário</span>
                            <span>{log.user?.email || 'Sistema'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">IP / User Agent</span>
                            <span className="truncate block" title={log.userAgent}>{log.ipAddress || '-'}</span>
                        </div>
                    </div>

                    <div>
                        <span className="text-muted-foreground block text-sm mb-2">Detalhes</span>
                        <div className="bg-muted/50 p-3 rounded-lg text-sm">
                            {log.details || '-'}
                        </div>
                    </div>

                    {log.metadata && (
                        <div>
                            <span className="text-muted-foreground block text-sm mb-2">Metadata (JSON)</span>
                            <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-xs overflow-x-auto">
                                {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border flex justify-end">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
