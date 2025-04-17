require('dotenv').config();
const { pool } = require('./db/connection');
const { faker } = require('@faker-js/faker');

async function clearData() {
    try {
        await pool.query('DELETE FROM product_images');
        await pool.query('DELETE FROM products');
        await pool.query('DELETE FROM users');
        console.log('Cleared all data from product_images, products, and users tables');
    } catch (err) {
        console.error(`Error clearing data: ${err.message}`);
    }
}


async function seedUsers(num = 10) {
    const insertUser = `
        INSERT INTO users (email, password_hash, full_name, phone, address, created_at)
        VALUES ($1, $2, $3, $4, $5, now())
        RETURNING id;
    `;
    for (let i = 0; i < num; i++) {
        const email = faker.internet.email();
        // For testing purposes we store plain text; in production, hash your password.
        const password_hash = faker.internet.password();
        const full_name = faker.person.fullName(); // new API
        const phone = faker.phone.number('(###) ###-####');
        const address = faker.location.streetAddress(); // new API

        try {
            const res = await pool.query(insertUser, [email, password_hash, full_name, phone, address]);
            console.log(`Inserted user with id: ${res.rows[0].id}`);
        } catch (err) {
            console.error(`Error inserting user: ${err.message}`);
        }
    }
}

async function seedProducts(num = 10) {
    const insertProduct = `
        INSERT INTO products (name, description, price, stock_quantity, shoe_category, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, now(), now())
        RETURNING id;
    `;
    for (let i = 0; i < num; i++) {
        const name = faker.commerce.productName();
        const description = faker.lorem.sentences();
        const price = faker.commerce.price(20, 200, 2);
        const stock_quantity = faker.number.int({ min: 0, max: 100 });
        const shoe_category = faker.helpers.arrayElement(['Sneakers', 'Boots', 'Sandals', 'Heels']);

        try {
            const res = await pool.query(insertProduct, [name, description, price, stock_quantity, shoe_category]);
            console.log(`Inserted product with id: ${res.rows[0].id}`);
        } catch (err) {
            console.error(`Error inserting product: ${err.message}`);
        }
    }
}

async function seedProductImages() {
    const insertImageQuery = `
        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES ($1, $2, $3)
        RETURNING id;
    `;
    // List of local image URLs (adjust the paths if necessary)
    const localImages = [
        '/images/image1.jpg',
        '/images/image2.jpg',
        '/images/image3.jpg',
        '/images/image4.jpg',
        '/images/image5.jpg'
    ];

    try {
        const res = await pool.query(`SELECT id FROM products`);
        const productIds = res.rows.map(row => row.id);

        // For each product, insert one primary image
        for (const product_id of productIds) {
            const image_url = faker.helpers.arrayElement(localImages);
            // Set is_primary to true so every product gets at least one image.
            const imageRes = await pool.query(insertImageQuery, [product_id, image_url, true]);
            console.log(`Inserted primary image with id: ${imageRes.rows[0].id} for product ${product_id}`);
        }
    } catch (err) {
        console.error(`Error inserting product image: ${err.message}`);
    }
}

async function seedData() {
    try {
        await clearData();
        await seedUsers();
        await seedProducts();
        await seedProductImages();
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

seedData();