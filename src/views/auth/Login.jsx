import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {

  const navigate = useNavigate()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      if (response.status == 200) {
        const data = await response.json()
        console.log('>>> Login \n', data);
        sessionStorage.setItem('auth', true);
        sessionStorage.setItem('user', data.user.id);
        sessionStorage.setItem('role', data.user.role);
        sessionStorage.setItem('token', data.tokens);

        navigate(`/${data.user.role}`);
      } else {
        alert('Incorrect username or password')
      }
    } catch (err) {
      console.error(err);
    }

  }

  return (
    <form className='bg-[#050505] w-[100vw] h-[100vh]' onSubmit={handleSubmit} style={{ fontFamily: 'Copperplate Gothic Bold' }}>
      <div className='lg:w-[40vw] h-[100vh] pl-10 float-left flex justify-center'>
        <img src='../src/assets/assassin.jpg' className='my-auto' alt='Assassin'></img>
      </div>
      <div className='lg:w-[60vw] h-[100vh] float-right flex justify-center'>
        <div className='my-auto w-auto text-[#E6D9C6]'>
          <p className='text-4xl text-center text-white mb-16'>Welcome</p>
          <p className='w-full'>
            <span>Email</span>
            <input className='w-full text-white p-3 mt-1 lowercase' type='email' name='email' onChange={(event) => setEmail(event.currentTarget.value)} />
          </p>
          <p className='w-full mt-10'>
            <span>Password</span>
            <input className='w-full text-white p-3 mt-1' type='password' name='password' onChange={event => setPassword(event.currentTarget.value)} />
          </p>
          <Link to={'#'}>
            <span className='float-right text-xs mt-14 hover:text-white'>Forget password?</span>
          </Link>
          <button className='bg-amber-600 hover:bg-amber-500 text-white mt-1 w-full py-4' type='submit'>Log in</button>
          <span className='text-xs'>Don't have an account?</span>
          <Link to={'/auth/signup'}>
            <span className='ml-1 text-sm text-amber-400 hover:text-amber-300'>Sign up</span>
          </Link>
        </div>
      </div>
    </form>
  )
}

export default Login