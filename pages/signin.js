// pages/signin.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUserContext } from '../lib/UserContext';
import Layout from '../components/Layout';
import styles from '../styles/signin.module.css';

export default function SigninPage() {
  const router = useRouter();
  const { user, loading, setUser } = useUserContext();
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    }
  }, [user, loading, router]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const body = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(body.message || 'Login failed');
      return;
    }
    setUser(body.user);
  };

  if (loading || user) return null;

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.heading}>Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className={styles.button} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className={styles.linkText}>
          Don't have an account? <a href="/signup" className={styles.link}>Sign up here</a>
        </p>
      </div>
    </Layout>
  );
}
