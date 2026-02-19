import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Table, ChevronLeft, Calendar, Edit2, Shield, ShieldOff, X, Save } from 'lucide-react';
import API_BASE_URL from '../apiConfig';



const FormResponses = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editData, setEditData] = useState({});


    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [formRes, respRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/forms/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/forms/${id}/responses`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const schema = JSON.parse(formRes.data.form_schema);
            setForm({ ...formRes.data, fields: schema });
            setResponses(respRes.data.map(r => ({ ...r, data: JSON.parse(r.response_data) })));
        } catch (error) {
            toast.error('Failed to load data');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (record) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !record.is_active;
            await axios.put(`${API_BASE_URL}/responses/${record.id}`,
                { is_active: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setResponses(responses.map(r => r.id === record.id ? { ...r, is_active: newStatus } : r));
            toast.success(`Record ${newStatus ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const startEdit = (record) => {
        setEditingRecord(record);
        setEditData({ ...record.data });
    };

    const saveEdit = async () => {
        try {
            // Reformat dates to MM/DD/YYYY for storage
            const submissionData = { ...editData };
            form.fields.forEach(field => {
                if (field.type === 'date' && submissionData[field.label]) {
                    // Only reformat if it's in YYYY-MM-DD format from the picker
                    if (submissionData[field.label].includes('-')) {
                        const [year, month, day] = submissionData[field.label].split('-');
                        if (year && month && day) {
                            submissionData[field.label] = `${month}/${day}/${year}`;
                        }
                    }
                }
            });

            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/responses/${editingRecord.id}`,
                { response_data: JSON.stringify(submissionData) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setResponses(responses.map(r => r.id === editingRecord.id ? { ...r, data: submissionData } : r));
            setEditingRecord(null);
            toast.success('Record updated successfully');
        } catch (error) {
            toast.error('Failed to update record');
        }
    };



    if (loading) return <div style={{ padding: '80px', textAlign: 'center' }}>Loading records...</div>;

    const columnLabels = form?.fields.filter(f => f.isActive).map(f => f.label) || [];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={() => navigate(`/fill/${id}`)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem' }}>Submitted Records</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{form?.title}</p>
                </div>
            </div>

            {responses.length === 0 ? (
                <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
                    <Table size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--text-muted)' }}>No records found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't submitted any records for this form yet.</p>
                </div>
            ) : (
                <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Submission Date</th>
                                {columnLabels.map(label => (
                                    <th key={label} style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{label}</th>
                                ))}
                                <th style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>

                            </tr>
                        </thead>
                        <tbody>
                            {responses.map((resp) => (
                                <tr key={resp.id} style={{
                                    borderBottom: '1px solid var(--border)',
                                    transition: 'background 0.2s',
                                    opacity: resp.is_active ? 1 : 0.6,
                                    background: resp.is_active ? 'transparent' : 'rgba(0,0,0,0.1)'
                                }}>
                                    <td style={{ padding: '20px' }}>
                                        <span className={`status-badge ${resp.is_active ? 'status-active' : 'status-inactive'}`}>
                                            {resp.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} style={{ color: 'var(--primary)' }} />
                                            {new Date(resp.submitted_at).toLocaleString()}
                                        </div>
                                    </td>
                                    {columnLabels.map(label => (
                                        <td key={label} style={{ padding: '20px', fontSize: '0.9rem' }}>
                                            {resp.data[label] || '-'}
                                        </td>
                                    ))}
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => startEdit(resp)}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                                                title="Edit Record"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(resp)}
                                                style={{ background: 'none', border: 'none', color: resp.is_active ? 'var(--danger)' : 'var(--success)', cursor: 'pointer', padding: '4px' }}
                                                title={resp.is_active ? "Deactivate Record" : "Activate Record"}
                                            >
                                                {resp.is_active ? <ShieldOff size={18} /> : <Shield size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {editingRecord && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content" style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>Edit Record</h2>
                            <button onClick={() => setEditingRecord(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                            {form?.fields.filter(f => f.isActive).map(field => (
                                <div key={field.id}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{field.label}</label>
                                    {field.type === 'select' ? (
                                        <select
                                            className="input-field"
                                            value={editData[field.label] || ''}
                                            onChange={(e) => setEditData({ ...editData, [field.label]: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            {field.options.split(',').map(opt => (
                                                <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'date' ? (
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                className="input-field"
                                                type="text"
                                                placeholder="MM/DD/YYYY"
                                                value={editData[field.label] && editData[field.label].includes('-')
                                                    ? (() => {
                                                        const [y, m, d] = editData[field.label].split('-');
                                                        return `${m}/${d}/${y}`;
                                                    })()
                                                    : editData[field.label] || ''}
                                                onClick={(e) => e.target.nextSibling?.showPicker()}
                                                readOnly
                                                style={{ cursor: 'pointer', paddingRight: '45px' }}
                                            />
                                            <input
                                                className="input-field"
                                                type="date"
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    opacity: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    padding: 0,
                                                    pointerEvents: 'none'
                                                }}
                                                value={editData[field.label] && editData[field.label].includes('/')
                                                    ? (() => {
                                                        const [m, d, y] = editData[field.label].split('/');
                                                        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                                    })()
                                                    : editData[field.label] || ''}
                                                onChange={(e) => setEditData({ ...editData, [field.label]: e.target.value })}
                                            />
                                            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary)' }}>
                                                <Calendar size={18} />
                                            </div>
                                        </div>
                                    ) : (
                                        <input
                                            className="input-field"
                                            type={field.type}
                                            value={editData[field.label] || ''}
                                            onChange={(e) => setEditData({ ...editData, [field.label]: e.target.value })}
                                        />
                                    )}

                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={saveEdit}>
                                <Save size={18} /> Save Changes
                            </button>
                            <button
                                className="btn-primary"
                                style={{ flex: 1, background: 'var(--bg-dark)', border: '1px solid var(--border)' }}
                                onClick={() => setEditingRecord(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default FormResponses;
