import SideNav from '@/components/dashboard/sidenav';
import { auth } from '@/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const role = session?.user?.role || 'USER';

    return (
        <div className="flex h-screen flex-row overflow-hidden bg-background font-display">
            <div className="flex-none z-10">
                <SideNav role={role} />
            </div>
            <div className="flex-grow p-6 overflow-y-auto md:p-12 text-foreground">{children}</div>
        </div>
    );
}
