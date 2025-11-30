'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { publishProducts } from '@/app/lib/actions/integrations';

function SubmitButton({ selectedCount }: { selectedCount: number }) {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending || selectedCount === 0}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {pending ? (
                <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Publicando...
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined">cloud_upload</span>
                    Publicar {selectedCount} Produtos
                </>
            )}
        </button>
    );
}

export default function ProductSyncTable({ products, platformId }: { products: any[], platformId: string }) {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleSelect = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(s => s !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const toggleAll = () => {
        if (selected.length === products.length) {
            setSelected([]);
        } else {
            setSelected(products.map(p => p.id));
        }
    };

    return (
        <form action={publishProducts} className="space-y-4">
            <input type="hidden" name="platformId" value={platformId} />
            <input type="hidden" name="productIds" value={selected.join(',')} />

            <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border">
                <div className="text-sm text-secondary-text">
                    {selected.length} produtos selecionados
                </div>
                <SubmitButton selectedCount={selected.length} />
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-secondary-text font-medium">
                        <tr>
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={selected.length === products.length && products.length > 0}
                                    onChange={toggleAll}
                                    className="rounded border-gray-300"
                                />
                            </th>
                            <th className="p-4">Produto</th>
                            <th className="p-4">SKU</th>
                            <th className="p-4">Preço</th>
                            <th className="p-4">Estoque</th>
                            <th className="p-4">Status na Plataforma</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {products.map((product) => {
                            const listing = product.listings?.[0];
                            let statusColor = 'bg-gray-100 text-gray-800';
                            let statusText = 'Não Sincronizado';

                            if (listing?.status === 'SYNCED') {
                                statusColor = 'bg-green-100 text-green-800';
                                statusText = 'Sincronizado';
                            } else if (listing?.status === 'ERROR') {
                                statusColor = 'bg-red-100 text-red-800';
                                statusText = 'Erro';
                            }

                            return (
                                <tr key={product.id} className="hover:bg-muted/50">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(product.id)}
                                            onChange={() => toggleSelect(product.id)}
                                            className="rounded border-gray-300"
                                        />
                                    </td>
                                    <td className="p-4 font-medium">{product.name}</td>
                                    <td className="p-4 text-secondary-text">{product.sku}</td>
                                    <td className="p-4">R$ {Number(product.price).toFixed(2)}</td>
                                    <td className="p-4">{product.inventory?.quantity || 0}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                                {statusText}
                                            </span>
                                            {listing?.errorMessage && (
                                                <span className="text-red-500 material-symbols-outlined text-sm" title={listing.errorMessage}>
                                                    error
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </form>
    );
}
