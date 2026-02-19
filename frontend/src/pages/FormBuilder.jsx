import React, { useState, useEffect } from 'react'; // Updated to include Date type

import { Plus, Trash2, Save, Eye, Shield, ShieldOff, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';


const FormBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fields, setFields] = useState([]);
    const [isPreview, setIsPreview] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id && id !== 'new') {
            fetchForm();
        }
    }, [id]);

    const fetchForm = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/forms/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const form = response.data;
            setTitle(form.title);
            setDescription(form.description || '');
            const parsedSchema = JSON.parse(form.form_schema);
            setFields(parsedSchema.map(f => ({
                ...f,
                isActive: f.isActive !== undefined ? f.isActive : true
            })));
        } catch (error) {
            toast.error('Failed to load form');
            navigate('/forms');
        } finally {
            setLoading(false);
        }
    };

    const addField = () => {
        const newField = {
            id: Date.now(),
            label: 'New Field',
            type: 'text',
            required: false,
            options: '',
            conditionField: '',
            conditionValue: '',
            isActive: true
        };
        setFields([...fields, newField]);
    };

    const updateField = (id, updates) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const toggleFieldStatus = (id) => {
        setFields(fields.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
    };

    const saveForm = async () => {
        if (!title) return toast.error('Please enter a form title');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                title,
                description,
                form_schema: JSON.stringify(fields)
            };


            if (id && id !== 'new') {
                await axios.put(`${API_BASE_URL}/forms/${id}`, payload, {

                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_BASE_URL}/forms`, payload, {

                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            toast.success('Form saved successfully');
            navigate('/forms');
        } catch (error) {
            const msg = error.response?.data?.detail;
            toast.error(typeof msg === 'string' ? msg : 'Failed to save form');
        } finally {
            setLoading(false);
        }
    };

    if (loading && id && id !== 'new') {
        return <div style={{ padding: '80px', textAlign: 'center' }}>Loading form details...</div>;
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => navigate('/forms')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: '2rem' }}>{id && id !== 'new' ? 'Edit Form' : 'Create Form'}</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-primary" style={{ background: 'var(--bg-card)' }} onClick={() => setIsPreview(!isPreview)}>
                        <Eye size={18} /> {isPreview ? 'Edit' : 'Preview'}
                    </button>
                    <button className="btn-primary" onClick={saveForm} disabled={loading}>
                        <Save size={18} /> {loading ? 'Saving...' : 'Save Form'}
                    </button>
                </div>
            </div>

            {!isPreview ? (
                <div className="glass-card" style={{ padding: '32px' }}>
                    <input
                        className="input-field"
                        placeholder="Enter Form Title"
                        style={{ fontSize: '1.5rem', marginBottom: '8px', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, background: 'none' }}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        className="input-field"
                        placeholder="Enter Form Description (optional)"
                        style={{ marginBottom: '32px', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, opacity: 0.7, background: 'none' }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {fields.map((field, index) => (
                            <div key={field.id} style={{
                                padding: '24px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '16px',
                                border: '1px solid var(--border)',
                                opacity: field.isActive ? 1 : 0.6
                            }}>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: field.isActive ? '20px' : '0' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                            Field Label {!field.isActive && '(Deactivated)'}
                                        </label>
                                        <input
                                            className="input-field"
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                                            disabled={!field.isActive}
                                        />
                                    </div>
                                    <div style={{ width: '150px' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Type</label>
                                        <select
                                            className="input-field"
                                            value={field.type}
                                            onChange={(e) => updateField(field.id, { type: e.target.value })}
                                            disabled={!field.isActive}
                                        >
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="date">Date</option>
                                            <option value="select">Select Menu</option>

                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                                        <button
                                            onClick={() => toggleFieldStatus(field.id)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: field.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: field.isActive ? 'var(--danger)' : 'var(--success)'
                                            }}
                                            title={field.isActive ? "Deactivate Field" : "Activate Field"}
                                        >
                                            {field.isActive ? <ShieldOff size={18} /> : <Shield size={18} />}
                                        </button>
                                        <button
                                            onClick={() => removeField(field.id)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: 'var(--danger)'
                                            }}
                                            title="Delete Field"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {field.isActive && (
                                    <>
                                        {field.type === 'select' && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Options (comma separated)</label>
                                                <input
                                                    className="input-field"
                                                    placeholder="e.g. Option 1, Option 2, Option 3"
                                                    value={field.options}
                                                    onChange={(e) => updateField(field.id, { options: e.target.value })}
                                                />
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logic: Show if</span>
                                            <select
                                                className="input-field"
                                                style={{ width: '150px', height: '32px', padding: '0 8px', fontSize: '0.8rem' }}
                                                value={field.conditionField}
                                                onChange={(e) => updateField(field.id, { conditionField: e.target.value })}
                                            >
                                                <option value="">(Always show)</option>
                                                {fields.slice(0, index).filter(f => f.isActive).map(f => (
                                                    <option key={f.id} value={f.label}>{f.label}</option>
                                                ))}
                                            </select>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>equals</span>
                                            <input
                                                className="input-field"
                                                style={{ width: '120px', height: '32px', padding: '0 8px', fontSize: '0.8rem' }}
                                                placeholder="Value"
                                                value={field.conditionValue}
                                                onChange={(e) => updateField(field.id, { conditionValue: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        className="btn-primary"
                        style={{ marginTop: '32px', width: '100%', background: 'none', border: '2px dashed var(--border)', color: 'var(--text-muted)' }}
                        onClick={addField}
                    >
                        <Plus size={20} /> Add New Field
                    </button>
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '40px' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{title || 'Untitled Form'}</h2>
                        <p style={{ color: 'var(--text-muted)' }}>{description}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {fields.filter(f => f.isActive).map(field => (
                            <div key={field.id}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>{field.label}</label>
                                {field.type === 'select' ? (
                                    <select className="input-field">
                                        <option value="">Select an option...</option>
                                        {field.options.split(',').filter(opt => opt.trim()).map(opt => (
                                            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input className="input-field" type={field.type} placeholder={`Enter ${field.label.toLowerCase()}...`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormBuilder;
