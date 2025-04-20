import { useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/signup', {
      method:  'POST',
      credentials: 'include',              // ← important to accept httpOnly cookie
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:     formData.name,
        email:    formData.email,
        password: formData.password
      })
    });

    setLoading(false);
    if (res.ok) {
      // cookie was set by the server; just redirect
      return router.push('/user/dashboard');
    }

    const body = await res.json();
    setError(body.message || 'Signup failed');
  };

  return (
    <Layout>
      <h2>Sign Up</h2>
      {error && <p style={{ color:'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {['name','email','password','confirmPassword'].map(field => (
          <div key={field} style={{ margin: '1rem 0' }}>
            <label htmlFor={field}>
              {field === 'confirmPassword'
                ? 'Confirm Password'
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              id={field}
              name={field}
              type={field.includes('password') ? 'password'
                    : field==='email'               ? 'email'
                    : 'text'}
              value={formData[field]}
              onChange={handleChange}
              required
              style={{ width:'100%', padding:'8px' }}
            />
          </div>
        ))}
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up…' : 'Create Account'}
        </button>
      </form>
    </Layout>
  );
}
