import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FileText, Edit, Calendar, Plus, ExternalLink, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../apiConfig';


const MyForms = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();


    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/forms`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setForms(response.data);
        } catch (error) {
            toast.error('Failed to fetch forms');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your forms...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>My Forms</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and edit your dynamic forms</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/forms/new')}>
                    <Plus size={20} /> Create New Form
                </button>
            </header>

            {forms.length === 0 ? (
                <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                        <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3>No forms found</h3>
                        <p>You haven't created any forms yet.</p>
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/forms/new')}>
                        Get Started
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {forms.map((form) => (
                        <div key={form.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'var(--bg-dark)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)'
                                }}>
                                    <FileText size={24} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {form.title}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <Calendar size={12} /> {new Date(form.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <p style={{
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem',
                                marginBottom: '24px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: '2.8rem'
                            }}>
                                {form.description || 'No description provided'}
                            </p>

                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, padding: '10px', minWidth: '80px' }}
                                    onClick={() => navigate(`/forms/edit/${form.id}`)}
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                {user?.is_admin && (
                                    <button
                                        className="btn-primary"
                                        style={{ flex: 1, padding: '10px', minWidth: '80px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                                        onClick={() => navigate(`/forms/access/${form.id}`)}
                                    >
                                        <Users size={14} /> Access
                                    </button>
                                )}
                                <button
                                    className="btn-primary"
                                    style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', flex: 1, padding: '10px', minWidth: '80px' }}
                                    onClick={() => navigate(`/fill/${form.id}`)}
                                >
                                    <ExternalLink size={14} /> View
                                </button>

                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyForms;
