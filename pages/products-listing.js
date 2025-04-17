import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

const ProductListing = ({ products }) => {
    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Product List</h1>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '30px'
                    }}
                >
                    {products.map(product => (
                        <div
                            key={product.id}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '250px',
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0' }}>{product.name}</h3>
                                <p style={{ margin: '0 0 20px 0', fontWeight: 'bold' }}>
                                    ${Number(product.price).toFixed(2)}
                                </p>
                                <Link legacyBehavior href={`/product/${product.id}`}>
                                    <a
                                        style={{
                                            display: 'inline-block',
                                            padding: '10px 20px',
                                            backgroundColor: '#0070f3',
                                            color: '#fff',
                                            borderRadius: '5px',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        View Details
                                    </a>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export async function getServerSideProps() {
    try {
        // Adjust the API URL if needed. You can also use an environment variable.
        const res = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/api/products`);
        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await res.json();

        // Assign a fallback image if needed
        const fallbackImages = [
            '/images/product1.jpg',
        ];
        const productsWithImages = products.map(product => ({
            ...product,
            image: product.image || fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
        }));

        return { props: { products: productsWithImages } };
    } catch (error) {
        console.error(error);
        return { props: { products: [] } };
    }
}

export default ProductListing;
