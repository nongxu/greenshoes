import Layout from '../components/Layout';
import Link from 'next/link';

const products = [
    { id: 1, name: 'Green Sneakers', price: '$50', image: '/images/product1.jpg' },
    { id: 2, name: 'Blue Running Shoes', price: '$70', image: '/images/product2.jpg' },
    { id: 3, name: 'Red High Heels', price: '$90', image: '/images/product3.jpg' },
    // More product data can be added
];

const ProductListing = () => {
    return (
        <Layout>
{/* Layout component for consistent page layout */}
            {/* Layout component for consistent page layout */}
            <div style={{ padding: '20px' }}>
                {/*  Outer container with 20px padding */}
                <h1 style={{ textAlign: 'center' }}>Product Listing</h1>
                {/* Page title centered as "Product Listing" */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '20px',
                        marginTop: '20px'
                    }}
                >
                    {/* Using CSS Grid layout with auto-fill, each grid cell has a minimum width of 250px, with a 20px gap */}
                    {products.map(product => (
                        <div
                            key={product.id}
                            style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                textAlign: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Each product card with border, rounded corners, hidden overflow, centered text, and a subtle shadow */}
                            <img
                                src={product.image}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover'
                                }}
                            />
                            {/* Product image with 100% width, fixed height of 200px, and cover object-fit */}
                            <div style={{ padding: '10px' }}>
                                {/* Container for product information with 10px padding */}
                                <h3>{product.name}</h3>
                                {/* Product name */}
                                <p>{product.price}</p>
                                {/* Product price */}
                                <Link href={`/product/${product.id}`}>
                                    {/* Link to the product detail page */}
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            marginTop: '10px',
                                            padding: '8px 16px',
                                            backgroundColor: '#0070f3',
                                            color: '#fff',
                                            borderRadius: '4px',
                                            textDecoration: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        View Details
                                        {/* "View Details" button styled as a clickable span */}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};


export default ProductListing;
