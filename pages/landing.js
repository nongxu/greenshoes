import Layout from '../components/Layout';
import { useState } from 'react';
import { useRouter } from 'next/router';

const Landing = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Optional 'user' or 'admin'

    const handleLogin = (e) => {
        e.preventDefault();
        if (role === 'admin') {
            router.push('/admin/dashboard'); // Administrator backend page
        } else {
            router.push('/user/dashboard'); // User home page (after login)
        }
    };

    return (
        <Layout>
            {/* Container div */}
            <div style={{ maxWidth: '400px', margin: '100px auto' }}> 
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    {/* Container for the mailbox input component */}
                    <div style={{ marginBottom: '15px' }}>
                        {/* Email input box:
                            - Set type to "email" to ensure that the input format is email format
                            - Bind value to email status
                            - Update email status with onChange event
                            - Use inputStyle style
                            - Required attribute ensures that this field is required */}
                        <label>Email:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            style={inputStyle} 
                            required 
                        />
                    </div>
                    
                    {/* Container for password input components */}
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
                    
                    {/* Container for the character selection component */}
                    <div style={{ marginBottom: '15px' }}>
                        <label>Role:</label>
                        {/* Drop-down selection box:
                         - value is bound to role status
                         - onChange event updates role status
                         - use inputStyle style*/}
                        <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
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
