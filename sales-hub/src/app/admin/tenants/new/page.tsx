import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import TenantForm from './tenant-form';

export default async function NewTenantPage() {
    const session = await auth();
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/');
    }

    const plans = await prisma.plan.findMany({
        where: { active: true },
        orderBy: { price: 'asc' }
    });

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Nova Loja</h1>
            <TenantForm plans={plans.map(p => ({ id: p.id, name: p.name, price: Number(p.price) }))} />
        </div>
    );
}
