import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { LogIn, UserPlus, Phone, Lock } from 'lucide-react';

const LoginPage = () => {
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const { login, signup } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(mobile, password);
            toast.success('Welcome back!');
        } catch (error) {
            const msg = error.response?.data?.detail;
            toast.error(typeof msg === 'string' ? msg : (Array.isArray(msg) ? msg[0].msg : 'Login failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signup(mobile, password);
            toast.success('Account created! Please login.');
            setIsSignupOpen(false);
        } catch (error) {
            const msg = error.response?.data?.detail;
            toast.error(typeof msg === 'string' ? msg : (Array.isArray(msg) ? msg[0].msg : 'Signup failed. Ensure mobile is 10 digits and PIN is 4 digits.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>Dynamic Forms</h1>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>Sign in to continue</p>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Mobile Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                placeholder="10 digit mobile"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                maxLength={10}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '40px' }}
                                type="password"
                                placeholder="4 digit pin"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                maxLength={4}
                                required
                            />
                        </div>
                    </div>

                    <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        <LogIn size={20} />
                        {loading ? 'Processing...' : 'Login'}
                    </button>
                </form>

                <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Don't have an account? {' '}
                    <span
                        onClick={() => setIsSignupOpen(true)}
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}
                    >
                        Sign Up
                    </span>
                </p>
            </div>

            {isSignupOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Create Account</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Register with your mobile number</p>

                        <form onSubmit={handleSignup}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Mobile Number</label>
                                <input
                                    className="input-field"
                                    placeholder="10 digit mobile"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    maxLength={10}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Password (4 digit pin)</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    placeholder="e.g. 1234"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    maxLength={4}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    style={{ background: 'transparent', border: '1px solid var(--border)', flex: 1 }}
                                    onClick={() => setIsSignupOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                                    <UserPlus size={20} />
                                    Join Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
