'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function AdminSideNav() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <div className={`flex h-full flex-col border-r border-slate-800 bg-slate-900 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className="flex h-20 items-center justify-between px-4 border-b border-slate-800">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-400" style={{ fontSize: '32px' }}>admin_panel_settings</span>
                        <span className="text-xl font-bold">Admin</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">
                        {isCollapsed ? 'menu_open' : 'menu_open'}
                    </span>
                </button>
            </div>

            <div className="flex grow flex-col space-y-1 p-2">
                <NavItem href="/admin" icon="dashboard" label="Dashboard Geral" isCollapsed={isCollapsed} isActive={pathname === '/admin'} />
                <NavItem href="/admin/tenants" icon="store" label="Lojas (Tenants)" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/tenants')} />
                <NavItem href="/admin/plans" icon="payments" label="Planos & Preços" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/plans')} />
                <NavItem href="/admin/billing" icon="receipt_long" label="Billing / Faturamento" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/billing')} />
                <NavItem href="/admin/users" icon="manage_accounts" label="Usuários (Admins)" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/users')} />
                <NavItem href="/admin/logs" icon="history" label="Logs e Auditoria" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/logs')} />
                <NavItem href="/admin/integrations" icon="hub" label="Integrações Globais" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/integrations')} />
                <NavItem href="/admin/settings" icon="settings" label="Configurações" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/settings')} />

                <div className="grow"></div>

                <button
                    onClick={() => signOut()}
                    className={`flex h-[48px] w-full items-center gap-2 rounded-md p-3 text-sm font-medium text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <span className="material-symbols-outlined">logout</span>
                    {!isCollapsed && <div>Sair</div>}
                </button>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, isCollapsed, isActive }: { href: string; icon: string; label: string; isCollapsed: boolean; isActive: boolean }) {
    return (
        <Link
            href={href}
            className={`flex h-[48px] items-center gap-2 rounded-md p-3 text-sm font-medium transition-colors ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <span className="material-symbols-outlined">{icon}</span>
            {!isCollapsed && <p>{label}</p>}
        </Link>
    );
}
