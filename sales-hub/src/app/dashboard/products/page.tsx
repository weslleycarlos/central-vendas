import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import CreateProductModal from './create-product-modal';
import EditProductModal from './edit-product-modal';
import DeleteProductButton from './delete-product-button';

export default async function ProductsPage() {
    const session = await auth();
    const tenantId = session?.user?.tenantId;

    if (!tenantId) {
        return <div>Acesso negado.</div>;
    }

    const products = await prisma.product.findMany({
        where: {
            tenantId: tenantId,
            deletedAt: null, // Only show active products
        },
        include: {
            inventory: true,
            category: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const categories = await prisma.category.findMany({
        where: { tenantId: tenantId },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
                <div className="flex gap-2">
                    <button className="flex h-10 items-center rounded-lg bg-background border border-border px-4 text-sm font-medium text-secondary-text transition-colors hover:bg-border/50 hover:text-foreground disabled:opacity-50 cursor-not-allowed" disabled title="Em breve">
                        <span className="material-symbols-outlined mr-2 text-base">sync</span>
                        Sincronizar
                    </button>
                    <CreateProductModal categories={categories} />
                </div>
            </div>
            <div className="mt-4 flow-root">
                <div className="inline-block min-w-full align-middle">
                    <div className="rounded-lg bg-card border border-border p-2 md:pt-0 shadow-sm">
                        <div className="md:hidden">
                            {products?.map((product) => (
                                <div
                                    key={product.id}
                                    className="mb-2 w-full rounded-md bg-background p-4 border border-border"
                                >
                                    <div className="flex items-center justify-between border-b border-border pb-4">
                                        <div>
                                            <div className="mb-2 flex items-center">
                                                <p className="font-medium text-foreground">{product.name}</p>
                                            </div>
                                            <p className="text-sm text-secondary-text">{product.sku}</p>
                                        </div>
                                        <p className="font-medium text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}</p>
                                    </div>
                                    <div className="flex w-full items-center justify-between pt-4">
                                        <div>
                                            <p className="text-xl font-medium text-foreground">
                                                {product.inventory?.quantity || 0} un
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <EditProductModal product={product} categories={categories} />
                                            <DeleteProductButton id={product.id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <table className="hidden min-w-full text-foreground md:table">
                            <thead className="rounded-lg text-left text-sm font-normal">
                                <tr>
                                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6 text-secondary-text">
                                        Nome
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        SKU
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Categoria
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Preço
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Estoque
                                    </th>
                                    <th scope="col" className="relative py-3 pl-6 pr-3">
                                        <span className="sr-only">Ações</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-card">
                                {products?.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="w-full border-b border-border py-3 text-sm last-of-type:border-none hover:bg-background/50 transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex items-center gap-3">
                                                {product.imageUrl && (
                                                    <img src={product.imageUrl} alt={product.name} className="h-8 w-8 rounded-full object-cover" />
                                                )}
                                                <p className="font-medium text-foreground">{product.name}</p>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-secondary-text">
                                            {product.sku}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-secondary-text">
                                            {product.category?.name || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-foreground">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-foreground">
                                            {product.inventory?.quantity || 0}
                                        </td>
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex justify-end gap-3">
                                                <EditProductModal product={product} categories={categories} />
                                                <DeleteProductButton id={product.id} />
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
