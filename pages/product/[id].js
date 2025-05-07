import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { addToCart } from '../../utils/cartUtils';
import dynamic from 'next/dynamic';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Slider = dynamic(() => import('react-slick'), { ssr: false });

// Custom Next Arrow
const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        zIndex: 2,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}
    >
      &rarr;
    </div>
  );
};

// Custom Prev Arrow
const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        zIndex: 2,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}
    >
      &larr;
    </div>
  );
};

const sliderSettings = {
  dots: true,
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  lazyLoad: 'ondemand',
  adaptiveHeight: true,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  // Append dots under image with custom styling
  appendDots: dots => (
    <div style={{ marginTop: '10px', textAlign: 'center' }}>
      <ul style={{ margin: 0, padding: 0, display: 'inline-block' }}> {dots} </ul>
    </div>
  ),
  customPaging: i => (
    <div
      style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#ccc',
        display: 'inline-block'
      }}
    ></div>
  )
};

const Product = ({ product, relatedProducts }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (quantity > product.stock_quantity) {
      alert(`Only ${product.stock_quantity} item(s) left in stock.`);
      return;
    }
    const productData = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    };
    addToCart(productData, quantity);
    alert('Item added to cart!');
  };

  return (
    <Layout>
      <div className="container">
        <div className="product-page">
          <div className="product-header">
            <h1>{product.name}</h1>
            <p className="price">${parseFloat(product.price).toFixed(2)}</p>
          </div>

          <div className="product-details">
            <div className="product-image" style={{ position: 'relative', width: '400px', margin: '0 auto', display: 'inline-block', overflow: 'hidden' }}>
              <Slider {...sliderSettings}>
                {product.images.map((src, i) => (
                  <div key={i}>
                    <img
                      src={src}
                      alt={`${product.name} view ${i + 1}`}
                      loading="lazy"
                      style={{ width: '100%', display: 'block' }}
                    />
                  </div>
                ))}
              </Slider>
            </div>

            <div className="product-info">
              <div className="product-size">
                <label>Size:</label>
                <select>
                  <option>Choose Size</option>
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>

              <div className="product-quantity">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                />
              </div>

              <button className="add-to-cart" onClick={handleAddToCart}>
                Add To Cart
              </button>

              <p className="description">{product.description}</p>
            </div>
          </div>

          <div className="related-products">
            <h2>More Eco-Friendly Picks</h2>
            <div className="related-products-list" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              {relatedProducts.map(rp => (
                <Link legacyBehavior key={rp.id} href={`/product/${rp.id}`}>
                  <a style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
                    <img 
                      src={rp.image} 
                      alt={rp.name} 
                      style={{ width: '150px', height: 'auto', borderRadius: '4px', marginBottom: '8px' }} 
                    />
                    <p>{rp.name}</p>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ params }) {
    // Fetch current product
    const res = await fetch(`http://localhost:3000/api/product/${params.id}`);
    if (!res.ok) return { notFound: true };
    const product = await res.json();
  
    // Normalize image URLs for product
    let imgs = Array.isArray(product.images) ? product.images : [];
    imgs = imgs.map(u => u.startsWith('/') ? u : `/images/${u}`);
    if (imgs.length === 0) imgs = ['/images/default.jpg'];
    product.images = imgs;
  
    // Fetch related products (4 random products excluding the current one)
    let relatedProducts = [];
    try {
        const relRes = await fetch(`http://localhost:3000/api/products?exclude=${product.id}&limit=4`);
        if (relRes.ok) {
        relatedProducts = await relRes.json();
        relatedProducts = Array.isArray(relatedProducts)
            ? relatedProducts.map(rp => {
                let img = rp.image;
                if (!img || img === '') {
                img = '/images/default.jpg';
                } else if (!img.startsWith('/')) {
                img = `/images/${img}`;
                }
                return { ...rp, image: img };
            })
            : [];
        }
    } catch (error) {
        console.error('Error fetching related products:', error);
    }
    
    return { props: { product, relatedProducts } };
    }

export default Product;
