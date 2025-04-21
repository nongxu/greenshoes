// pages/user/address.js
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useUserContext } from '../../lib/UserContext';
import styles from '../../styles/user-address.module.css';

export default function AddressBook() {
  const { user } = useUserContext();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load addresses once on mount (after we know `user`)
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch('/api/addresses', {
          credentials: 'include'
        });
        if (!res.ok) throw new Error();
        setAddresses(await res.json());
      } catch {
        setError('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleAdd = async () => {
    if (!form.name || !form.address) return;
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      const newAddr = await res.json();
      setAddresses(a => [...a, newAddr]);
      setForm({ name: '', address: '' });
    } catch {
      setError('Could not add address');
    }
  };

  const handleDelete = async idx => {
    try {
      const res = await fetch(`/api/addresses/${idx}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error();
      setAddresses(a => a.filter((_, i) => i !== idx));
    } catch {
      setError('Could not delete address');
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2>Manage Shipping Addresses</h2>
        {error && <p className={styles.error}>{error}</p>}

        <section className={styles.formSection}>
          <h3>Add New Address</h3>
          <input
            name="name"
            placeholder="Recipient Name"
            value={form.name}
            onChange={handleChange}
            className={styles.input}
          />
          <input
            name="address"
            placeholder="Shipping Address"
            value={form.address}
            onChange={handleChange}
            className={styles.input}
          />
          <button onClick={handleAdd} className={styles.addButton}>
            Add Address
          </button>
        </section>

        <section>
          <h3>Your Addresses</h3>
          {loading ? (
            <p>Loading…</p>
          ) : (
            <ul className={styles.list}>
              {addresses.map((addr, idx) => (
                <li key={idx} className={styles.item}>
                  <div>
                    <strong>{addr.name}</strong>
                    <p>{addr.address}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(idx)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
}
