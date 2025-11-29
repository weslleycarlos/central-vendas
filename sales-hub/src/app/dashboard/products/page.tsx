import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function ProductsPage() {
    const session = await auth();
    const tenantId = session?.user?.tenantId;

    if (!tenantId) {
        return <div>Acesso negado.</div>;
    }

    const products = await prisma.product.findMany({
        where: {
            tenantId: tenantId,
        },
        include: {
            inventory: true,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
                <Link
                    href="/dashboard/products/create"
                    className="flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    <span className="hidden md:block">Criar Produto</span>
                    <span className="md:hidden">+</span>
                </Link>
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
                                        Preço
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Estoque
                                    </th>
                                    <th scope="col" className="relative py-3 pl-6 pr-3">
                                        <span className="sr-only">Editar</span>
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
                                                <p className="font-medium text-foreground">{product.name}</p>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-secondary-text">
                                            {product.sku}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-foreground">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.price))}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-foreground">
                                            {product.inventory?.quantity || 0}
                                        </td>
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex justify-end gap-3">
                                                {/* Edit button placeholder */}
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
