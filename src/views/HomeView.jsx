import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/assassin.jpg';

const HomeView = () => {
  return (
    <div className='bg-[#050505] w-[100vw] h-[100vh]' style={{ fontFamily: 'Copperplate Gothic Bold' }}>
      <div className='lg:w-[40vw] h-[100vh] pl-10 float-left flex justify-center'>
        <img src={logo} className='my-auto' alt='Assassin'></img>
      </div>
      <div className='lg:w-[60vw] h-[100vh] float-right flex justify-center'>
        <p className='text-6xl text-center text-[#E6D9C6] uppercase my-auto mr-60 leading-normal'>
          Transform Images <br />
          Into Stunning <br />
          3D Models
        </p>
      </div>

      <div className='absolute right-44 top-20 text-[#E6D9C6] flex w-60 justify-between'>
        <Link to={'/auth/login'}>
          <p className='hover:text-white hover:underline'>Log in</p>
        </Link>
        <Link to={ '/auth/signup' }>
          <p className='hover:text-white hover:underline'>Register</p>
        </Link>
      </div>
    </div>
  )
}

export default HomeView