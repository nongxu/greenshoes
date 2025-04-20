// pages/signin.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { mutate }     from 'swr';
import Layout         from '../components/Layout';
import styles         from '../styles/signin.module.css';

export default function SigninPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: '', password: '', role: 'user' });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogin = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      credentials: 'include',              // ← get httpOnly cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const body = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(body.message || (body.errors && body.errors.map(e=>e.msg).join(', ')) || 'Login failed');
      return;
    }

    // 1) seed SWR so Layout.useUser() sees us immediately
    mutate('/api/auth/me', { id: body.user.id, email: body.user.email, role: body.user.role }, false);

    // 2) redirect based on role
    if (body.user.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/dashboard');
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h2 className={styles.heading}>Login</h2>
        <form onSubmit={handleLogin} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
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
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
