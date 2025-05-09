import React, { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import Layout from '../../components/Layout';

export default function AdminDashboard({ user }) {
  const [mode, setMode] = useState('list');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    price: '',
    shoe_category: '',
    image: '',
    variants: [{ size: '', stock_qty: '' }]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { fetchProducts(); }, []);
  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch {
      alert('Failed to fetch products');
    }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIdx, startIdx + itemsPerPage);

  const handleChange = (k, v) => setFormValues(prev => ({ ...prev, [k]: v }));

  const handleVariantChange = (idx, field, value) => {
    setFormValues(prev => {
      const vs = [...prev.variants];
      vs[idx] = { ...vs[idx], [field]: value };
      return { ...prev, variants: vs };
    });
  };

  const addVariant = () =>
    setFormValues(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', stock_qty: '' }]
    }));

  const removeVariant = idx =>
    setFormValues(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));

  function prepareCreate() {
    setFormValues({ name: '', description: '', price: '', shoe_category: '', image: '', variants: [{ size: '', stock_qty: '' }] });
    setSelectedProduct(null);
    setMode('create');
  }

  async function prepareEdit(p) {
    try {
      const res = await fetch(`/api/product/${p.id}`);
      if (!res.ok) throw new Error();
      const detail = await res.json();
      setSelectedProduct(detail);
      setFormValues({
        name: detail.name || '',
        description: detail.description || '',
        price: detail.price?.toString() || '',
        shoe_category: detail.shoe_category || '',
        image: '',
        variants: Array.isArray(detail.variants)
          ? detail.variants.map(v => ({
              id: v.id,
              size: v.size,
              stock_qty: v.stock.toString()
            }))
          : [{ size: '', stock_qty: '' }]
      });
      setMode('edit');
    } catch (err) {
      console.error(err);
      alert('Failed to load product');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      name: formValues.name,
      description: formValues.description,
      price: parseFloat(formValues.price),
      shoe_category: formValues.shoe_category,
      images: formValues.image ? [formValues.image] : [],
      variants: formValues.variants.map(v => ({
        id: v.id,
        size: v.size,
        stock_qty: Number(v.stock_qty)
      }))
    };
    const endpoint = mode === 'create'
      ? '/api/products-management'
      : `/api/products-management/${selectedProduct.id}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';
    try {
      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      fetchProducts();
      setMode('list');
      alert(mode === 'create' ? 'Created' : 'Updated');
    } catch {
      alert('Save failed');
    }
  }

  async function handleDelete() {
    if (!confirm('Confirm delete?')) return;
    try {
      const res = await fetch(`/api/products-management/${selectedProduct.id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      fetchProducts();
      setMode('list');
      alert('Deleted');
    } catch {
      alert('Delete failed');
    }
  }

  const goToPage = num => { if (num >= 1 && num <= totalPages) setCurrentPage(num); };

  return (
    <Layout>
      <div className="dashboard">
        <header className="header">
          <h1>Admin Dashboard</h1>
          <span>Hello, {user.name}</span>
        </header>

        {mode === 'list' && (
          <section>
            <div className="toolbar">
              <input
                className="input"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
              <button className="btn primary" onClick={prepareCreate}>+ New</button>
            </div>
            <ul className="list">
              {currentItems.map(p => (
                <li key={p.id} className="list-item" onClick={() => prepareEdit(p)}>
                  <span className="item-name">{p.name}</span>
                  <span className="item-category">{p.shoe_category}</span>
                </li>
              ))}
            </ul>
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} className={currentPage === i + 1 ? 'active' : ''} onClick={() => goToPage(i + 1)}>{i + 1}</button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>Next</button>
            </div>
          </section>
        )}

        {(mode === 'create' || mode === 'edit') && (
          <section className="form-container">
            <h2>{mode === 'create' ? 'Create Product' : 'Edit Product'}</h2>
            {formValues.image && (
              <div className="image-preview">
                <img src={formValues.image} alt="Preview" />
              </div>
            )}
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group"><label>Name</label><input className="input" required value={formValues.name} onChange={e => handleChange('name', e.target.value)} /></div>
              <div className="form-group"><label>Description</label><textarea className="textarea" value={formValues.description} onChange={e => handleChange('description', e.target.value)} /></div>
              <div className="form-group"><label>Price</label><input type="number" step="0.01" className="input" required value={formValues.price} onChange={e => handleChange('price', e.target.value)} /></div>
              <div className="form-group"><label>Category</label><input className="input" value={formValues.shoe_category} onChange={e => handleChange('shoe_category', e.target.value)} /></div>
              <div className="form-group full">
                <label>Variants (Size + Stock Qty)</label>
                {formValues.variants.map((v, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      className="input"
                      placeholder="Size (e.g. M, 42)"
                      required
                      value={v.size}
                      onChange={e => handleVariantChange(i, 'size', e.target.value)}
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Stock"
                      required
                      min="0"
                      value={v.stock_qty}
                      onChange={e => handleVariantChange(i, 'stock_qty', e.target.value)}
                    />
                    {formValues.variants.length > 1 && (
                      <button type="button" className="btn danger" onClick={() => removeVariant(i)}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn" onClick={addVariant}>
                  + Add Variant
                </button>
              </div>
              <div className="form-group full"><label>Image URL</label><input className="input" value={formValues.image} onChange={e => handleChange('image', e.target.value)} /></div>
              <div className="buttons">
                {mode === 'edit' && <button type="button" className="btn danger" onClick={handleDelete}>Delete</button>}
                <button type="button" className="btn" onClick={() => setMode('list')}>Cancel</button>
                <button type="submit" className="btn primary">{mode === 'create' ? 'Create' : 'Update'}</button>
              </div>
            </form>
          </section>
        )}

        <style jsx>{`
          .dashboard { padding: 20px; max-width: 700px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-family: Arial, sans-serif; }
          .toolbar { display: flex; gap: 10px; margin-bottom: 20px; }
          .input, .textarea { width: 100%; padding: 8px; border: 1px solid #aaa; border-radius: 4px; font-size: 14px; }
          .textarea { resize: vertical; height: 80px; }
          .btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
          .btn.primary { background: #0070f3; color: #fff; }
          .btn.danger { background: #d32f2f; color: #fff; }
          .list { list-style: none; padding: 0; margin: 0; }
          .list-item { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; font-family: Arial, sans-serif; }
          .list-item:hover { background: #f5f5f5; }
          .item-name { font-weight: bold; }
          .item-category { font-style: italic; color: #666; }
          .pagination { display: flex; gap: 5px; justify-content: center; margin-top: 15px; }
          .pagination button { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; background: #fff; cursor: pointer; }
          .pagination button.active { background: #0070f3; color: #fff; border-color: #0070f3; }
          .form-container { border: 1px solid #ccc; border-radius: 8px; padding: 20px; margin-top: 20px; font-family: Arial, sans-serif; }
          .image-preview { text-align: center; margin-bottom: 15px; }
          .image-preview img { max-width: 200px; max-height: 200px; border: 1px solid #ccc; border-radius: 4px; }
          .form-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }
          .form-group { display: flex; flex-direction: column; }
          .form-group.full { grid-column: span 1; }
          .buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        `}</style>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ req }) {
  const { token } = cookie.parse(req.headers.cookie || '');
  if (!token) return { redirect: { destination: '/signin', permanent: false } };
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET);
    if (p.role !== 'admin') return { redirect: { destination: '/signin', permanent: false } };
    return { props: { user: { id: p.sub, name: 'Admin', email: p.email, role: p.role } } };
  } catch {
    return { redirect: { destination: '/signin', permanent: false } };
  }
}
