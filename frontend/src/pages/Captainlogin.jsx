import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CaptainContext'
import { useSocket } from '../context/SocketContext'
import Button from '../components/ui/Button'

const Captainlogin = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const { captain, setCaptain } = React.useContext(CaptainDataContext)
  const { joinIdentity } = useSocket()
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    const captainData = {
      email: email,
      password
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, captainData)

      if (response.status === 200) {
        const data = response.data
        setCaptain(data.captain)
        localStorage.setItem('token', data.token)
        joinIdentity(data.captain._id, 'captain')
        navigate('/captain-home')
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
  }

  return (
    <div className='h-screen flex flex-col justify-center items-center bg-dark-bg text-white p-6 relative overflow-hidden'>

      {/* Background Elements - Lime Themed */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-lime-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-lime-400/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md z-10 p-6 bg-dark-card border border-zinc-800 rounded-2xl shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-lime-400 tracking-tighter mb-2">SKRRRT <span className='text-white text-base font-normal block tracking-normal'>Captain Portal</span></h1>
          <p className="text-zinc-400">Welcome back, Captain.</p>
        </div>

        <form onSubmit={(e) => {
          submitHandler(e)
        }}>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Captain Email</label>
            <input
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              className="bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-colors text-white"
              type="email"
              placeholder="email@example.com"
            />
          </div>

          <div className="mb-8">
            <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Password</label>
            <input
              className="bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-colors text-white"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              required type="password"
              placeholder="password"
            />
          </div>

          <Button type="submit" className="w-full mb-4 bg-lime-500 hover:bg-lime-400 text-black border-none">
            Login as Captain
          </Button>

        </form>
        <p className='text-center text-zinc-500 text-sm'>
          New to the fleet? <Link to='/captain-signup' className='text-lime-400 hover:underline font-medium'>Register here</Link>
        </p>

        <div className="mt-8 border-t border-zinc-800 pt-6 text-center">
          <Link to='/login' className="text-xs text-brand-primary hover:text-brand-primary/80 font-semibold mb-3 inline-block">
            Sign in as Rider
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Captainlogin