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
        const res = await fetch('/api/orders_api', {
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
                {orders.map(order => (
                  <li key={order.id} className={styles.item}>
                    <div>
                      <strong>Order #{order.id}</strong><br/>
                      Date: {order.createdAt}<br/>
                      Status: {order.status}<br/>
                      Total: ${Number(order.totalPrice).toFixed(2)}
                    </div>
                    <Link href={`/user/order-details?orderId=${order.id}`}>
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
