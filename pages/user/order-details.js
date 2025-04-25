import { useUserContext } from '../../lib/UserContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import styles from '../../styles/user-dashboard.module.css';

export default function OrderDetails() {
  const router = useRouter();
  const { user } = useUserContext(); // Get user information
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const orderId = router.query.orderId;

  useEffect(() => {
    if (!orderId) return;

    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, { credentials: 'include' });
        if (!res.ok) throw new Error();
        const { order } = await res.json();
        setOrder(order);
      } catch {
        setError('Failed to load order details');
      }
    })();
  }, [orderId]);

  return (
    <Layout>
      <div className={styles.container}>
        <h2>Order Details</h2>

        {error && <p className={styles.error}>{error}</p>}
        {!error && !order && <p>Loading…</p>}

        {order && (
          <div className={styles.item}>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Date:</strong> {order.date}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ${Number(order.total).toFixed(2)}</p>

            <h3 style={{ marginTop: '1rem' }}>Items</h3>
            <ul className={styles.list}>
              {order.items.map(item => (
                <li key={item.id || `${item.productName}-${item.quantity}`} className={styles.item}>
                  <div>
                    {item.productName} — {item.quantity} × ${Number(item.price).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              {user ? (
                <Link href="/user/dashboard">
                  <button className={styles.manageBtn}>
                    Back to Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/orders">
                  <button className={styles.manageBtn}>
                    Back to Order Lookup
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
