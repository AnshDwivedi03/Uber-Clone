import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Start from './pages/Start'
import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'
import Captainlogin from './pages/Captainlogin'
import CaptainSignup from './pages/CaptainSignup'
import Home from './pages/Home'
import UserProtectWrapper from './pages/UserProtectWrapper'
import UserLogout from './pages/UserLogout'
import CaptainHome from './pages/CaptainHome'
import CaptainProtectWrapper from './pages/CaptainProtectWrapper'
import CaptainLogout from './pages/CaptainLogout'
import Riding from './pages/Riding'
import CaptainRiding from './pages/CaptainRiding'
import UserProfile from './pages/UserProfile'
import UserHistory from './pages/UserHistory'
import UserPayment from './pages/UserPayment'
import CaptainProfile from './pages/CaptainProfile'
import CaptainHistory from './pages/CaptainHistory'
import CaptainPayment from './pages/CaptainPayment'
import 'remixicon/fonts/remixicon.css'

const App = () => {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Start />} />
        <Route path='/login' element={<UserLogin />} />
        <Route path='/riding' element={<Riding />} />
        <Route path='/captain-riding' element={<CaptainRiding />} />

        <Route path='/signup' element={<UserSignup />} />
        <Route path='/captain-login' element={<Captainlogin />} />
        <Route path='/captain-signup' element={<CaptainSignup />} />
        <Route path='/home'
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          } />
        <Route path='/user/logout'
          element={<UserProtectWrapper>
            <UserLogout />
          </UserProtectWrapper>
          } />
        <Route path='/captain-home' element={
          <CaptainProtectWrapper>
            <CaptainHome />
          </CaptainProtectWrapper>

        } />
        <Route path='/captain/logout' element={
          <CaptainProtectWrapper>
            <CaptainLogout />
          </CaptainProtectWrapper>
        } />

        {/* User Features Routes */}
        <Route path='/user/profile' element={<UserProtectWrapper><UserProfile /></UserProtectWrapper>} />
        <Route path='/user/history' element={<UserProtectWrapper><UserHistory /></UserProtectWrapper>} />
        <Route path='/user/payment' element={<UserProtectWrapper><UserPayment /></UserProtectWrapper>} />

        {/* Captain Features Routes */}
        <Route path='/captain/profile' element={<CaptainProtectWrapper><CaptainProfile /></CaptainProtectWrapper>} />
        <Route path='/captain/history' element={<CaptainProtectWrapper><CaptainHistory /></CaptainProtectWrapper>} />
        <Route path='/captain/payment' element={<CaptainProtectWrapper><CaptainPayment /></CaptainProtectWrapper>} />

      </Routes>
    </div>
  )
}

export default App