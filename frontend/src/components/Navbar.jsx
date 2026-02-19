import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LayoutDashboard, Users, LogOut, FormInput, FileText } from 'lucide-react';
import API_BASE_URL from '../apiConfig';


const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sharedForms, setSharedForms] = React.useState([]);

    React.useEffect(() => {
        if (user && !user.is_admin) {
            fetchSharedForms();
        }
    }, [user]);

    const fetchSharedForms = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/user/shared-forms`, {

                headers: { Authorization: `Bearer ${token}` }
            });
            setSharedForms(response.data);
        } catch (error) {
            console.error('Failed to fetch shared forms');
        }
    };


    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{
            padding: '20px 40px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-dark)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 'Regular', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    DynamicForms
                </h2>

                <div style={{ display: 'flex', gap: '24px' }}>
                    <NavLink to="/" className="nav-link">Home</NavLink>
                    <NavLink to="/profile" className="nav-link">Profile</NavLink>
                    {user?.is_admin && (
                        <>
                            <NavLink to="/forms" className="nav-link">Manage Forms</NavLink>
                            <NavLink to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Users size={16} /> Manage Users
                            </NavLink>
                        </>
                    )}

                    {!user?.is_admin && sharedForms.map(form => (
                        <NavLink key={form.id} to={`/fill/${form.id}`} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FormInput size={16} /> {form.title}
                        </NavLink>
                    ))}
                </div>

            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.mobile_number}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.is_admin ? 'Administrator' : 'User'}</p>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        padding: '8px',
                        borderRadius: '10px',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
