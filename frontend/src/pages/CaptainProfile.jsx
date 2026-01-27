import React, { useState, useContext } from 'react';
import { CaptainDataContext } from '../context/CaptainContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Phone, Save, Car } from 'lucide-react';
import Button from '../components/ui/Button';

const CaptainProfile = () => {
    const { captain, setCaptain } = useContext(CaptainDataContext);
    const navigate = useNavigate();
    
    // Safety check - if context hasn't loaded yet
    const safeCaptain = captain || {};

    const [fullname, setFullname] = useState({
        firstname: safeCaptain.fullname?.firstname || '',
        lastname: safeCaptain.fullname?.lastname || ''
    });
    const [phone, setPhone] = useState(safeCaptain.phone || '');
    
    // Vehicle details (some might not be editable but showing them is good)
    // Assuming backend only updates basics for now.
    
    const [message, setMessage] = useState('');

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/captains/profile/update`, {
                fullname,
                phone
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.status === 200) {
                setCaptain(response.data);
                setMessage('Profile updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
            setMessage('Update failed');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white p-6 relative">
             <button onClick={() => navigate('/captain-home')} className="absolute top-6 left-6 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-center mb-8 mt-2">Captain Profile</h1>

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
                
                {/* Vehicle Section (Read Only?) */}
                 <div className="bg-dark-card p-4 rounded-xl border border-zinc-800 opacity-75">
                    <h3 className="text-zinc-400 text-xs font-bold uppercase mb-4 flex items-center gap-2">
                        <Car size={14} /> Vehicle Details
                    </h3>
                    <div className="mb-2">
                         <label className="text-xs text-zinc-500 block mb-1">Model</label>
                         <p className="font-bold text-white">{safeCaptain.vehicle?.model || 'N/A'}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1/2">
                             <label className="text-xs text-zinc-500 block mb-1">Plate</label>
                             <p className="font-mono text-lime-400">{safeCaptain.vehicle?.plate || 'N/A'}</p>
                        </div>
                         <div className="w-1/2">
                             <label className="text-xs text-zinc-500 block mb-1">Type</label>
                             <p className="capitalize text-white">{safeCaptain.vehicle?.vehicleType || 'N/A'}</p>
                        </div>
                    </div>
                 </div>

                <Button type="submit" className="w-full">
                    <Save className="mr-2" size={18} /> Save Changes
                </Button>
            </form>
        </div>
    );
};

export default CaptainProfile;
