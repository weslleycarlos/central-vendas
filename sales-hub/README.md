# Sales Hub - SaaS Multi-tenant

Plataforma SaaS completa para gestão de vendas, estoque e integrações (Shopee, Mercado Livre, etc.), construída com Next.js 15 e arquitetura Multi-tenant.

## 🚀 Tecnologias

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** SQLite (Dev) / PostgreSQL (Prod) com Prisma ORM
- **Estilização:** Tailwind CSS
- **Autenticação:** NextAuth.js (Auth.js) v5
- **Pagamentos:** Stripe (Checkout, Webhooks, Portal)

## ✨ Funcionalidades

### 🏢 Painel Super Admin
- **Gestão de Lojas (Tenants):** Criar, suspender e acessar lojas (Impersonate).
- **Gestão de Planos:** Definir limites de produtos, pedidos e usuários.
- **Faturamento:** Dashboard de MRR, assinaturas ativas e histórico de faturas.
- **Equipe:** Gestão de usuários internos com controle de acesso (RBAC).
- **Auditoria:** Logs detalhados de atividades e erros do sistema.

### 🏪 Painel do Lojista (Tenant)
- **Dashboard:** Visão geral de vendas e estoque.
- **Produtos:** Cadastro completo com controle de estoque.
- **Pedidos:** Gestão de pedidos e status.
- **Integrações:** Sincronização com Shopee (e outros marketplaces).
- **Configurações:** Personalização da loja e gestão da assinatura.

## 🛠️ Configuração Local

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/sales-hub.git
    cd sales-hub
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz baseado no exemplo abaixo:
    ```env
    DATABASE_URL="file:./dev.db"
    AUTH_SECRET="seu-segredo-aqui"
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    
    # Stripe
    STRIPE_SECRET_KEY="sk_test_..."
    STRIPE_WEBHOOK_SECRET="whsec_..."
    ```

4.  **Configure o Banco de Dados:**
    ```bash
    npx prisma db push
    npx prisma db seed # (Opcional: Se houver seed configurado)
    ```

5.  **Inicie o servidor:**
    ```bash
    npm run dev
    ```

## 📦 Estrutura do Projeto

- `/src/app/admin`: Rotas do Super Admin.
- `/src/app/dashboard`: Rotas do Tenant (Lojista).
- `/src/lib`: Configurações de serviços (Prisma, Stripe, Auth).
- `/prisma`: Schema do banco de dados.

## 📝 Licença

Este projeto está sob a licença MIT.
