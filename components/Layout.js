import React from 'react';
import Link from 'next/link';
import styles from '../styles/layout.module.css';
import { useRouter } from 'next/router';
import { useUser } from '../lib/useUser';

const Layout = ({ children }) => {
  const router = useRouter();
  const { user, loading, isError } = useUser();

  const handleSignout = async () => {
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include'
    });
    router.push('/signin');
  };

  return (
    <div className={styles.layoutContainer}>
      <header className={styles.siteHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.siteTitle}>GreenShoes</h1>
          <nav className={styles.siteNav}>
            <Link href="/">Home</Link>
            <Link href="/products-listing">Product</Link>
            <Link href="/orders">Orders</Link>
            <Link href="/cart">Cart</Link>

            {/* Show Sign Out only when user is logged in */}
            {!loading && !isError && user && (
              <button onClick={handleSignout}>
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className={styles.siteMain}>{children}</main>
      <footer className={styles.siteFooter}>
        <p>&copy; {new Date().getFullYear()} GreenShoes. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
