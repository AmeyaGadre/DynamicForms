import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Save, Phone } from 'lucide-react';

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(firstName, lastName);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 20px' }}>
            <div className="glass-card" style={{ padding: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        border: '2px solid var(--primary)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)'
                    }}>
                        <User size={32} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>My Profile</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Complete your profile details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '500' }}>Mobile Number (Login ID)</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="input-field"
                                style={{ paddingLeft: '44px', opacity: 0.6, cursor: 'not-allowed' }}
                                value={user?.mobile_number || ''}
                                readOnly
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '500' }}>First Name</label>
                            <input
                                className="input-field"
                                placeholder="Enter first name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '500' }}>Last Name</label>
                            <input
                                className="input-field"
                                placeholder="Enter last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
