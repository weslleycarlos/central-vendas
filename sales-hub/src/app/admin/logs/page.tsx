import { auth } from '@/auth';
import { getLogs } from '@/app/lib/actions/logs';
import { redirect } from 'next/navigation';
import LogDetailsModal from './log-details-modal';

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/');
    }

    const params = await searchParams;
    const page = Number(params.page) || 1;
    const action = params.action as string;
    const tenantId = params.tenantId as string;
    const startDate = params.startDate as string;
    const endDate = params.endDate as string;

    const { logs, total, pages } = await getLogs({
        page,
        limit: 20,
        action,
        tenantId,
        startDate,
        endDate
    }) as any;

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Logs do Sistema</h1>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                        Exportar CSV
                    </button>
                    <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                        Exportar JSON
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm mb-6">
                <form className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Ação</label>
                        <input
                            name="action"
                            defaultValue={action}
                            placeholder="Ex: CREATE"
                            className="h-9 w-40 rounded-md border border-input bg-background px-3 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">ID da Loja</label>
                        <input
                            name="tenantId"
                            defaultValue={tenantId}
                            placeholder="ID da Loja"
                            className="h-9 w-40 rounded-md border border-input bg-background px-3 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Data Início</label>
                        <input
                            name="startDate"
                            type="date"
                            defaultValue={startDate}
                            className="h-9 w-auto rounded-md border border-input bg-background px-3 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Data Fim</label>
                        <input
                            name="endDate"
                            type="date"
                            defaultValue={endDate}
                            className="h-9 w-auto rounded-md border border-input bg-background px-3 text-sm"
                        />
                    </div>
                    <button type="submit" className="h-9 px-4 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover">
                        Filtrar
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Ação</th>
                                <th className="px-6 py-3">Entidade</th>
                                <th className="px-6 py-3">Usuário</th>
                                <th className="px-6 py-3">Detalhes</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Opções</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {logs?.map((log: any) => (
                                <tr key={log.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <span className="px-2 py-1 rounded-md bg-muted text-xs border border-border">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.entity}
                                        {log.entityId && <span className="text-xs text-muted-foreground block font-mono">{log.entityId.substring(0, 8)}...</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.user?.email || <span className="text-muted-foreground italic">Sistema</span>}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={log.details}>
                                        {log.details || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.status && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === 'SUCCESS' ? 'bg-green-50 text-green-700' :
                                                    log.status === 'ERROR' ? 'bg-red-50 text-red-700' :
                                                        'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                {log.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <LogDetailsModal log={log} />
                                    </td>
                                </tr>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                                        Nenhum log encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Total: {total} registros
                    </span>
                    <div className="flex gap-2">
                        <a
                            href={`?page=${page - 1}`}
                            className={`px-3 py-1 rounded-md border border-border text-sm ${page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
                        >
                            Anterior
                        </a>
                        <span className="px-3 py-1 text-sm font-medium">
                            Página {page} de {pages || 1}
                        </span>
                        <a
                            href={`?page=${page + 1}`}
                            className={`px-3 py-1 rounded-md border border-border text-sm ${page >= (pages || 1) ? 'pointer-events-none opacity-50' : 'hover:bg-muted'}`}
                        >
                            Próxima
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
