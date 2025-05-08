require('dotenv').config();
const { pool } = require('./db/connection');
const { faker } = require('@faker-js/faker');
const  sharp  = require('sharp'); 
const fs = require('fs');
const path = require('path');

async function clearData() {
  try {
    // truncate in dependency order to avoid FK violations
    await pool.query(`
      TRUNCATE 
        user_order_history,
        order_items,
        orders,
        product_variants,
        product_images,
        products,
        users
      RESTART IDENTITY CASCADE;
    `);
    console.log('Cleared all data from user_order_history, order_items, orders, product_variants, product_images, products, users');
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
        // const phone = faker.phone.number('(###) ###-####');
        const phone = faker.phone.number({ style: 'national' });
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
      INSERT INTO products
        (name, description, price, shoe_category, created_at, updated_at)
      VALUES ($1,$2,$3,$4, now(), now())
      RETURNING id
    `;
    const insertVariant = `
      INSERT INTO product_variants (product_id, size, stock_qty)
      VALUES ($1,$2,$3)
    `;
  
    // possible sizes
    const allSizes = ['6','7','8','9','10','11','12'];
  
    for (let i = 0; i < num; i++) {
      const name          = faker.commerce.productName();
      const description   = faker.lorem.sentences(2);
      const price         = faker.number.float({ min:20, max:200, precision:0.01 });
      const shoe_category = faker.helpers.arrayElement(
        ['Sneakers','Boots','Sandals','Loafers','Heels']
      );
      try {
        const { rows } = await pool.query(insertProduct,
          [name, description, price, shoe_category]);
        const productId = rows[0].id;
  
        // pick 4 distinct sizes
        const sizes = faker.helpers.arrayElements(allSizes, 4);
        for (const size of sizes) {
          const stock_qty = faker.number.int({ min: 0, max: 50 });
          await pool.query(insertVariant, [productId, size, stock_qty]);
        }
        console.log(`Product ${productId} → variants: ${sizes.join(', ')}`);
      } catch (err) {
        console.error('Error inserting product:', err);
      }
    }
  }

async function seedProductImages() {
    const insertImageQuery = `
      INSERT INTO product_images (product_id, image_url, is_primary)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
  
    const baseImages = [ 'image1.jpg','image2.jpg','image3.jpg','image4.jpg','image5.jpg' ];
    const variants = [
      { name: 'red',    hex: '#f44336' },
      { name: 'green',  hex: '#4caf50' }, 
      { name: 'blue',   hex: '#2196f3' },
      { name: 'yellow', hex: '#ffeb3b' },
      { name: 'purple', hex: '#9c27b0' },
      { name: 'pink',   hex: '#e91e63' },
      { name: 'orange', hex: '#ff9800' },
      { name: 'teal',   hex: '#009688' },
      { name: 'grey',   hex: '#9e9e9e' },
    ];
  
    // ensure green is first
    const primary = variants.find(v => v.name === 'green');
    const others  = variants.filter(v => v.name !== 'green');
    const ordered = [ primary, ...others ];
  
    const outDir = path.join(__dirname, 'public/images/variants');
    fs.mkdirSync(outDir, { recursive: true });
  
    const { rows }    = await pool.query(`SELECT id FROM products`);
    const productIds  = rows.map(r => r.id);
  
    for (const product_id of productIds) {
      const base  = baseImages[Math.floor(Math.random() * baseImages.length)];
      const basePath = path.join(__dirname, 'public/images', base);
  
      let isFirst = true;
      for (const { name, hex } of ordered) {
        const outName = `${path.basename(base, '.jpg')}_${name}.jpg`;
        const outPath = path.join(outDir, outName);
  
        await sharp(basePath)
          .tint(hex)
          .toFile(outPath);
  
        const url = `/images/variants/${outName}`;
        // mark only the green‐tinted image as primary
        await pool.query(insertImageQuery, [product_id, url, isFirst]);
        isFirst = false;
      }
    }
  }

async function seedData() {
    try {
        await clearData();
        // await seedUsers();
        await seedProducts();
        await seedProductImages();
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

seedData();