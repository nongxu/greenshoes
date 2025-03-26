import Layout from '../components/Layout';
import React from 'react';

const Product = () => {
    return (
        <Layout>
            <div className="container">
                <div className="product-page">
                    <div className="product-header">
                        <h1>Eco-Friendly Green Shoes</h1>
                        <p className="price">$20</p>
                    </div>
                    <div className="product-details">
                        <div className="product-image">
                            <img src="/images/green-shoe.jpg" alt="Eco-friendly Green Shoe" />
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
                                <input type="number" min="1" defaultValue="1" />
                            </div>
                            <button className="add-to-cart">Add To Cart</button>
                            <p className="description">
                                Discover our eco-conscious green shoes, crafted using sustainable materials to help protect our planet.
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

export default Product;