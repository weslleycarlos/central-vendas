import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import IntegrationCard from './integration-card';

export default async function IntegrationsPage() {
    const session = await auth();
    const tenantId = session?.user?.tenantId;

    if (!tenantId) {
        return <div>Acesso negado.</div>;
    }

    // Fetch available platforms (Admin configured)
    const platforms = await prisma.integrationPlatform.findMany({
        where: { isActive: true }
    });

    // Fetch tenant connections
    const connections = await prisma.tenantConnection.findMany({
        where: { tenantId: tenantId },
        include: { platform: true }
    });

    const getConnection = (platformId: string) => connections.find(c => c.platformId === platformId);

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Canais de Venda e Integrações</h1>
                <p className="text-secondary-text">Gerencie suas conexões com marketplaces e ferramentas externas.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {platforms.map(platform => (
                    <IntegrationCard
                        key={platform.id}
                        type={platform.slug.toUpperCase() as any}
                        name={platform.name}
                        icon={platform.slug === 'whatsapp' ? 'chat' : 'storefront'}
                        description={`Integração com ${platform.name}`}
                        integration={getConnection(platform.id)}
                        platformId={platform.id}
                    />
                ))}
            </div>
        </div>
    );
}
