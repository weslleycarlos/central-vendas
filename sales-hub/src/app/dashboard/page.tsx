export default function Page() {
    return (
        <main>
            <h1 className="mb-4 text-xl md:text-2xl font-bold text-foreground">
                Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-card border border-border p-2 shadow-sm">
                    <div className="flex p-4 items-center gap-2">
                        <span className="material-symbols-outlined text-secondary-text">attach_money</span>
                        <h3 className="ml-2 text-sm font-medium text-secondary-text">Total de Vendas</h3>
                    </div>
                    <p className="truncate rounded-xl bg-background px-4 py-8 text-center text-2xl font-bold text-foreground">
                        R$ 0,00
                    </p>
                </div>
                <div className="rounded-xl bg-card border border-border p-2 shadow-sm">
                    <div className="flex p-4 items-center gap-2">
                        <span className="material-symbols-outlined text-secondary-text">shopping_cart</span>
                        <h3 className="ml-2 text-sm font-medium text-secondary-text">Pedidos Pendentes</h3>
                    </div>
                    <p className="truncate rounded-xl bg-background px-4 py-8 text-center text-2xl font-bold text-foreground">
                        0
                    </p>
                </div>
            </div>
        </main>
    );
}
