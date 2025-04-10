require('dotenv').config();
const { pool } = require('./db/connection');
const { faker } = require('@faker-js/faker');

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

async function seedData() {
    try {
        await seedUsers();
        await seedProducts();
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

seedData();