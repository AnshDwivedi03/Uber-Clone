import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import { useSocket } from '../context/SocketContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Car, User, CheckCircle } from 'lucide-react'
import Button from '../components/ui/Button'

const CaptainSignup = () => {

  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Personal, 2: Vehicle
  const [error, setError] = useState(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [vehicleColor, setVehicleColor] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleCapacity, setVehicleCapacity] = useState('')
  const [vehicleType, setVehicleType] = useState('') // 'car', 'auto', 'moto'


  const { captain, setCaptain } = React.useContext(CaptainDataContext)
  const { joinIdentity } = useSocket()


  const submitHandler = async (e) => {
    e.preventDefault()
    setError(null)

    const captainData = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: Number(vehicleCapacity),
        vehicleType: vehicleType
      }
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, captainData)

      if (response.status === 201) {
        const data = response.data
        setCaptain(data.captain)
        localStorage.setItem('token', data.token)
        joinIdentity(data.captain._id, 'captain')
        navigate('/captain-home')
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
      // Stay on step 2 for correction or go back? Usually stay.
    }
  }

  const nextStep = (e) => {
    e.preventDefault();
    // Basic Validation for Step 1
    if (step === 1) {
      if (!firstName || !lastName || !email || !password) {
        setError("Please fill in all personal details.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      setError(null);
      setStep(2);
    }
  }

  return (
    <div className='h-screen flex flex-col justify-center items-center bg-dark-bg text-white p-6 relative overflow-hidden'>

      {/* Background Elements - Lime Themed */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-lime-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-lime-400/10 rounded-full blur-[100px]" />

      <div className='w-full max-w-lg z-10'>
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-lime-400 tracking-tighter mb-2">SKRRRT <span className='text-white text-base font-normal block tracking-normal'>Captain Application</span></h1>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-lime-500' : 'bg-zinc-800'}`} />
            <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-lime-500' : 'bg-zinc-800'}`} />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2 animate-shake mx-auto max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              onSubmit={nextStep}
              className="bg-dark-card p-8 rounded-2xl border border-zinc-800 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-6 text-lime-400">
                <User size={24} />
                <h2 className="text-xl font-bold text-white">Personal Details</h2>
              </div>

              <div className='flex gap-4 mb-4'>
                <div className="w-1/2">
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">First Name</label>
                  <input
                    required
                    className='bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-colors text-white'
                    type="text"
                    placeholder='First name'
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setError(null); }}
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Last Name</label>
                  <input
                    required
                    className='bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-colors text-white'
                    type="text"
                    placeholder='Last name'
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); setError(null); }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Email Address</label>
                <input
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className='bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-colors text-white'
                  type="email"
                  placeholder='email@example.com'
                />
              </div>

              <div className="mb-8">
                <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Password</label>
                <input
                  className='bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-colors text-white'
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  required type="password"
                  placeholder='At least 6 characters'
                />
              </div>

              <Button type="submit" className="w-full bg-lime-500 hover:bg-lime-400 text-black border-none group">
                Next Step <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              onSubmit={submitHandler}
              className="bg-dark-card p-8 rounded-2xl border border-zinc-800 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-6 text-lime-400">
                <Car size={24} />
                <h2 className="text-xl font-bold text-white">Vehicle Details</h2>
              </div>

              <div className='flex gap-4 mb-4'>
                <div className="w-1/2">
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Color</label>
                  <input
                    required
                    className='bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-colors text-white'
                    type="text"
                    placeholder='e.g. White'
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Plate Number</label>
                  <input
                    required
                    className='bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-colors text-white'
                    type="text"
                    placeholder='e.g. DL-01-AB-1234'
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                  />
                </div>
              </div>

              <div className='flex gap-4 mb-8'>
                <div className="w-1/2">
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Capacity</label>
                  <input
                    required
                    className='bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 placeholder:text-zinc-600 focus:border-lime-500 focus:outline-none transition-colors text-white'
                    type="number"
                    min="1"
                    placeholder='Seats'
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(e.target.value)}
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Type</label>
                  <select
                    required
                    className='bg-zinc-900 w-full rounded-xl px-4 py-3 border border-zinc-700 text-white focus:border-lime-500 focus:outline-none transition-colors appearance-none'
                    value={vehicleType}
                    onChange={(e) => {
                      setVehicleType(e.target.value)
                    }}
                  >
                    <option value="" disabled className='text-zinc-500'>Select Type</option>
                    <option value="car">Car</option>
                    <option value="auto">Auto</option>
                    <option value="moto">Moto</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="w-1/3">
                  Back
                </Button>
                <Button type="submit" className="w-2/3 bg-lime-500 hover:bg-lime-400 text-black border-none">
                  Submit Application
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className='text-center text-zinc-500 text-sm mt-6'>
          Already a Captain? <Link to='/captain-login' className='text-lime-400 hover:underline font-medium'>Login here</Link>
        </p>

      </div>
    </div>
  )
}

export default CaptainSignup