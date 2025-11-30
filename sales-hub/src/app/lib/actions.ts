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
    categoryId: z.string().optional(),
    imageUrl: z.string().optional(),
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
        categoryId: formData.get('categoryId'),
        imageUrl: formData.get('imageUrl'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Falha ao criar produto.',
        };
    }

    const { name, price, sku, description, categoryId, imageUrl } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    tenantId: session.user.tenantId!,
                    name,
                    price: price,
                    sku,
                    description,
                    categoryId: categoryId || null,
                    imageUrl,
                    inventory: {
                        create: {
                            tenantId: session.user.tenantId!,
                            quantity: 0,
                            minStock: 0
                        }
                    }
                }
            });

            await tx.stockMovement.create({
                data: {
                    tenantId: session.user.tenantId!,
                    productId: product.id,
                    quantity: 0,
                    type: 'ADJUSTMENT',
                    reason: 'Cadastro Inicial'
                }
            });
        });
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        return {
            message: 'Erro de banco de dados: Falha ao criar produto.',
        };
    }

    revalidatePath('/dashboard/products');
    redirect('/dashboard/products');
}

const UpdateProduct = z.object({
    id: z.string(),
    name: z.string().min(1, 'Nome é obrigatório'),
    price: z.coerce.number().gt(0, 'Preço deve ser maior que zero'),
    sku: z.string().optional(),
    description: z.string().optional(),
    categoryId: z.string().optional(),
    imageUrl: z.string().optional(),
});

export async function updateProduct(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { message: 'Erro de autenticação.' };
    }

    const validatedFields = UpdateProduct.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        price: formData.get('price'),
        sku: formData.get('sku'),
        description: formData.get('description'),
        categoryId: formData.get('categoryId'),
        imageUrl: formData.get('imageUrl'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Falha ao atualizar produto.',
        };
    }

    const { id, name, price, sku, description, categoryId, imageUrl } = validatedFields.data;

    try {
        await prisma.product.update({
            where: {
                id: id,
                tenantId: session.user.tenantId!,
            },
            data: {
                name,
                price: price,
                sku,
                description,
                categoryId: categoryId || null,
                imageUrl,
            },
        });
    } catch (error) {
        return {
            message: 'Erro de banco de dados: Falha ao atualizar produto.',
        };
    }

    revalidatePath('/dashboard/products');
    redirect('/dashboard/products');
}

export async function deleteProduct(id: string) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error('Erro de autenticação.');
    }

    try {
        // Soft Delete
        await prisma.product.update({
            where: {
                id: id,
                tenantId: session.user.tenantId!,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    } catch (error) {
        throw new Error('Falha ao deletar produto.');
    }

    revalidatePath('/dashboard/products');
}

const CreateOrder = z.object({
    productId: z.string().min(1, 'Produto é obrigatório'),
    quantity: z.coerce.number().int().gt(0, 'Quantidade deve ser maior que zero'),
    customerId: z.string().optional(),
});

export async function createOrder(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { message: 'Erro de autenticação.' };
    }

    const validatedFields = CreateOrder.safeParse({
        productId: formData.get('productId'),
        quantity: formData.get('quantity'),
        customerId: formData.get('customerId'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Falha ao criar pedido.',
        };
    }

    const { productId, quantity, customerId } = validatedFields.data;

    try {
        // 1. Get Product Price and Check Stock
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { inventory: true }
        });

        if (!product || product.tenantId !== session.user.tenantId) {
            return { message: 'Produto não encontrado.' };
        }

        if (!product.inventory || product.inventory.quantity < quantity) {
            return { message: 'Estoque insuficiente.' };
        }

        const price = Number(product.price); // Convert Decimal to Number for calculation
        const total = price * quantity;

        // 2. Create Order Transaction
        await prisma.$transaction(async (tx) => {
            // Create Order
            const order = await tx.order.create({
                data: {
                    tenantId: session.user.tenantId!,
                    customerId: customerId || null,
                    total: total,
                    status: 'PENDING',
                    items: {
                        create: {
                            productId: product.id,
                            quantity: quantity,
                            price: price,
                            subtotal: total
                        }
                    }
                }
            });

            // Update Inventory
            await tx.inventory.update({
                where: { productId: product.id },
                data: { quantity: { decrement: quantity } }
            });

            // Create Stock Movement
            await tx.stockMovement.create({
                data: {
                    tenantId: session.user.tenantId!,
                    productId: product.id,
                    quantity: -quantity, // Negative for sale
                    type: 'SALE',
                    referenceId: order.id,
                    reason: 'Venda realizada'
                }
            });
        });

    } catch (error) {
        console.error(error);
        return {
            message: 'Erro ao processar pedido.',
        };
    }

    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard/products'); // Update stock display
    redirect('/dashboard/orders');
}

const AdjustStock = z.object({
    productId: z.string().min(1, 'Produto é obrigatório'),
    quantity: z.coerce.number().int().optional(),
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'UPDATE_MIN_STOCK']),
    reason: z.string().optional(),
    minStock: z.coerce.number().int().min(0).optional(),
});

export async function adjustStock(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { message: 'Erro de autenticação.' };
    }

    const rawFormData = {
        productId: formData.get('productId'),
        quantity: formData.get('quantity'),
        type: formData.get('type'),
        reason: formData.get('reason'),
        minStock: formData.get('minStock'),
    };

    // Convert null/empty strings to undefined for optional fields to ensure Zod optional() works
    const validatedFields = AdjustStock.safeParse({
        productId: rawFormData.productId,
        quantity: rawFormData.quantity === '' || rawFormData.quantity === null ? undefined : rawFormData.quantity,
        type: rawFormData.type,
        reason: rawFormData.reason === '' || rawFormData.reason === null ? undefined : rawFormData.reason,
        minStock: rawFormData.minStock === '' || rawFormData.minStock === null ? undefined : rawFormData.minStock,
    });

    if (!validatedFields.success) {
        console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Falha ao ajustar estoque.',
        };
    }

    const { productId, quantity, type, reason, minStock } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: { id: productId },
                include: { inventory: true }
            });

            if (!product || product.tenantId !== session.user.tenantId) {
                throw new Error('Produto não encontrado.');
            }

            // Handle Min Stock Update
            if (type === 'UPDATE_MIN_STOCK') {
                if (minStock === undefined) {
                    throw new Error('Estoque mínimo é obrigatório para atualização.');
                }
                await tx.inventory.upsert({
                    where: { productId: productId },
                    update: { minStock: minStock },
                    create: {
                        tenantId: session.user.tenantId!,
                        productId: productId,
                        quantity: 0,
                        minStock: minStock
                    }
                });
                return; // Exit after updating min stock
            }

            // Handle Stock Movement
            if (quantity === undefined) {
                throw new Error('Quantidade é obrigatória para movimentação.');
            }

            let newQuantity = product.inventory?.quantity || 0;
            let movementQuantity = quantity;

            if (type === 'IN') {
                newQuantity += quantity;
            } else if (type === 'OUT') {
                newQuantity -= quantity;
                movementQuantity = -quantity;
            } else if (type === 'ADJUSTMENT') {
                movementQuantity = quantity - newQuantity;
                newQuantity = quantity;
            }

            if (newQuantity < 0) {
                throw new Error('Estoque não pode ficar negativo.');
            }

            // Update Inventory
            await tx.inventory.upsert({
                where: { productId: productId },
                update: { quantity: newQuantity },
                create: {
                    tenantId: session.user.tenantId!,
                    productId: productId,
                    quantity: newQuantity,
                    minStock: 0
                }
            });

            // Create Stock Movement
            await tx.stockMovement.create({
                data: {
                    tenantId: session.user.tenantId!,
                    productId: productId,
                    quantity: movementQuantity,
                    type: type,
                    reason: reason || 'Ajuste manual'
                }
            });
        });
    } catch (error: any) {
        console.error('Erro ao ajustar estoque:', error);
        return {
            message: error.message || 'Erro de banco de dados: Falha ao ajustar estoque.',
        };
    }

    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard/products');
    redirect('/dashboard/inventory');
}

const CreateCustomer = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    document: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    notes: z.string().optional(),
});

export async function createCustomer(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { message: 'Erro de autenticação.' };
    }

    const validatedFields = CreateCustomer.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        document: formData.get('document'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Falha ao criar cliente.',
        };
    }

    const { name, email, phone, document, address, city, state, zipCode, notes } = validatedFields.data;

    try {
        await prisma.customer.create({
            data: {
                tenantId: session.user.tenantId!,
                name,
                email: email || null,
                phone,
                document,
                address,
                city,
                state,
                zipCode,
                notes,
                status: 'ACTIVE'
            }
        });
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        return {
            message: 'Erro de banco de dados: Falha ao criar cliente.',
        };
    }

    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

const UpdateCustomer = z.object({
    id: z.string(),
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    document: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export async function updateCustomer(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { message: 'Erro de autenticação.' };
    }

    const validatedFields = UpdateCustomer.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        document: formData.get('document'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        notes: formData.get('notes'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Campos inválidos. Falha ao atualizar cliente.',
        };
    }

    const { id, name, email, phone, document, address, city, state, zipCode, notes, status } = validatedFields.data;

    try {
        await prisma.customer.update({
            where: {
                id: id,
                tenantId: session.user.tenantId!,
            },
            data: {
                name,
                email: email || null,
                phone,
                document,
                address,
                city,
                state,
                zipCode,
                notes,
                status: status || undefined,
            },
        });
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        return {
            message: 'Erro de banco de dados: Falha ao atualizar cliente.',
        };
    }

    revalidatePath('/dashboard/customers');
    redirect('/dashboard/customers');
}

const UpdateOrderStatus = z.object({
    orderId: z.string(),
    newStatus: z.enum(['PENDING', 'COMPLETED', 'CANCELED']),
});

export async function updateOrderStatus(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { message: 'Erro de autenticação.' };
    }

    const validatedFields = UpdateOrderStatus.safeParse({
        orderId: formData.get('orderId'),
        newStatus: formData.get('newStatus'),
    });

    if (!validatedFields.success) {
        return { message: 'Dados inválidos.' };
    }

    const { orderId, newStatus } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId, tenantId: session.user.tenantId! },
                include: { items: true }
            });

            if (!order) throw new Error('Pedido não encontrado.');

            // Handle Stock Logic if status changes
            if (order.status !== newStatus) {
                if (newStatus === 'CANCELED') {
                    // Return stock
                    for (const item of order.items) {
                        await tx.inventory.update({
                            where: { productId: item.productId },
                            data: { quantity: { increment: item.quantity } }
                        });
                        await tx.stockMovement.create({
                            data: {
                                tenantId: session.user.tenantId!,
                                productId: item.productId,
                                quantity: item.quantity,
                                type: 'RETURN',
                                referenceId: order.id,
                                reason: 'Pedido cancelado'
                            }
                        });
                    }
                } else if (order.status === 'CANCELED' && (newStatus === 'PENDING' || newStatus === 'COMPLETED')) {
                    // Re-deduct stock (Un-cancel)
                    for (const item of order.items) {
                        const product = await tx.product.findUnique({ where: { id: item.productId }, include: { inventory: true } });
                        if (!product?.inventory || product.inventory.quantity < item.quantity) {
                            throw new Error(`Estoque insuficiente para reativar pedido: ${product?.name}`);
                        }

                        await tx.inventory.update({
                            where: { productId: item.productId },
                            data: { quantity: { decrement: item.quantity } }
                        });
                        await tx.stockMovement.create({
                            data: {
                                tenantId: session.user.tenantId!,
                                productId: item.productId,
                                quantity: -item.quantity,
                                type: 'SALE',
                                referenceId: order.id,
                                reason: 'Pedido reativado'
                            }
                        });
                    }
                }
            }

            await tx.order.update({
                where: { id: orderId },
                data: { status: newStatus }
            });
        });
    } catch (error: any) {
        console.error('Erro ao atualizar status do pedido:', error);
        return { message: error.message || 'Erro ao atualizar status.' };
    }

    revalidatePath('/dashboard/orders');
    return { message: 'Status atualizado com sucesso.' };
}

const UpdateOrderPaymentStatus = z.object({
    orderId: z.string(),
    newPaymentStatus: z.enum(['PENDING', 'PAID', 'REFUNDED']),
});

export async function updateOrderPaymentStatus(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { message: 'Erro de autenticação.' };
    }

    const validatedFields = UpdateOrderPaymentStatus.safeParse({
        orderId: formData.get('orderId'),
        newPaymentStatus: formData.get('newPaymentStatus'),
    });

    if (!validatedFields.success) {
        return { message: 'Dados inválidos.' };
    }

    const { orderId, newPaymentStatus } = validatedFields.data;

    try {
        await prisma.order.update({
            where: { id: orderId, tenantId: session.user.tenantId! },
            data: { paymentStatus: newPaymentStatus }
        });
    } catch (error) {
        console.error('Erro ao atualizar pagamento:', error);
        return { message: 'Erro ao atualizar pagamento.' };
    }

    revalidatePath('/dashboard/orders');
    return { message: 'Pagamento atualizado com sucesso.' };
}

const UpdateIntegration = z.object({
    type: z.enum(['WHATSAPP', 'MERCADO_LIVRE', 'OLX', 'SHOPEE']),
    isActive: z.coerce.boolean(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
});

export async function updateIntegration(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return { message: 'Erro de autenticação.' };
    }

    const validatedFields = UpdateIntegration.safeParse({
        type: formData.get('type'),
        isActive: formData.get('isActive') === 'on',
        apiKey: formData.get('apiKey'),
        apiSecret: formData.get('apiSecret'),
        accessToken: formData.get('accessToken'),
    });

    if (!validatedFields.success) {
        return { message: 'Dados inválidos.' };
    }

    const { type, isActive, apiKey, apiSecret, accessToken } = validatedFields.data;

    try {
        await prisma.integration.upsert({
            where: {
                tenantId_type: {
                    tenantId: session.user.tenantId!,
                    type: type,
                }
            },
            update: {
                isActive,
                apiKey,
                apiSecret,
                accessToken,
            },
            create: {
                tenantId: session.user.tenantId!,
                type,
                isActive,
                apiKey,
                apiSecret,
                accessToken,
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar integração:', error);
        return { message: 'Erro ao atualizar integração.' };
    }

    revalidatePath('/dashboard/integrations');
    return { message: 'Integração atualizada com sucesso.' };
}
