'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SideNav({ role }: { role: string }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const isSuperAdmin = role === 'SUPER_ADMIN';

    return (
        <div className={`flex h-full flex-col border-r border-border bg-card transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex h-20 items-center justify-between px-4 border-b border-border">
                {!isCollapsed && (
                    <Link
                        className="flex items-center gap-2 text-primary"
                        href="/"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>insights</span>
                        <span className="text-xl font-bold text-foreground">Central</span>
                    </Link>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-md hover:bg-background text-secondary-text hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined">
                        {isCollapsed ? 'menu_open' : 'menu_open'}
                    </span>
                </button>
            </div>

            <div className="flex grow flex-col space-y-1 p-2">
                {isSuperAdmin ? (
                    <>
                        <NavItem href="/admin/dashboard" icon="dashboard" label="Dashboard SaaS" isCollapsed={isCollapsed} isActive={pathname === '/admin/dashboard'} />
                        <NavItem href="/admin/tenants" icon="store" label="Lojas" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/tenants')} />
                        <NavItem href="/admin/plans" icon="workspace_premium" label="Planos" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/plans')} />
                        <NavItem href="/admin/billing" icon="payments" label="Billing" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/billing')} />
                        <NavItem href="/admin/users" icon="group" label="Usuários" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/users')} />
                        <NavItem href="/admin/integrations" icon="hub" label="Integrações" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/integrations')} />
                        <NavItem href="/admin/logs" icon="description" label="Logs" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/logs')} />
                        <NavItem href="/admin/settings" icon="settings" label="Configurações" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/settings')} />
                    </>
                ) : (
                    <>
                        <NavItem href="/dashboard" icon="dashboard" label="Dashboard" isCollapsed={isCollapsed} isActive={pathname === '/dashboard'} />
                        <NavItem href="/dashboard/products" icon="inventory_2" label="Produtos" isCollapsed={isCollapsed} isActive={pathname.startsWith('/dashboard/products')} />
                        <NavItem href="/dashboard/inventory" icon="warehouse" label="Estoque" isCollapsed={isCollapsed} isActive={pathname.startsWith('/dashboard/inventory')} />
                        <NavItem href="/dashboard/orders" icon="shopping_cart" label="Pedidos" isCollapsed={isCollapsed} isActive={pathname.startsWith('/dashboard/orders')} />
                        <NavItem href="/dashboard/customers" icon="group" label="Clientes" isCollapsed={isCollapsed} isActive={pathname.startsWith('/dashboard/customers')} />

                        {/* Admin Only Links */}
                        {role === 'ADMIN' && (
                            <>
                                <NavItem href="/dashboard/integrations" icon="hub" label="Canais de Venda" isCollapsed={isCollapsed} isActive={pathname.startsWith('/dashboard/integrations')} />
                                <NavItem href="/dashboard/finance" icon="attach_money" label="Financeiro" isCollapsed={isCollapsed} isActive={pathname.startsWith('/dashboard/finance')} />
                                <NavItem href="/dashboard/reports" icon="bar_chart" label="Relatórios" isCollapsed={isCollapsed} isActive={pathname.startsWith('/dashboard/reports')} />
                                <NavItem href="/dashboard/settings" icon="settings" label="Configurações" isCollapsed={isCollapsed} isActive={pathname.startsWith('/dashboard/settings')} />
                            </>
                        )}
                    </>

                )}

                <div className="grow"></div>

                <button
                    onClick={() => signOut()}
                    className={`flex h-[48px] w-full items-center gap-2 rounded-md p-3 text-sm font-medium text-secondary-text hover:bg-destructive/10 hover:text-destructive transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <span className="material-symbols-outlined">logout</span>
                    {!isCollapsed && <div>Sair</div>}
                </button>
            </div>
        </div >
    );
}

function NavItem({ href, icon, label, isCollapsed, isActive }: { href: string; icon: string; label: string; isCollapsed: boolean; isActive: boolean }) {
    return (
        <Link
            href={href}
            className={`flex h-[48px] items-center gap-2 rounded-md p-3 text-sm font-medium transition-colors ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-primary/10 text-primary' : 'text-secondary-text hover:bg-primary/5 hover:text-primary'}`}
        >
            <span className="material-symbols-outlined">{icon}</span>
            {!isCollapsed && <p>{label}</p>}
        </Link>
    );
}
