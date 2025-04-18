import Layout from '../components/Layout';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

const Landing = () => {
    const router = useRouter();

    // Form state: email, password, and user role
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // 'user' or 'admin'
    const [error, setError] = useState(null); //  Adding error status

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        // call next-auth signIn function with credentials
        const res = await signIn('credentials', {
            redirect: false,
            email,
            password,
            role
        });

        if (res.error) {
            setError('Invalid credentials');
        } else {
            // if login is successful, redirect to the dashboard based on role
            if (role === 'admin') {
                router.push('/admin/dashboard');
            } else if (role === 'user') {
                router.push('/user/dashboard');
            } else {
                router.push('/'); // fallback
            }
            
        }
    };

    return (
        <Layout>
            {/* Login form container */}
            <div style={{ maxWidth: '400px', margin: '100px auto' }}>
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    {/* Error message */}
                    {error && (
                        <p style={{ color: 'red', marginBottom: '15px' }}>
                            {error}
                        </p>
                    )}

                    {/* Email input field */}
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

                    {/* Password input field */}
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

                    {/* Role selection dropdown */}
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

                    {/* Submit button */}
                    <button type="submit" style={buttonStyle}>Login</button>
                </form>
            </div>
        </Layout>
    );
};

// Common input styling
const inputStyle = {
    width: '100%',
    padding: '8px',
    margin: '5px 0',
    boxSizing: 'border-box'
};

// Login button styling
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
