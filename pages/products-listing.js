import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import Slider from "react-slick";
import { useRouter } from 'next/router';
// Import slick carousel styles
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const ALL_CATEGORIES = [ 'Sneakers', 'Sandals', 'Boots', 'Loafers', 'Heels' ];

const saleSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  arrows: true,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768,  settings: { slidesToShow: 2 } },
    { breakpoint: 480,  settings: { slidesToShow: 1 } },
  ]
};

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

const ProductListing = ({ products, onsale, selectedCategory }) => {
  const router = useRouter();
  const clothingProducts = products.filter(p =>
    p.variants?.some(v => v.stock > 0)
  );
  const filteredProducts = selectedCategory
    ? clothingProducts.filter(p => p.shoe_category === selectedCategory)
    : clothingProducts;

  return (
    <Layout>
      <div style={{ background: '#fff', minHeight: '100vh' }}>
      <nav style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          margin: '20px 0'
        }}>
          <Link legacyBehavior href="/products-listing">
            <a>
              <button
                style={{
                  padding: '8px 16px',
                  border: !selectedCategory ? '2px solid #333' : '1px solid #ccc',
                  background: !selectedCategory ? '#eee' : '#fff',
                  borderRadius: '4px'
                }}
              >All</button>
            </a>
          </Link>
          {ALL_CATEGORIES.map(cat => (
            <Link legacyBehavior key={cat} href={`/products-listing?category=${cat}`}>
              <a>
                <button
                  style={{
                    padding: '8px 16px',
                    border: selectedCategory === cat ? '2px solid #333' : '1px solid #ccc',
                    background: selectedCategory === cat ? '#eee' : '#fff',
                    borderRadius: '4px'
                  }}
                >
                  {cat}
                </button>
              </a>
            </Link>
          ))}
        </nav>
        { !selectedCategory && (
          <>
            {/* Slider at top */}
            <ImageSlider />

            {/* On Sale slider */}
            <div 
              className="on-sale-section" 
              style={{ maxWidth: '800px', margin: '20px auto', padding: '20px 0' }}
            >
              <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>On Sale</h2>
              <Slider {...saleSettings}>
                {onsale.map(product => (
                  <div key={product.id} style={{ padding: '0 8px' }}>
                    <div style={{ width: '150px', margin: '0 auto' }}>
                      <ProductCard product={product} />
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </>
        )}
        <h2 style={{ margin: '20px', textAlign: 'center' }}>
          Eco-friendly shoes for {selectedCategory || 'Men & Women'}
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
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ query }) {
  try {
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const qs = query.category ? `?category=${encodeURIComponent(query.category)}` : '';
    const res = await fetch(`${baseUrl}/api/products${qs}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const products = await res.json();
    
    // Assign a fallback image if one is missing (ensure images exist in public/images)
    const fallbackImages = ['/images/product1.jpg'];
    const productsWithImages = products.map(product => ({
      ...product,
      image: product.image || fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
    }));
    const shuffled = [...productsWithImages].sort(() => Math.random() - 0.5);
    const onsale = shuffled.slice(0, 6);
    const selectedCategory = query.category || null;
    return { props: { products: productsWithImages, onsale, selectedCategory } };
  } catch (error) {
    console.error(error);
    return { props: { products: [], onsale: [] } };
  }
}

export default ProductListing;