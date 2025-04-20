import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUserContext } from '../lib/UserContext';
import Layout from '../components/Layout';
import styles from '../styles/signup.module.css';

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useUserContext();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers:{ 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password
      })
    });
    const body = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(body.message || 'Signup failed');
      return;
    }

    setUser(body.user);
    router.push('/user/dashboard');
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.heading}>Sign Up</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Name */}
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
          {/* Email */}
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
          {/* Password */}
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
          {/* Confirm Password */}
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

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Signing up…' : 'Sign Up'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
