import Layout from '../components/Layout';
import { useState } from 'react';
import { useRouter } from 'next/router';

const Landing = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        const res = await fetch('/api/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message || 'Login failed');
        } else {
            // 登录成功后跳转
            if (role === 'admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/user/dashboard');
            }
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '400px', margin: '100px auto' }}>
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    {error && (
                        <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>
                    )}

                    <div style={{ marginBottom: '15px' }}>
                        <label>Email:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            style={inputStyle} 
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Password:</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            style={inputStyle} 
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Role:</label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)} 
                            style={inputStyle}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" style={buttonStyle}>Login</button>
                </form>
            </div>
        </Layout>
    );
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    margin: '5px 0',
    boxSizing: 'border-box'
};

const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};

export default Landing;
