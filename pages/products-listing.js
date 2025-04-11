import Layout from '../components/Layout';
import Link from 'next/link';

const ProductListing = ({ products }) => {
    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1 style={{ textAlign: 'center' }}>Product Listing</h1>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '20px',
                        marginTop: '20px'
                    }}
                >
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
                            <img
                                src={product.image}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover'
                                }}
                            />
                            <div style={{ padding: '10px' }}>
                                <h3>{product.name}</h3>
                                <p>${Number(product.price).toFixed(2)}</p>
                                <Link href={`/product/${product.id}`}>
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

export async function getServerSideProps() {
    const res = await fetch('http://localhost:3000/api/products');
    const products = await res.json();

    const fallbackImages = [
        '/images/product1.jpg',
        '/images/product2.jpg',
        '/images/product3.jpg',
        '/images/product4.jpg',
    ];

    // 为每个产品临时添加一张图片（随机）
    products.forEach((product) => {
        product.image = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    });

    return {
        props: {
            products,
        },
    };
}

export default ProductListing;
