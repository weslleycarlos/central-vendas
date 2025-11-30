import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import CreateCustomerModal from './create-customer-modal';
import EditCustomerModal from './edit-customer-modal';
import CustomerOrderHistoryModal from './customer-order-history-modal';

export default async function CustomersPage() {
    const session = await auth();
    const tenantId = session?.user?.tenantId;

    if (!tenantId) {
        return <div>Acesso negado.</div>;
    }

    const customers = await prisma.customer.findMany({
        where: {
            tenantId: tenantId,
        },
        include: {
            orders: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5 // Limit history preview
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
                <CreateCustomerModal />
            </div>
            <div className="mt-4 flow-root">
                <div className="inline-block min-w-full align-middle">
                    <div className="rounded-lg bg-card border border-border p-2 md:pt-0 shadow-sm">
                        <div className="md:hidden">
                            {customers?.map((customer) => (
                                <div
                                    key={customer.id}
                                    className="mb-2 w-full rounded-md bg-background p-4 border border-border"
                                >
                                    <div className="flex items-center justify-between border-b border-border pb-4">
                                        <div>
                                            <div className="mb-2 flex items-center">
                                                <p className="font-medium text-foreground">{customer.name}</p>
                                            </div>
                                            <p className="text-sm text-secondary-text">{customer.email}</p>
                                        </div>
                                        <p className="font-medium text-foreground">{customer.phone}</p>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <CustomerOrderHistoryModal customer={customer} orders={customer.orders} />
                                        <EditCustomerModal customer={customer} />
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
                                        Email
                                    </th>
                                    <th scope="col" className="px-3 py-5 font-medium text-secondary-text">
                                        Telefone
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
                                {customers?.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="w-full border-b border-border py-3 text-sm last-of-type:border-none hover:bg-background/50 transition-colors"
                                    >
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3 font-medium text-foreground">
                                            {customer.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-secondary-text">
                                            {customer.email || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-foreground">
                                            {customer.phone || '-'}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${customer.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-slate-50 text-slate-600 ring-slate-500/10'}`}>
                                                {customer.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex justify-end gap-3">
                                                <CustomerOrderHistoryModal customer={customer} orders={customer.orders} />
                                                <EditCustomerModal customer={customer} />
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
