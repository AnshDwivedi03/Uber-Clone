import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Wind, VolumeX, ArrowRight, Check } from 'lucide-react';
import Button from '../components/ui/Button';

const UserSignup = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [vibe, setVibe] = useState({ music: false, ac: false, quiet: false });
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const { joinIdentity } = useSocket();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const newUser = {
        fullname: { firstname: firstName, lastname: lastName },
        email: email,
        password: password,
        vibeProfile: vibe
      };
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, newUser);
      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem('token', data.token);
        joinIdentity(data.user._id, 'user');
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      const data = err.response.data;
      if (data.errors && data.errors.length > 0) {
        setError(data.errors[0].msg);
      } else if (data.message) {
        setError(data.message);
      } else {
        setError("Registration failed");
      }
      setStep(1); // Go back to first step to show error if field related
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!firstName || !lastName || !email || !password) {
        setError("Please fill in all fields");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  const toggleVibe = (key) => setVibe(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-dark-bg text-white p-6 relative overflow-hidden">

      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-brand-secondary/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md z-10">
        <h1 className="text-4xl font-black mb-2 text-brand-primary tracking-tighter">SKRRRT</h1>
        <p className="text-zinc-400 mb-8">Next Gen Mobility.</p>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              onSubmit={nextStep}
              className="bg-dark-card p-6 rounded-2xl border border-zinc-800 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4">Who are you?</h2>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-shake">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                  {error}
                </div>
              )}

              <div className="flex gap-4 mb-4">
                <input
                  required
                  className="bg-zinc-900 w-1/2 rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-500 focus:border-brand-primary focus:outline-none transition-colors"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setError(null); }}
                />
                <input
                  required
                  className="bg-zinc-900 w-1/2 rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-500 focus:border-brand-primary focus:outline-none transition-colors"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setError(null); }}
                />
              </div>
              <input
                required
                className="bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-500 focus:border-brand-primary focus:outline-none transition-colors mb-4"
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
              />
              <input
                className="bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-500 focus:border-brand-primary focus:outline-none transition-colors mb-6"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                required
              />
              <Button type="submit" className="w-full group">
                Next <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-dark-card p-6 rounded-2xl border border-zinc-800 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-2">Vibe Check</h2>
              <p className="text-zinc-400 text-sm mb-6">How do you like your rides?</p>

              <div className="grid grid-cols-3 gap-3 mb-8">
                <VibeCard
                  icon={Music}
                  label="Music"
                  active={vibe.music}
                  onClick={() => toggleVibe('music')}
                />
                <VibeCard
                  icon={Wind}
                  label="AC"
                  active={vibe.ac}
                  onClick={() => toggleVibe('ac')}
                />
                <VibeCard
                  icon={VolumeX}
                  label="Quiet"
                  active={vibe.quiet}
                  onClick={() => toggleVibe('quiet')}
                />
              </div>

              <Button onClick={submitHandler} className="w-full">
                Create Account
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-zinc-500 mt-6 text-sm">
          Already a rider? <Link to="/login" className="text-brand-primary hover:underline font-medium">Login here</Link>
        </p>
        <p className="text-center text-xs text-zinc-600 mt-2">
          Want to drive? <Link to="/captain-signup" className="text-white hover:underline">Apply as Captain</Link>
        </p>
      </div>
    </div>
  );
};

const VibeCard = ({ icon: Icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-xl p-4 flex flex-col items-center justify-center gap-2 border-2 transition-all duration-200 ${active ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
  >
    <Icon className={`w-8 h-8 ${active ? 'animate-bounce' : ''}`} />
    <span className="text-xs font-bold">{label}</span>
  </div>
);

export default UserSignup;