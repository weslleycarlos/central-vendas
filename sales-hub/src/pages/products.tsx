
import { useState, useEffect } from 'react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', sku: '' });

  const fetchProducts = async () => {
    // const res = await fetch('/api/products');
    // const data = await res.json();
    // setProducts(data);
    setProducts([
      { id: '1', name: 'Sample Product 1', description: 'This is a sample product.', sku: 'SKU-001' },
      { id: '2', name: 'Sample Product 2', description: 'This is another sample.', sku: 'SKU-002' },
    ]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const res = await fetch('/api/products', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newProduct),
    // });
    // if (res.ok) {
    //   fetchProducts();
    //   setNewProduct({ name: '', description: '', sku: '' });
    // }
    alert('Adding product (not implemented yet).');
  };

  return (
    <div>
      <h1>Products</h1>

      <h2>Add a New Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Product Description"
          value={newProduct.description}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={newProduct.sku}
          onChange={handleInputChange}
        />
        <button type="submit">Add Product</button>
      </form>

      <h2>Existing Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <strong>{product.name}</strong> ({product.sku}) - {product.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsPage;
