import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Shield, ShieldOff, Search, ChevronLeft, User } from 'lucide-react';
import API_BASE_URL from '../apiConfig';


const FormAccessManager = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [formRes, usersRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/forms/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/admin/forms/${id}/access`, { headers: { Authorization: `Bearer ${token}` } })

            ]);
            setForm(formRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            toast.error('Failed to load access data');
            navigate('/forms');
        } finally {
            setLoading(false);
        }
    };

    const toggleAccess = async (userId, currentAccess) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/admin/forms/${id}/access`, {

                user_id: userId,
                has_access: !currentAccess
            }, { headers: { Authorization: `Bearer ${token}` } });

            setUsers(users.map(u => u.user_id === userId ? { ...u, has_access: !currentAccess } : u));
            toast.success('Access updated');
        } catch (error) {
            toast.error('Failed to update access');
        }
    };

    const filteredUsers = users.filter(u =>
        u.mobile_number.includes(searchTerm) ||
        (u.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.last_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '80px', textAlign: 'center' }}>Loading access controls...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={() => navigate('/forms')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem' }}>Manage Form Access</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Grant users permission to fill {form?.title}</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input-field"
                        placeholder="Search users by name or mobile number..."
                        style={{ paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No users found
                    </div>
                ) : (
                    filteredUsers.map(u => (
                        <div key={u.user_id} className="glass-card" style={{
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: u.has_access ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-dark)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: u.has_access ? 'var(--success)' : 'var(--text-muted)'
                                }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>
                                        {u.first_name ? `${u.first_name} ${u.last_name || ''}` : 'No Name Set'}
                                    </h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.mobile_number}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleAccess(u.user_id, u.has_access)}
                                className="btn-primary"
                                style={{
                                    background: u.has_access ? 'var(--success)' : 'rgba(239, 68, 68, 0.1)',
                                    color: u.has_access ? 'white' : 'var(--danger)',
                                    border: 'none',
                                    padding: '8px 16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    width: 'auto',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {u.has_access ? <Shield size={16} /> : <ShieldOff size={16} />}
                                {u.has_access ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FormAccessManager;
