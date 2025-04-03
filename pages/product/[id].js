import Layout from '../../components/Layout';
import { addToCart } from '../../utils/cartUtils';
import { useState } from 'react';
import React from 'react';

// Static list of products (for demo purposes)
const products = [
    { id: 1, name: 'Green Sneakers', price: '$50', image: '/images/product1.jpg' },
    { id: 2, name: 'Blue Running Shoes', price: '$70', image: '/images/product2.jpg' },
    { id: 3, name: 'Red High Heels', price: '$90', image: '/images/product3.jpg' },
];

// Product detail component (rendered per product)
const Product = ({ product }) => {
    const [quantity, setQuantity] = useState(1); // Quantity state

    // Add item to cart with selected quantity
    const handleAddToCart = () => {
        const numericPrice = parseFloat(product.price.replace('$', ''));
        const productData = {
            id: product.id,
            name: product.name,
            price: numericPrice,
            image: product.image,
        };

        addToCart(productData, quantity); // Call utility function to store in cookie
        alert('Item added to cart!');
    };

    return (
        <Layout>
            <div className="container">
                <div className="product-page">
                    {/* Product title and price */}
                    <div className="product-header">
                        <h1>{product.name}</h1>
                        <p className="price">{product.price}</p>
                    </div>

                    {/* Main content: image + info */}
                    <div className="product-details">
                        <div className="product-image">
                            <img src={product.image} alt={product.name} />
                        </div>

                        <div className="product-info">
                            {/* Size selection (not functional) */}
                            <div className="product-size">
                                <label>Size:</label>
                                <div className="size-buttons">
                                    <button>Women</button>
                                    <button>Men</button>
                                </div>
                                <select>
                                    <option>Choose Size</option>
                                    <option>Small</option>
                                    <option>Medium</option>
                                    <option>Large</option>
                                </select>
                            </div>

                            {/* Quantity input */}
                            <div className="product-quantity">
                                <label>Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                />
                            </div>

                            {/* Add to cart button */}
                            <button className="add-to-cart" onClick={handleAddToCart}>
                                Add To Cart
                            </button>

                            {/* Product description */}
                            <p className="description">
                                Discover our eco-friendly {product.name.toLowerCase()}, crafted using sustainable materials to help protect our planet.
                            </p>
                        </div>
                    </div>

                    {/* Related product section (placeholder) */}
                    <div className="related-products">
                        <h2>More Eco-Friendly Picks</h2>
                        <div className="related-products-list">
                            <div className="related-product">Eco Sneaker 1</div>
                            <div className="related-product">Eco Sneaker 2</div>
                            <div className="related-product">Eco Sneaker 3</div>
                            <div className="related-product">Eco Sneaker 4</div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Generate paths for static generation
export async function getStaticPaths() {
    const paths = products.map(prod => ({
        params: { id: prod.id.toString() },
    }));
    return { paths, fallback: false };
}

// Fetch product data at build time
export async function getStaticProps({ params }) {
    const product = products.find(prod => prod.id.toString() === params.id);
    return { props: { product } };
}

export default Product;
