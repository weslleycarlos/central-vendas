import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            if (isLoggedIn) {
                const isSuperAdmin = auth.user.role === 'SUPER_ADMIN';

                // Redirect Super Admin trying to access Tenant Dashboard
                if (isSuperAdmin && isOnDashboard) {
                    return Response.redirect(new URL('/admin', nextUrl));
                }

                // Redirect Tenant trying to access Admin Dashboard
                if (!isSuperAdmin && isOnAdmin) {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }

                // Redirect from Login/Root to respective dashboard
                if (!isOnDashboard && !isOnAdmin) {
                    if (isSuperAdmin) return Response.redirect(new URL('/admin', nextUrl));
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }

                return true;
            }

            // Not Logged In
            if (isOnDashboard || isOnAdmin) {
                return false; // Redirect to login
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.tenantId = user.tenantId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.tenantId = token.tenantId as string | null;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
