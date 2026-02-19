import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Shield, ShieldOff, Phone, Calendar, LayoutGrid, List as ListIcon } from 'lucide-react';
import API_BASE_URL from '../apiConfig';



const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list' (card)


    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/admin/users`, {

                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {}, {

                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User status updated');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Action failed');
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading users...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Users</h1>
                    <p style={{ color: 'var(--text-muted)' }}>View and manage registered application users</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                            color: viewMode === 'grid' ? 'white' : 'var(--text-muted)'
                        }}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            padding: '8px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                            color: viewMode === 'list' ? 'white' : 'var(--text-muted)'
                        }}
                    >
                        <ListIcon size={20} />
                    </button>
                </div>
            </header>

            <div className={viewMode === 'grid' ? "user-grid" : ""} style={viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: '16px' } : {}}>
                {users.map((user) => (
                    <div key={user.id} className="glass-card" style={{
                        padding: viewMode === 'grid' ? '24px' : '16px 24px',
                        display: viewMode === 'list' ? 'flex' : 'block',
                        justifyContent: viewMode === 'list' ? 'space-between' : 'initial',
                        alignItems: viewMode === 'list' ? 'center' : 'initial',
                        gap: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: viewMode === 'grid' ? '20px' : '0' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: user.is_admin ? 'var(--primary)' : 'var(--bg-dark)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <User size={24} color={user.is_admin ? 'white' : 'var(--text-muted)'} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>
                                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.mobile_number}
                                </h3>
                                {user.first_name && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{user.mobile_number}</p>}
                                <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {user.is_admin && <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>ADMIN</span>}
                            </div>
                        </div>

                        {viewMode === 'grid' ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Phone size={14} /> Registered Mobile: {user.mobile_number}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={14} /> Joined {new Date(user.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Calendar size={14} /> Joined {new Date(user.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        )}

                        {!user.is_admin && (
                            <button
                                onClick={() => toggleUserStatus(user.id)}
                                className="btn-primary"
                                style={{
                                    width: viewMode === 'grid' ? '100%' : '180px',
                                    background: user.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    border: `1px solid ${user.is_active ? 'var(--danger)' : 'var(--success)'}`,
                                    color: user.is_active ? 'var(--danger)' : 'var(--success)',
                                    padding: '8px 16px'
                                }}
                            >
                                {user.is_active ? <ShieldOff size={18} /> : <Shield size={18} />}
                                {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

};

export default AdminDashboard;
