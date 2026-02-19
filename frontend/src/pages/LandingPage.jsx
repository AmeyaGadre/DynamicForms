import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, List, BarChart, Settings, Users } from 'lucide-react';


const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();


    const adminFeatures = [
        { title: 'Create Form', icon: <Plus size={24} />, desc: 'Build dynamic forms with conditional logic', color: '#6366f1', link: '/forms/new' },
        { title: 'Manage Forms', icon: <List size={24} />, desc: 'Manage your existing forms and access', color: '#ec4899', link: '/forms' },
        { title: 'Manage Users', icon: <Users size={24} />, desc: 'Activate or deactivate user accounts', color: '#10b981', link: '/admin' },
    ];

    const userFeatures = [
        { title: 'Profile Settings', icon: <Settings size={24} />, desc: 'Update your personal information', color: '#f59e0b', link: '/profile' },
    ];

    const displayFeatures = user?.is_admin ? adminFeatures : userFeatures;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Welcome, {user?.first_name || user?.mobile_number}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    {user?.is_admin
                        ? 'Administrative Dashboard: Create and manage your dynamic forms and users.'
                        : 'User Dashboard: Fill out forms shared with you and manage your profile.'}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {displayFeatures.map((f, i) => (
                    <div key={i} className="glass-card"
                        style={{ padding: '32px', transition: 'transform 0.3s', cursor: 'pointer' }}
                        onClick={() => navigate(f.link)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: `${f.color}20`,
                            color: f.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px'
                        }}>
                            {f.icon}
                        </div>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>{f.title}</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );

};

export default LandingPage;
