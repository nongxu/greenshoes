import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import Slider from "react-slick";

// Import slick carousel styles
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const ImageSlider = () => {
    const settings = {
      dots: true,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4000,
    };
  
    const sliderContainerStyle = {
        width: "100%",
        height: "200px",  // reduce height from 400px or 40px to a value that looks good
        overflow: "hidden",
      };
    
      const imgStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
      };
  
    return (
      <div style={{ maxWidth: "1000px", margin: "20px auto", paddingTop: "20px" }}>
        <Slider {...settings}>
          <div style={sliderContainerStyle}>
            <img src="/images/slider1.png" alt="image1" style={imgStyle} />
          </div>
          <div style={sliderContainerStyle}>
            <img src="/images/slider2.png" alt="image2" style={imgStyle} />
          </div>
          <div style={sliderContainerStyle}>
            <img src="/images/slider3.png" alt="image3" style={imgStyle} />
          </div>
          <div style={sliderContainerStyle}>
            <img src="/images/slider4.png" alt="image4" style={imgStyle} />
          </div>
        </Slider>
      </div>
    );
  };

  const ProductCard = ({ product }) => (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        minWidth: '100%', // will take full width of grid cell
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      }}
    >
      <Link legacyBehavior href={`/product/${product.id}`}>
        <a style={{ textDecoration: 'none', color: 'inherit' }}>
          <div>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
              }}
            />
          </div>
          <div style={{ padding: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>
              {product.name}
            </h3>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#555' }}>
              USD {Number(product.price).toFixed(2)}
            </h2>
            {/* Removed the View Details button */}
          </div>
        </a>
      </Link>
    </div>
  );

const ProductListing = ({ products }) => {
  // Assuming products have an isAccessory property for filtering
  const clothingProducts = products.filter(
    product => !product.isAccessory && product.stock_quantity > 0   // Filter products with 0 stock
  );  

  return (
    <Layout>
      <div style={{ background: '#fff', minHeight: '100vh' }}>
        {/* Slider at top */}
        <ImageSlider />
        <h2 style={{ margin: '20px', textAlign: 'center' }}>
          Eco-friendly shoes for Men & Women
        </h2>
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)', // at most 5 per row
            gap: '20px',
            padding: '20px',
          }}
        >
          {clothingProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/api/products`);
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await res.json();
    
    // Assign a fallback image if one is missing (ensure images exist in public/images)
    const fallbackImages = ['/images/product1.jpg'];
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