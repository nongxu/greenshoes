import Link from 'next/link';
import Layout from '../components/Layout';

// Home component representing the homepage
const Home = () => {
    return (
        <Layout>
            {/* Layout component provides a consistent page structure */}
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                {/* Main container with centered text and vertical padding */}
                <h1>Welcome to GreenShoes</h1>
                {/* Main title of the homepage */}
                <p>Your one-stop shop for all things footwear!</p>
                {/* Tagline for the website */}
                <div style={{ marginTop: '50px' }}>
                    {/* Container for the "Shop Now" button */}
                    <Link href="/products-listing">
                        {/* Link navigates to the products listing page */}
                        <button style={buttonStyle}>Shop Now</button>
                        {/* "Shop Now" button styled with buttonStyle */}
                    </Link>
                </div>
                <div
                    style={{
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px'
                    }}
                >
                    {/* Container for "Signin" and "Signup" buttons, displayed side by side */}
                    <Link href="/signin">
                        {/* Link navigates to the signin (login) page */}
                        <button style={buttonStyle}>Signin</button>
                        {/* "Signin" button, renamed from Login */}
                    </Link>
                    <Link href="/signup">
                        {/* Link navigates to the signup page */}
                        <button style={buttonStyle}>Signup</button>
                        {/* "Signup" button added */}
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

// Button styling object for consistent styling of all buttons
const buttonStyle = {
    padding: '14px 28px',           // Padding inside the button
    fontSize: '16px',               // Font size of the button text
    backgroundColor: '#28a745',     // Green background color
    color: '#fff',                  // White text color
    border: 'none',                 // No border
    borderRadius: '8px',            // Rounded corners with an 8px radius
    cursor: 'pointer'               // Pointer cursor on hover
};

export default Home;
