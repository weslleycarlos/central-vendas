import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function updateSettings(formData: FormData) {
    'use server';
    const session = await auth();
    if (!session?.user?.tenantId) return;

    const connectionId = formData.get('connectionId') as string;
    const syncStock = formData.get('syncStock') === 'on';
    const syncPrice = formData.get('syncPrice') === 'on';
    const priceAdjustment = formData.get('priceAdjustment') as string;

    const settings = {
        syncStock,
        syncPrice,
        priceAdjustment: Number(priceAdjustment) || 0
    };

    await prisma.tenantConnection.update({
        where: { id: connectionId },
        data: { settings: JSON.stringify(settings) }
    });

    revalidatePath(`/dashboard/integrations`);
}

export default async function IntegrationSettingsPage({ params }: { params: Promise<{ platformId: string }> }) {
    const session = await auth();
    if (!session?.user?.tenantId) return <div>Acesso negado.</div>;

    const { platformId } = await params;

    const connection = await prisma.tenantConnection.findUnique({
        where: {
            tenantId_platformId: {
                tenantId: session.user.tenantId,
                platformId: platformId
            }
        },
        include: { platform: true }
    });

    if (!connection) {
        return <div>Conexão não encontrada.</div>;
    }

    const settings = connection.settings ? JSON.parse(connection.settings) : { syncStock: true, syncPrice: true, priceAdjustment: 0 };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Configurações: {connection.platform.name}</h1>

            <form action={updateSettings} className="space-y-6 bg-card border border-border rounded-lg p-6">
                <input type="hidden" name="connectionId" value={connection.id} />

                <div className="space-y-4">
                    <h3 className="font-medium text-lg border-b border-border pb-2">Sincronização</h3>

                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="syncStock" className="font-medium text-foreground">Sincronizar Estoque</label>
                            <p className="text-sm text-secondary-text">Atualizar automaticamente o estoque na {connection.platform.name} quando houver vendas.</p>
                        </div>
                        <input
                            type="checkbox"
                            id="syncStock"
                            name="syncStock"
                            defaultChecked={settings.syncStock}
                            className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="syncPrice" className="font-medium text-foreground">Sincronizar Preço</label>
                            <p className="text-sm text-secondary-text">Atualizar preços automaticamente quando alterados no sistema.</p>
                        </div>
                        <input
                            type="checkbox"
                            id="syncPrice"
                            name="syncPrice"
                            defaultChecked={settings.syncPrice}
                            className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="font-medium text-lg border-b border-border pb-2">Preços</h3>

                    <div>
                        <label htmlFor="priceAdjustment" className="block font-medium text-foreground mb-1">Ajuste de Preço (%)</label>
                        <p className="text-sm text-secondary-text mb-2">Acrescimo ou desconto percentual aplicado ao preço base ao enviar para o marketplace.</p>
                        <input
                            type="number"
                            id="priceAdjustment"
                            name="priceAdjustment"
                            defaultValue={settings.priceAdjustment}
                            className="w-full rounded-md border border-border bg-input-bg px-3 py-2"
                            placeholder="Ex: 10 para aumentar 10%, -5 para desconto"
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-secondary-text hover:text-foreground"
                        onClick={() => redirect('/dashboard/integrations')}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-hover"
                    >
                        Salvar Configurações
                    </button>
                </div>
            </form>
        </div>
    );
}
