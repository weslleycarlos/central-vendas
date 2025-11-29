'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Credenciais inválidas.';
                default:
                    return 'Algo deu errado.';
            }
        }
        throw error;
    }
}

const CreateProduct = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    price: z.coerce.number().gt(0, 'Preço deve ser maior que zero'),
    sku: z.string().optional(),
    description: z.string().optional(),
});

export async function createProduct(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { message: 'Erro de autenticação.' };
    }

    const validatedFields = CreateProduct.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
        sku: formData.get('sku'),
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Falha ao criar produto.',
        };
    }

    const { name, price, sku, description } = validatedFields.data;

    try {
        await prisma.product.create({
            data: {
                tenantId: session.user.tenantId,
                name,
                price,
                sku,
                description,
                inventory: {
                    create: {
                        quantity: 0,
                        minStock: 0
                    }
                }
            },
        });
    } catch (error) {
        return {
            message: 'Erro de banco de dados: Falha ao criar produto.',
        };
    }

    revalidatePath('/dashboard/products');
    redirect('/dashboard/products');
}
