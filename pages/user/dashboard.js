// pages/user/dashboard.js
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useUserContext } from '../../lib/UserContext';
import Link from 'next/link';
import styles from '../../styles/user-dashboard.module.css';

export default function Dashboard() {
  const { user } = useUserContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch('/api/orders', {
          credentials: 'include'
        });
        if (!res.ok) throw new Error();
        const { orders } = await res.json();
        setOrders(orders);
      } catch {
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <Layout>
      <div className={styles.container}>
        <h2>User Dashboard</h2>

        {loading && <p>Loading order history…</p>}
        {error && !loading && <p className={styles.error}>{error}</p>}

        {!loading && !error && (
          <>
            {orders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              <ul className={styles.list}>
                {orders.map(o => (
                  <li key={o.id} className={styles.item}>
                    <div>
                      <strong>Order #{o.id}</strong><br/>
                      Date: {o.date}<br/>
                      Status: {o.status}<br/>
                      Total: ${o.total.toFixed(2)}
                    </div>
                    <Link href={`/orders/${o.id}`}>
                      <button className={styles.viewBtn}>
                        View Details
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div style={{ textAlign:'center', marginTop: '2rem' }}>
          <Link href="/user/address">
            <button className={styles.manageBtn}>
              Manage Addresses
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
