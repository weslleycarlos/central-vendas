import AdminSideNav from '@/components/admin/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-100 font-display">
            <div className="flex-none">
                <AdminSideNav />
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12 text-slate-900">{children}</div>
        </div>
    );
}
