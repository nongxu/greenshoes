// pages/signup.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUserContext } from '../lib/UserContext';
import Layout from '../components/Layout';
import styles from '../styles/signup.module.css';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, setUser } = useUserContext();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
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
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password
      })
    });
    const body = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(body.message || 'Signup failed');
      return;
    }
    setUser(body.user);
  };

  if (loading || user) return null;

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.heading}>Sign Up</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
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
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.button} disabled={submitting}>
            {submitting ? 'Signing up…' : 'Sign Up'}
          </button>
        </form>
        <p className={styles.linkText}>
          Already have an account?{' '}
          <a href="/signin" className={styles.link}>Sign in here</a>
        </p>
      </div>
    </Layout>
  );
}
