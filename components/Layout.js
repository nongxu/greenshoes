import React from 'react';
import Link from 'next/link';
import styles from '../styles/layout.module.css';

const Layout = ({ children }) => {
    return (
        <div className={styles.layoutContainer}>
            <header className={styles.siteHeader}>
                <div className={styles.headerContent}>
                    <h1 className={styles.siteTitle}>GreenShoes</h1>
                    <nav className={styles.siteNav}>
                        <Link href="/">Home</Link>
                        <Link href="/products-listing">Product</Link>
                        <Link href="/cart">Cart</Link>
                    </nav>
                </div>
            </header>
            <main className={styles.siteMain}>
                {children}
            </main>
            <footer className={styles.siteFooter}>
                <p>&copy; {new Date().getFullYear()} GreenShoes. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
