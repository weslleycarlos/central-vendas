import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import CreateOrderModal from './create-order-modal';
import OrderDetailsModal from './order-details-modal';

export default async function OrdersPage() {
    const session = await auth();
    const tenantId = session?.user?.tenantId;

    if (!tenantId) {
        return <div>Acesso negado.</div>;
    }

    const orders = await prisma.order.findMany({
        where: {
            tenantId: tenantId,
        },
        include: {
            items: {
                include: {
                    product: true
                }
            },
            customer: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const products = await prisma.product.findMany({
        where: { tenantId: tenantId },
        include: { inventory: true }
    });

    const serializedProducts = products.map(p => ({
        ...p,
        price: Number(p.price)
    }));

    const customers = await prisma.customer.findMany({
        where: { tenantId: tenantId },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
                <CreateOrderModal products={serializedProducts} customers={customers} />
            </div>
            <div className="mt-4 flow-root">
                <div className="inline-block min-w-full align-middle">
                    <div className="rounded-lg bg-card border border-border p-2 md:pt-0 shadow-sm">
                        <div className="md:hidden">
                            {orders?.map((order) => (
                                <div
                                    key={order.id}
                                    className="mb-2 w-full rounded-md bg-background p-4 border border-border"
                                >
                                    <div className="flex items-center justify-between border-b border-border pb-4">
                                        <div>
                                            <div className="mb-2 flex items-center">
                                                <p className="font-medium text-foreground">Pedido #{order.id.slice(0, 8)}</p>
                                            </div>
                                            <p className="text-sm text-secondary-text">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <p className="font-medium text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total))}</p>
                                    </div>
                                    <div className="flex w-full items-center justify-between pt-4">
                                        <div className="flex gap-2">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' : order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/10'}`}>
                                                {order.status === 'PENDING' ? 'Pendente' : order.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                                            </span>
                                        </div>
                                        <OrderDetailsModal order={order} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <table className="hidden min-w-full text-foreground md:table">
                            <thead className="rounded-lg text-left text-sm font-normal">
                                <tr>
                                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6 text-secondary-text">
                                        ID
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Data
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Cliente
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Total
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Status
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Pagamento
                                    </th>
                                    <th scope="col" className="relative py-3 pl-6 pr-3">
                                        <span className="sr-only">Ações</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-card">
                                {orders?.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="w-full border-b border-border py-3 text-sm last-of-type:border-none hover:bg-background/50 transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3 font-medium text-foreground">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-secondary-text">
                                            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-foreground">
                                            {order.customer?.name || 'Cliente Balcão'}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-foreground">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(order.total))}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' : order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/10'}`}>
                                                {order.status === 'PENDING' ? 'Pendente' : order.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${order.paymentStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' : order.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-700 ring-gray-600/10'}`}>
                                                {order.paymentStatus === 'PENDING' ? 'Pendente' : order.paymentStatus === 'PAID' ? 'Pago' : 'Reembolsado'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3 text-right">
                                            <OrderDetailsModal order={order} />
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
