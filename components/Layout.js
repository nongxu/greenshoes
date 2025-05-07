// components/Layout.js
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUserContext } from '../lib/UserContext';
import styles from '../styles/layout.module.css';

export default function Layout({ children }) {
  const router = useRouter();
  const { user, loading, setUser } = useUserContext();

  const handleSignout = async () => {
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
    router.push('/');
  };

  return (
    <div className={styles.layoutContainer}>
      <header className={styles.siteHeader}>
        <div className={styles.headerContent}>
          <Link href="/" legacyBehavior>
            <a className={styles.siteTitle}>GreenShoes</a>
          </Link>
          <nav className={styles.siteNav}>
            <Link href="/" legacyBehavior>
              <a className={styles.navLink}>Home</a>
            </Link>
            {/* only regular users get shopping links */}
            {!loading && user?.role !== 'admin' && (
              <>
                <Link href="/products-listing" legacyBehavior>
                  <a className={styles.navLink}>Products</a>
                </Link>
                <Link href="/orders" legacyBehavior>
                  <a className={styles.navLink}>Orders</a>
                </Link>
                <Link href="/cart" legacyBehavior>
                  <a className={styles.navLink}>Cart</a>
                </Link>
              </>
            )}
            {!loading && user && (
              <Link href={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} legacyBehavior>
                <a className={styles.navLink}>Dashboard</a>
              </Link>
            )}
            {!loading && user && (
              <button onClick={handleSignout} className={styles.signoutBtn}>
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className={styles.siteMain}>{children}</main>
      <footer className={styles.siteFooter}>
        &copy; {new Date().getFullYear()} GreenShoes
      </footer>
    </div>
  );
}
