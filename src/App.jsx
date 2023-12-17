import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomeView from './views/HomeView'
import Login from './views/auth/Login'
import UserView from './views/users/UserView'
import TesterView from './views/users/TesterView'
import ModellerView from './views/users/ModellerView'
import ProjectorView from './views/users/ProjectorView'
import Signup from './views/auth/Signup'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomeView />} />
        <Route path='/user' element={<UserView />} />
        <Route path='/modeller' element={<ModellerView />} />
        <Route path='/projector' element={<ProjectorView />} />
        <Route path='/tester' element={<TesterView />} />
        <Route path='/auth/login' element={<Login />} />
        <Route path='/auth/signup' element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
