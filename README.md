# Central de Vendas - SaaS Platform

Plataforma SaaS Multi-tenant para gestão centralizada de vendas, estoque e pedidos.

## 🚀 Tecnologias

-   **Frontend**: Next.js 16 (App Router), TailwindCSS, TypeScript.
-   **Backend**: Next.js Server Actions, Prisma ORM.
-   **Banco de Dados**: SQLite (Desenvolvimento) / PostgreSQL (Produção).
-   **Autenticação**: NextAuth.js v5.

## 🛠️ Configuração do Ambiente

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/central-vendas.git
    cd central-vendas
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    cd sales-hub
    npm install
    cd ..
    ```

3.  **Configure o Banco de Dados**:
    Crie um arquivo `.env` na raiz com:
    ```env
    DATABASE_URL="file:./dev.db"
    ```

    Rode as migrações e o seed:
    ```bash
    npx prisma generate
    npm run db:seed
    ```

4.  **Configure o Frontend**:
    Crie um arquivo `.env` em `sales-hub/.env`:
    ```env
    DATABASE_URL="file:../../dev.db"
    AUTH_SECRET="sua-chave-secreta-aqui"
    ```

5.  **Inicie o Servidor**:
    Na raiz do projeto:
    ```bash
    npm run dev
    ```
    Acesse: `http://localhost:3000`

## 📦 Estrutura do Projeto

-   `/prisma`: Schema do banco de dados e scripts de seed.
-   `/sales-hub`: Aplicação Next.js (Frontend e API).
    -   `/src/app`: Rotas e páginas (App Router).
    -   `/src/components`: Componentes reutilizáveis.
    -   `/src/lib`: Utilitários e configurações (Prisma, Auth).

## 🔑 Acesso de Demonstração

-   **Super Admin**: `admin@centralvendas.com` / `password123`
-   **Tenant (Loja Exemplo)**: `loja@exemplo.com` / `password123`

## 🚢 Deploy

Para deploy em produção (Vercel/Railway/Supabase):
1.  Configure as variáveis de ambiente (`DATABASE_URL`, `AUTH_SECRET`).
2.  Use um banco PostgreSQL (ex: Supabase).
3.  Atualize o `schema.prisma` para usar `postgresql` no provider.
