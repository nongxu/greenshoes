import Layout from '../../components/Layout';
import { addToCart } from '../../utils/cartUtils';
import { useState } from 'react';
import React from 'react';

const Product = ({ product }) => {
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
            image: product.image,
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
                        <p className="price">${Number(product.price).toFixed(2)}</p>
                    </div>

                    <div className="product-details">
                        <div className="product-image">
                            <img src={product.image} alt={product.name} />
                        </div>

                        <div className="product-info">
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

                            <div className="product-quantity">
                                <label>Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.stock_quantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                />
                            </div>

                            <button className="add-to-cart" onClick={handleAddToCart}>
                                Add To Cart
                            </button>

                            <p className="description">
                                {product.description}
                            </p>
                        </div>
                    </div>

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


export async function getServerSideProps({ params }) {
    const res = await fetch(`http://localhost:3000/api/product/${params.id}`);
    if (!res.ok) {
        return { notFound: true };
    }

    const product = await res.json();

    const fallbackImages = [
        '/images/product1.jpg'
    ];
    if(!product.image){
        product.image = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    }

    return {
        props: {
            product,
        },
    };
}

export default Product;
