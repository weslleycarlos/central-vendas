import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import ProductSyncTable from './product-sync-table';
import Link from 'next/link';

export default async function ProductSyncPage({ params }: { params: Promise<{ platformId: string }> }) {
    const session = await auth();
    if (!session?.user?.tenantId) return <div>Acesso negado.</div>;

    const { platformId } = await params;

    // Fetch Connection
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

    // Fetch Products with Listings for this connection
    const products = await prisma.product.findMany({
        where: {
            tenantId: session.user.tenantId,
            deletedAt: null
        },
        include: {
            inventory: true,
            listings: {
                where: {
                    connectionId: connection.id
                }
            }
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="w-full">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/dashboard/integrations"
                    className="p-2 rounded-full hover:bg-muted text-secondary-text transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sincronizar Produtos - {connection.platform.name}</h1>
                    <p className="text-secondary-text">Selecione os produtos para enviar para a plataforma.</p>
                </div>
            </div>

            <ProductSyncTable products={products} platformId={platformId} />
        </div>
    );
}
