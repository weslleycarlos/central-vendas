import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import AdjustStockModal from './adjust-stock-modal';

export default async function InventoryPage() {
    const session = await auth();
    const tenantId = session?.user?.tenantId;

    if (!tenantId) {
        return <div>Acesso negado.</div>;
    }

    const inventoryItems = await prisma.inventory.findMany({
        where: {
            tenantId: tenantId,
        },
        include: {
            product: true,
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Estoque</h1>
            </div>
            <div className="mt-4 flow-root">
                <div className="inline-block min-w-full align-middle">
                    <div className="rounded-lg bg-card border border-border p-2 md:pt-0 shadow-sm">
                        <div className="md:hidden">
                            {inventoryItems?.map((item) => (
                                <div
                                    key={item.id}
                                    className="mb-2 w-full rounded-md bg-background p-4 border border-border"
                                >
                                    <div className="flex items-center justify-between border-b border-border pb-4">
                                        <div>
                                            <div className="mb-2 flex items-center">
                                                <p className="font-medium text-foreground">{item.product.name}</p>
                                            </div>
                                            <p className="text-sm text-secondary-text">Min: {item.minStock}</p>
                                        </div>
                                        <p className={`font-medium ${item.quantity <= item.minStock ? 'text-destructive' : 'text-success'}`}>
                                            {item.quantity} un
                                        </p>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <AdjustStockModal product={item.product} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <table className="hidden min-w-full text-foreground md:table">
                            <thead className="rounded-lg text-left text-sm font-normal">
                                <tr>
                                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6 text-secondary-text">
                                        Produto
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        SKU
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Quantidade
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Estoque Mínimo
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Status
                                    </th>
                                    <th scope="col" className="relative py-3 pl-6 pr-3">
                                        <span className="sr-only">Ações</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-card">
                                {inventoryItems?.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="w-full border-b border-border py-3 text-sm last-of-type:border-none hover:bg-background/50 transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3 font-medium text-foreground">
                                            {item.product.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-secondary-text">
                                            {item.product.sku || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-foreground">
                                            {item.quantity}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-foreground">
                                            {item.minStock}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${item.quantity <= item.minStock ? 'bg-red-50 text-red-700 ring-red-600/10' : 'bg-green-50 text-green-700 ring-green-600/20'}`}>
                                                {item.quantity <= item.minStock ? 'Baixo Estoque' : 'Normal'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex justify-end gap-3">
                                                <AdjustStockModal product={item.product} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
