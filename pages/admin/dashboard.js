import React, { useState } from 'react';
import Layout from '../../components/Layout';

const AdminDashboard = () => {
    // store form information when creating a new product
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [images, setImages] = useState(['']); 
    // size
    const [sizes, setSizes] = useState({
        S: 0,
        M: 0,
        L: 0,
        XL: 0
    });

    // Added image URL input
    const handleImageChange = (index, value) => {
        const newImages = [...images];
        newImages[index] = value;
        setImages(newImages);
    };

    // Add an input box for a new image
    const addImageField = () => {
        setImages([...images, '']);
    };

    // Remove an image input box
    const removeImageField = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    // Handling size quantity changes
    const handleSizeChange = (sizeKey, value) => {
        setSizes((prev) => ({
            ...prev,
            [sizeKey]: Number(value)
        }));
    };

    // Submit form logic (this is just an example and can be replaced with the actual backend request)
    const handleCreateProduct = (e) => {
        e.preventDefault();
        // Assembling product data
        const newProduct = {
            name: productName,
            price,
            images: images.filter((img) => img.trim() !== ''), // Filter empty strings
            sizes
        };

        // Make a request to the backend API here, for example：
        // fetch('/api/products', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(newProduct),
        // }).then(...).catch(...);

        console.log('New Product:', newProduct);

        // Reset Form
        setProductName('');
        setPrice('');
        setImages(['']);
        setSizes({ S: 0, M: 0, L: 0, XL: 0 });
        alert('Product created (check console for details).');
    };

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1>Admin Dashboard</h1>
                <p>Welcome, Admin. Manage your site from here.</p>

                {/* 
                  1) Do not provide shopping functions/links to prevent administrators from shopping as administrators.
                  2) Only provides product creation and management functions.
                */}

                {/* Section container for the "Create New Product" form */}
                <section style={sectionStyle}>
                    <h2>Create New Product</h2>
                    {/* Form element with a submission handler and custom styling */}
                    <form onSubmit={handleCreateProduct} style={formStyle}>
                        {/* Label for the product name input */}
                        <label style={labelStyle}>Product Name:</label>
                        {/* Input field for entering the product name */}
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                            style={inputStyle}
                        />

                        {/* Label for the product price input */}
                        <label style={labelStyle}>Price:</label>
                        {/* Input field for entering the product price.
                            It accepts decimal numbers (step of 0.01) and does not allow negative values.  */}
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            style={inputStyle}
                        />

                        {/* Label for the image URLs section */}
                        <label style={labelStyle}>Images (1..N):</label>
                        {/*  Button to add another image URL input field */}
                        {images.map((img, index) => (
                            <div key={index} style={{ marginBottom: '8px' }}>
                                <input
                                    type="text"
                                    placeholder="Image URL"
                                    value={img}
                                    onChange={(e) => handleImageChange(index, e.target.value)}
                                    style={{ ...inputStyle, marginBottom: '4px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImageField(index)}
                                    style={removeButtonStyle}
                                    disabled={images.length === 1}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addImageField} style={addButtonStyle}>
                            + Add Another Image
                        </button>

                        {/*  Label for the sizes and quantities section */}
                        <label style={labelStyle}>Sizes and Quantities:</label>
                        {/* Container to layout sizes and their corresponding quantity inputs */}
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            {Object.keys(sizes).map((sizeKey) => (
                                <div key={sizeKey}>
                                    <strong>{sizeKey}:</strong>
                                    <input
                                        type="number"
                                        min="0"
                                        value={sizes[sizeKey]}
                                        onChange={(e) => handleSizeChange(sizeKey, e.target.value)}
                                        style={{ width: '60px', marginLeft: '5px' }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Submit button to create the product */}
                        <button type="submit" style={submitButtonStyle}>
                            Create Product
                        </button>
                    </form>
                </section>
            </div>
        </Layout>
    );
};

// style
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

const labelStyle = {
    fontWeight: 'bold'
};

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
