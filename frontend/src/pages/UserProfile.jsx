import React, { useState, useContext } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Phone, Save } from 'lucide-react';
import Button from '../components/ui/Button';

const UserProfile = () => {
    const { user, setUser } = useContext(UserDataContext);
    const navigate = useNavigate();
    const [fullname, setFullname] = useState({
        firstname: user?.fullname?.firstname || '',
        lastname: user?.fullname?.lastname || ''
    });
    const [phone, setPhone] = useState(user?.phone || '');
    const [vibeProfile, setVibeProfile] = useState(user?.vibeProfile || { techno: false, quiet: false, ac: false });
    const [message, setMessage] = useState('');

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/users/profile/update`, {
                fullname,
                phone,
                vibeProfile
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.status === 200) {
                setUser(response.data);
                setMessage('Profile updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
            setMessage('Update failed');
        }
    };

    const toggleVibe = (key) => setVibeProfile(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="min-h-screen bg-dark-bg text-white p-6 relative">
            <button onClick={() => navigate('/home')} className="absolute top-6 left-6 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-center mb-8 mt-2">Edit Profile</h1>

            {message && <div className="bg-lime-500/20 text-lime-400 p-3 rounded-xl mb-6 text-center text-sm font-bold border border-lime-500/50">{message}</div>}

            <form onSubmit={updateProfile} className="max-w-md mx-auto space-y-6">
                
                {/* Name Section */}
                <div className="bg-dark-card p-4 rounded-xl border border-zinc-800">
                    <h3 className="text-zinc-400 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                        <User size={14} /> Personal Info
                    </h3>
                    <div className="flex gap-4 mb-4">
                        <div className="w-1/2">
                            <label className="text-xs text-zinc-500 block mb-1">First Name</label>
                            <input 
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 focus:border-brand-primary outline-none"
                                value={fullname.firstname}
                                onChange={(e) => setFullname({...fullname, firstname: e.target.value})}    
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="text-xs text-zinc-500 block mb-1">Last Name</label>
                            <input 
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 focus:border-brand-primary outline-none"
                                value={fullname.lastname}
                                onChange={(e) => setFullname({...fullname, lastname: e.target.value})}    
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-dark-card p-4 rounded-xl border border-zinc-800">
                    <h3 className="text-zinc-400 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                        <Phone size={14} /> Contact
                    </h3>
                    <div>
                        <label className="text-xs text-zinc-500 block mb-1">Phone Number</label>
                        <input 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 focus:border-brand-primary outline-none"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}    
                            placeholder="+91..."
                        />
                    </div>
                </div>

                {/* Vibe Section */}
                <div className="bg-dark-card p-4 rounded-xl border border-zinc-800">
                    <h3 className="text-zinc-400 text-xs font-bold uppercase mb-4">Default Vibes</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {['techno', 'ac', 'quiet'].map(v => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => toggleVibe(v)}
                                className={`p-3 rounded-lg border text-xs font-bold capitalize transition-all ${vibeProfile[v] ? 'bg-brand-primary text-black border-brand-primary' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
                            >
                                {v === 'ac' ? 'AC Max' : v === 'quiet' ? 'Quiet Ride' : 'Techno Lover'}
                            </button>
                        ))}
                    </div>
                </div>

                <Button type="submit" className="w-full">
                    <Save className="mr-2" size={18} /> Save Changes
                </Button>
            </form>
        </div>
    );
};

export default UserProfile;
