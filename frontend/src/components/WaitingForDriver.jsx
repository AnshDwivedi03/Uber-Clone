import React from 'react'

const WaitingForDriver = (props) => {
  return (
    <div className="text-white">
      <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
        props.setWaitingForDriver(false)
      }}><i className="text-3xl text-gray-400 ri-arrow-down-wide-line cursor-pointer hover:text-white transition-colors"></i></h5>

      <div className='flex items-center justify-between bg-dark-surface p-4 rounded-xl border border-gray-700 mb-5 shadow-lg transform translate-y-2'>
        <img className='h-12' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
        <div className='text-right'>
          <h2 className='text-lg font-medium capitalize text-white'>{props.ride?.captain.fullname.firstname}</h2>
          <h4 className='text-xl font-bold -mt-1 -mb-1 text-brand-primary'>{props.ride?.captain.vehicle.plate}</h4>
          <p className='text-sm text-gray-400'>Maruti Suzuki Alto</p>
          <div className='text-sm text-gray-500 font-bold mt-1 bg-gray-800 px-2 py-1 rounded-md inline-block'>OTP: <span className="text-white text-lg">{props.ride?.otp}</span></div>
        </div>
      </div>

      <div className='flex gap-2 justify-between flex-col items-center'>
        <div className='w-full mt-2'>
          <div className='flex items-center gap-5 p-3 border-b border-gray-700'>
            <i className="ri-map-pin-user-fill text-brand-primary"></i>
            <div>
              <h3 className='text-lg font-medium text-white'>Pickup</h3>
              <p className='text-sm -mt-1 text-gray-400'>{props.ride?.pickup}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 p-3 border-b border-gray-700'>
            <i className="text-lg ri-map-pin-2-fill text-brand-primary"></i>
            <div>
              <h3 className='text-lg font-medium text-white'>Destination</h3>
              <p className='text-sm -mt-1 text-gray-400'>{props.ride?.destination}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 p-3'>
            <i className="ri-currency-line text-brand-primary"></i>
            <div>
              <h3 className='text-lg font-medium text-white'>₹{props.ride?.fare} </h3>
              <p className='text-sm -mt-1 text-gray-400'>Cash Payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitingForDriver