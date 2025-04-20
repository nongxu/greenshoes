// pages/admin/dashboard.js
import React, { useState, useEffect } from 'react';
import { useRouter }          from 'next/router';
import Layout                 from '../../components/Layout';
import { useUser }            from '../../lib/useUser';

const AdminDashboard = () => {
  const router = useRouter();
  const { user, loading, isError } = useUser();

  // Redirect to /signin if not logged in or not an admin
  useEffect(() => {
    if (!loading && (isError || user?.role !== 'admin')) {
      router.replace('/signin');
    }
  }, [loading, isError, user, router]);

  // While we’re waiting on the hook…
  if (loading) {
    return (
      <Layout>
        <p>Loading…</p>
      </Layout>
    );
  }
  // After redirect is triggered, render nothing
  if (isError || user?.role !== 'admin') {
    return null;
  }

  // ——— Your existing form/UI logic ———
  const [productName, setProductName] = useState('');
  const [price, setPrice]             = useState('');
  const [images, setImages]           = useState(['']);
  const [sizes, setSizes]             = useState({ S: 0, M: 0, L: 0, XL: 0 });

  const handleImageChange = (idx, val) => {
    const arr = [...images];
    arr[idx] = val;
    setImages(arr);
  };
  const addImageField = () => setImages([...images, '']);
  const removeImageField = idx =>
    setImages(images.filter((_, i) => i !== idx));

  const handleSizeChange = (key, val) =>
    setSizes(prev => ({ ...prev, [key]: Number(val) }));

  const handleCreateProduct = e => {
    e.preventDefault();
    const newProduct = {
      name:   productName,
      price,
      images: images.filter(img => img.trim() !== ''),
      sizes
    };
    console.log('New Product:', newProduct);
    // TODO: POST to your /api/products-management or wherever
    setProductName('');
    setPrice('');
    setImages(['']);
    setSizes({ S: 0, M: 0, L: 0, XL: 0 });
    alert('Product created (check console for details).');
  };
  // ————————————————————————————

  return (
    <Layout>
      <div style={{ padding: '20px' }}>
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user.email}. Manage your site from here.</p>

        <section style={sectionStyle}>
          <h2>Create New Product</h2>
          <form onSubmit={handleCreateProduct} style={formStyle}>
            <label style={labelStyle}>Product Name:</label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              required
              style={inputStyle}
            />

            <label style={labelStyle}>Price:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              style={inputStyle}
            />

            <label style={labelStyle}>Images (1..N):</label>
            {images.map((img, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={img}
                  onChange={e => handleImageChange(idx, e.target.value)}
                  style={{ ...inputStyle, marginBottom: '4px' }}
                />
                <button
                  type="button"
                  onClick={() => removeImageField(idx)}
                  disabled={images.length === 1}
                  style={removeButtonStyle}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              style={addButtonStyle}
            >
              + Add Another Image
            </button>

            <label style={labelStyle}>Sizes and Quantities:</label>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {Object.keys(sizes).map(key => (
                <div key={key}>
                  <strong>{key}:</strong>
                  <input
                    type="number"
                    min="0"
                    value={sizes[key]}
                    onChange={e => handleSizeChange(key, e.target.value)}
                    style={{ width: '60px', marginLeft: '5px' }}
                  />
                </div>
              ))}
            </div>

            <button type="submit" style={submitButtonStyle}>
              Create Product
            </button>
          </form>
        </section>
      </div>
    </Layout>
  );
};

// ——— Styles ———————————————————————————————
const sectionStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '30px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};
const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  marginTop: '20px'
};
const labelStyle = { fontWeight: 'bold' };
const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  width: '100%'
};
const submitButtonStyle = {
  padding: '10px 16px',
  backgroundColor: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};
const addButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};
const removeButtonStyle = {
  marginLeft: '8px',
  padding: '8px 16px',
  backgroundColor: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};
export default AdminDashboard;
