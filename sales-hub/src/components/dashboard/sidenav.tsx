import Link from 'next/link';
import { signOut } from '@/auth';

export default function SideNav() {
    return (
        <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-card border-r border-border">
            <Link
                className="mb-2 flex h-20 items-end justify-start rounded-md bg-primary p-4 md:h-40 shadow-lg shadow-primary/20"
                href="/"
            >
                <div className="w-32 text-white md:w-40 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>insights</span>
                    <span className="text-xl font-bold">Central Vendas</span>
                </div>
            </Link>
            <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                <Link
                    href="/dashboard"
                    className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-background p-3 text-sm font-medium text-secondary-text hover:bg-primary/10 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3 transition-colors"
                >
                    <span className="material-symbols-outlined">dashboard</span>
                    <p className="hidden md:block">Dashboard</p>
                </Link>
                <Link
                    href="/dashboard/products"
                    className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-background p-3 text-sm font-medium text-secondary-text hover:bg-primary/10 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3 transition-colors"
                >
                    <span className="material-symbols-outlined">inventory_2</span>
                    <p className="hidden md:block">Produtos</p>
                </Link>
                <Link
                    href="/dashboard/inventory"
                    className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-background p-3 text-sm font-medium text-secondary-text hover:bg-primary/10 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3 transition-colors"
                >
                    <span className="material-symbols-outlined">warehouse</span>
                    <p className="hidden md:block">Estoque</p>
                </Link>
                <div className="hidden h-auto w-full grow rounded-md bg-background md:block"></div>
                <form
                    action={async () => {
                        'use server';
                        await signOut();
                    }}
                >
                    <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-background p-3 text-sm font-medium text-secondary-text hover:bg-destructive/10 hover:text-destructive md:flex-none md:justify-start md:p-2 md:px-3 transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                        <div className="hidden md:block">Sair</div>
                    </button>
                </form>
            </div>
        </div>
    );
}
