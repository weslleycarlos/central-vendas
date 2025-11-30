'use client';

import { deleteProduct } from '@/app/lib/actions';

export default function DeleteProductButton({ id }: { id: string }) {
    const handleDelete = async () => {
        if (confirm('Tem certeza que deseja desativar este produto?')) {
            await deleteProduct(id);
        }
    };

    return (
        <button
            onClick={handleDelete}
            className="text-destructive hover:text-destructive/80 transition-colors"
            title="Desativar"
        >
            <span className="material-symbols-outlined">delete</span>
        </button>
    );
}
