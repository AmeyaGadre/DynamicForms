import React, { useEffect, useState } from 'react'; // Date picker support added

import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, ChevronLeft, Table, Calendar } from 'lucide-react';
import API_BASE_URL from '../apiConfig';



const FormSubmission = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchForm();
    }, [id]);

    const fetchForm = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/forms/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const schema = JSON.parse(response.data.form_schema);
            setForm({ ...response.data, fields: schema.filter(f => f.isActive) });
        } catch (error) {
            toast.error('Failed to load form');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (label, value) => {
        setFormData(prev => ({ ...prev, [label]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Reformat dates to MM/DD/YYYY for submission
            const submissionData = { ...formData };
            form.fields.forEach(field => {
                if (field.type === 'date' && submissionData[field.label]) {
                    const [year, month, day] = submissionData[field.label].split('-');
                    if (year && month && day) {
                        submissionData[field.label] = `${month}/${day}/${year}`;
                    }
                }
            });

            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/forms/${id}/responses`, {
                form_id: parseInt(id),
                response_data: JSON.stringify(submissionData)
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success('Record saved successfully!');
            setFormData({}); // Clear form
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to save record');
        } finally {
            setSubmitting(false);
        }
    };


    const checkCondition = (field) => {
        if (!field.conditionField) return true;
        return formData[field.conditionField] === field.conditionValue;
    };

    if (loading) return <div style={{ padding: '80px', textAlign: 'center' }}>Loading form...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.8rem' }}>{form?.title}</h1>
                        <p style={{ color: 'var(--text-muted)' }}>{form?.description}</p>
                    </div>
                </div>
                <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '10px 20px', background: 'var(--bg-card)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                    onClick={() => navigate(`/responses/${id}`)}
                >
                    <Table size={18} /> View Records
                </button>
            </div>

            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {form?.fields.map(field => {
                        if (!checkCondition(field)) return null;

                        return (
                            <div key={field.id}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    {field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                                </label>

                                {field.type === 'select' ? (
                                    <select
                                        className="input-field"
                                        required={field.required}
                                        value={formData[field.label] || ''}
                                        onChange={(e) => handleInputChange(field.label, e.target.value)}
                                    >
                                        <option value="">Select an option...</option>
                                        {field.options.split(',').filter(opt => opt.trim()).map(opt => (
                                            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'date' ? (
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="input-field"
                                            type="text"
                                            placeholder="MM/DD/YYYY"
                                            required={field.required}
                                            value={formData[field.label] && formData[field.label].includes('-')
                                                ? (() => {
                                                    const [y, m, d] = formData[field.label].split('-');
                                                    return `${m}/${d}/${y}`;
                                                })()
                                                : formData[field.label] || ''}
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
                                            value={formData[field.label] && formData[field.label].includes('/')
                                                ? (() => {
                                                    const [m, d, y] = formData[field.label].split('/');
                                                    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                                })()
                                                : formData[field.label] || ''}
                                            onChange={(e) => handleInputChange(field.label, e.target.value)}
                                        />
                                        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary)' }}>
                                            <Calendar size={18} />
                                        </div>
                                    </div>
                                ) : (

                                    <input
                                        className="input-field"
                                        type={field.type}
                                        required={field.required}
                                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                                        value={formData[field.label] || ''}
                                        onChange={(e) => handleInputChange(field.label, e.target.value)}
                                    />
                                )}

                            </div>
                        );
                    })}
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    style={{ marginTop: '40px' }}
                    disabled={submitting}
                >
                    <Save size={18} /> {submitting ? 'Saving...' : 'Save Record'}
                </button>
            </form>
        </div>
    );
};

export default FormSubmission;
