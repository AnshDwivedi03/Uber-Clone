import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import Button from '../components/ui/Button';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState({});
  const [error, setError] = useState(null);

  const { user, setUser } = useContext(UserDataContext);
  const { joinIdentity } = useSocket();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);

    const userData = {
      email: email,
      password: password
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData);

      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem('token', data.token);
        joinIdentity(data.user._id, 'user');
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(err.response.data.message || "Invalid credentials");
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }

    // Keep fields filled for corrections if desired, or clear password only
    // setEmail(''); 
    setPassword('');
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-dark-bg text-white p-6 relative overflow-hidden">

      {/* Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-brand-secondary/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md z-10 p-6 bg-dark-card border border-zinc-800 rounded-2xl shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-brand-primary tracking-tighter mb-2">SKRRRT</h1>
          <p className="text-zinc-400">Welcome back, rider.</p>
        </div>

        <form onSubmit={submitHandler}>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Email</label>
            <input
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null); // Clear error on type
              }}
              className="bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-brand-primary focus:outline-none transition-colors text-white"
              type="email"
              placeholder="email@example.com"
            />
          </div>

          <div className="mb-8">
            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Password</label>
            <input
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null); // Clear error on type
              }}
              className="bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-brand-primary focus:outline-none transition-colors text-white"
              type="password"
              placeholder="password"
            />
          </div>

          <Button type="submit" className="w-full mb-4">
            Login
          </Button>
        </form>

        <p className="text-center text-zinc-500 text-sm">
          New to SKRRRT? <Link to="/signup" className="text-brand-primary hover:underline font-medium">Create account</Link>
        </p>

        <div className="mt-8 border-t border-zinc-800 pt-6 text-center">
          <Link to='/captain-login' className="text-xs text-brand-secondary hover:text-brand-secondary/80 font-semibold mb-3 inline-block">
            Sign in as Captain
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;