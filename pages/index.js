// pages/index.js
import Link from 'next/link';
import Layout from '../components/Layout';
import { pool } from '../db/connection';
import { useUserContext } from '../lib/UserContext';
import styles from '../styles/Home.module.css';

export default function Home({ products }) {
  const { user, loading } = useUserContext();

  return (
    <Layout>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to GreenShoes</h1>
        {!loading && user && (
          <p className={styles.greeting}>Welcome back, {user.name}!</p>
        )}
        <p className={styles.subtitle}>
          Your one-stop shop for all things footwear.
        </p>
        <div className={styles.buttonRow}>
          <Link href="/products-listing">
            <button className={styles.primaryBtn}>Shop Now</button>
          </Link>
          {!loading && user ? (
            <Link href={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}>
              <button className={styles.primaryBtn}>Dashboard</button>
            </Link>
          ) : !loading ? (
            <>
              <Link href="/signin">
                <button className={styles.secondaryBtn}>Sign In</button>
              </Link>
              <Link href="/signup">
                <button className={styles.secondaryBtn}>Sign Up</button>
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <div className={styles.showcase}>
        {products.length > 0 ? (
          products.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} legacyBehavior>
              <a className={styles.card}>
                <img
                  src={p.image_url || '/images/default.jpg'}
                  alt={p.name}
                  className={styles.cardImage}
                />
                <h3 className={styles.cardTitle}>{p.name}</h3>
                <p className={styles.cardPrice}>${p.price}</p>
              </a>
            </Link>
          ))
        ) : (
          <p className={styles.noProducts}>No products available</p>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const query = `
      SELECT id, name, price,
        (SELECT image_url FROM product_images
         WHERE product_id = products.id AND is_primary = true LIMIT 1)
        AS image_url
      FROM products
      WHERE stock_quantity > 0
      ORDER BY RANDOM()
      LIMIT 3
    `;
    const client = await pool.connect();
    const { rows } = await client.query(query);
    client.release();
    const products = rows.map(p => ({ ...p, price: parseFloat(p.price) }));
    return { props: { products } };
  } catch {
    return { props: { products: [] } };
  }
}
