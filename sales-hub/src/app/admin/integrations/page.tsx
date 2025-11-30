import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function togglePlatform(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const isActive = formData.get('isActive') === 'true';

    await prisma.integrationPlatform.update({
        where: { id },
        data: { isActive: !isActive }
    });
    revalidatePath('/admin/integrations');
}

async function updateCredentials(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const appId = formData.get('appId') as string;
    const appSecret = formData.get('appSecret') as string;

    await prisma.integrationPlatform.update({
        where: { id },
        data: { appId, appSecret }
    });
    revalidatePath('/admin/integrations');
}

export default async function AdminIntegrationsPage() {
    console.log('AdminIntegrationsPage: Starting render...');
    const session = await auth();
    console.log('AdminIntegrationsPage: Session role:', session?.user?.role);

    if (session?.user?.role !== 'SUPER_ADMIN' && session?.user?.role !== 'ADMIN') {
        console.log('AdminIntegrationsPage: Access denied');
        return <div>Acesso negado. Role: {session?.user?.role}</div>;
    }

    try {
        console.log('AdminIntegrationsPage: Fetching platforms...');
        // Fetch platforms
        const dbPlatforms = await prisma.integrationPlatform.findMany({
            orderBy: { name: 'asc' }
        });
        console.log('AdminIntegrationsPage: dbPlatforms count:', dbPlatforms.length);

        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-6">Gerenciar Integrações Globais</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {dbPlatforms.map((platform) => (
                        <div key={platform.id} className="bg-card border border-border rounded-lg p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-lg">{platform.name}</h3>
                                <form action={togglePlatform}>
                                    <input type="hidden" name="id" value={platform.id} />
                                    <input type="hidden" name="isActive" value={String(platform.isActive)} />
                                    <button
                                        type="submit"
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${platform.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                        {platform.isActive ? 'Ativo' : 'Inativo'}
                                    </button>
                                </form>
                            </div>

                            <form action={updateCredentials} className="space-y-4">
                                <input type="hidden" name="id" value={platform.id} />
                                <div>
                                    <label className="block text-sm font-medium text-secondary-text mb-1">App ID</label>
                                    <input
                                        type="text"
                                        name="appId"
                                        defaultValue={platform.appId || ''}
                                        className="w-full rounded-md border border-border bg-input-bg px-3 py-2 text-sm"
                                        placeholder="ID da Aplicação"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-text mb-1">App Secret</label>
                                    <input
                                        type="password"
                                        name="appSecret"
                                        defaultValue={platform.appSecret || ''}
                                        className="w-full rounded-md border border-border bg-input-bg px-3 py-2 text-sm"
                                        placeholder="Segredo da Aplicação"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white rounded-md py-2 text-sm font-medium hover:bg-primary-hover transition-colors"
                                >
                                    Salvar Credenciais
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        console.error('AdminIntegrationsPage: Error fetching platforms:', error);
        return <div>Erro ao carregar integrações. Verifique o console.</div>;
    }
}
