import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Signup = () => {

  const navigate = useNavigate();

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [role, setRole] = useState('user');

  const handleSignup = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role })
      });

      if (response.ok) {  
        const data = await response.json();
        sessionStorage.setItem('auth', true);
        sessionStorage.setItem('user', data.user.id);
        sessionStorage.setItem('role', data.user.role);
        sessionStorage.setItem('token', data.tokens);

        navigate(`/${data.user.role}`);
      } else {
        alert(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form className='bg-[#050505] w-[100vw] h-[100vh]' onSubmit={handleSignup} style={{ fontFamily: 'Copperplate Gothic Bold' }}>
      <div className='lg:w-[40vw] h-[100vh] pl-10 float-left flex justify-center'>
        <img src='../src/assets/assassin.jpg' className='my-auto' alt='Assassin'></img>
      </div>
      <div className='lg:w-[60vw] h-[100vh] float-right flex justify-center'>
        <div className='my-auto w-auto text-[#E6D9C6]'>
          <p className='text-4xl text-center text-white mb-16'>Welcome</p>
          <p className='w-full'>
            <span>Username</span>
            <input className='w-full text-white p-3 mt-1 lowercase' required type='text' onChange={event => setName(event.currentTarget.value)} />
          </p>
          <p className='w-full mt-8'>
            <span>Role</span>
            <select className='w-full text-white p-3 mt-1 lowercase' type='text' onChange={event => setRole(event.currentTarget.value)}>
              <option value={'user'}>User</option>
              <option value={'modeller'}>Modeller</option>
              <option value={'tester'}>Tester</option>
            </select>
          </p>
          <p className='w-full mt-8'>
            <span>Email</span>
            <input className='w-full text-white p-3 mt-1 lowercase' required type='email' onChange={event => setEmail(event.currentTarget.value)} />
          </p>
          <p className='w-full mt-8'>
            <span>Password</span>
            <input className='w-full text-white p-3 mt-1' required type='password' onChange={event => setPassword(event.currentTarget.value)} />
          </p>

          <button className='bg-amber-600 hover:bg-amber-500 text-white mt-14 w-full py-4' type='submit'>Sign up</button>
          <span className='text-xs'>Alreay have an account?</span>
          <Link to={'/auth/login'}>
            <span className='ml-1 text-sm text-amber-400 hover:text-amber-300'>Log in</span>
          </Link>
        </div>
      </div>
    </form>
  )
}

export default Signup