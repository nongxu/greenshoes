import Link from 'next/link';
import Layout from '../components/Layout';

// Home component representing the homepage
const Home = () => {
    return (
        <Layout>
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <h1>Welcome to GreenShoes</h1>
                <p>Your one-stop shop for all things footwear!</p>

                {/* Shop Now Button */}
                <div style={{ marginTop: '50px' }}>
                    <Link href="/products-listing">
                        <button style={shopNowButtonStyle}>Shop Now</button>
                    </Link>
                </div>

                {/* Signin/Signup Buttons */}
                <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px'
                }}>
                    <Link href="/signin">
                        <button style={buttonStyle}>Signin</button>
                    </Link>
                    <Link href="/signup">
                        <button style={buttonStyle}>Signup</button>
                    </Link>
                </div>

                {/* Product Showcase Section */}
                <div style={{
                    marginTop: '80px',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '40px',
                    flexWrap: 'wrap'
                }}>
                    {products.map((product, index) => (
                        <div key={index} style={productCardStyle}>
                            <img
                                src={product.image}
                                alt={product.name}
                                style={{ width: '100%', borderRadius: '8px' }}
                            />
                            <h3>{product.name}</h3>
                            <p>${product.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

// Shop Now button with more emphasis
const shopNowButtonStyle = {
    padding: '16px 36px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #28a745, #218838)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
};

// Normal button style for signin/signup
const buttonStyle = {
    padding: '14px 28px',
    fontSize: '16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
};

// Product card style
const productCardStyle = {
    width: '200px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
};

// Sample product data
const products = [
    {
        name: 'Classic Sneakers',
        price: '59.99',
        image: '/images/shoe1.jpg'
    },
    {
        name: 'Running Shoes',
        price: '79.99',
        image: '/images/shoe2.jpg'
    },
    {
        name: 'Stylish Loafers',
        price: '69.99',
        image: '/images/shoe3.jpg'
    }
];

export default Home;
