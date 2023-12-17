import React, { useEffect, useRef, Ref, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

const ModellerView = () => {

  const navigate = useNavigate();
  const fileRef = useRef([]);

  const [projects, setProjects] = useState([]);
  const [isLoad, setIsLoad] = useState(false);

  useEffect(() => {
    async function getProjects() {
      const projectRes = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/project/getall`);
      const data = await projectRes.json();
      console.log(data)
      setProjects(data);
    };

    getProjects();
    setTimeout(() => setIsLoad(true), 1000);
  }, []);

  const handleAccept = async (idx, id) => {
    const res = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/project/update/${id}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kaedim_is_accepted: true,
        kaedim_modeller: sessionStorage.getItem('user')
      })
    })
    setProjects(await res.json());
  }

  const handleFileChange = async (e, id) => {
    const file = e.target?.files[0];
    console.log(file);

    const formData = new FormData();
    formData.append('model', file);

    const res = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/project/uploadKaedim/${id}`, {
      method: 'post',
      body: formData
    })

    const data = await res.json();
    console.log(data);
    setProjects(data);
  }

  const handleFileUpload = (idx) => {
    fileRef.current[idx]?.click();
  }

  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('token');

    navigate('/');
  }

  return (
    <>
      <div className='bg-[#050505] w-[100vw] h-[100vh] text-[#E6D9C6]' style={{ fontFamily: 'Copperplate Gothic Bold' }}>
        {/* <img src='src\assets\assassin.jpg' className='my-auto' alt='Assassin'></img> */}
        {/* <div className='h-full border-dashed border-[#E6D9C6] mx-20 mt-20 mb-[1.6rem] flex justify-center'> */}
        <div className="px-28 pt-20 max-h-[90vh] overflow-hidden">
          <table className="table h-[50vh]">
            {/* head */}
            <thead>
              <tr>
                <th>No</th>
                <th>User</th>
                <th>Front-Img</th>
                <th>Back-Img</th>
                <td>FBX Test</td>
                <td>Upload</td>
                <th>Kaedim-S</th>
              </tr>
            </thead>
            <tbody>
              {isLoad &&
                projects.filter(item => item.fbxUrl).map((project, idx) => (
                  <tr key={idx}>
                    <th>{idx + 1}</th>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src="https://daisyui.com/tailwind-css-component-profile-4@56w.png" alt="Avatar Tailwind CSS Component" />
                          </div>
                        </div>
                        User
                      </div>
                    </td>
                    <td> <a href={project.frontImage} target='_blank' className='underline hover:text-white'>Click here</a> </td>
                    <td> <a href={project.backImage} target='_blank' className='underline hover:text-white'>Click here</a> </td>
                    <td>
                      {project.kaedim_is_accepted
                        ? <p>Accepted!</p>
                        : <a href={project.fbxUrl} onClick={() => handleAccept(idx, project.id)} target='_self' className='underline hover:text-white'>Model</a>
                      }
                    </td>
                    <td>
                      <input ref={(ele) => fileRef.current[idx] = ele} type='file' className='hidden' accept='.fbx' onChange={(e) => handleFileChange(e, project.id)} />
                      <button className='btn btn-circle' disabled={ !project.kaedim_is_accepted | project.kaedim_status } onClick={ () => handleFileUpload(idx)}>
                        <svg viewBox="0 0 1024 1024" fill="#000000">
                          <path d="M512 256l144.8 144.8-36.2 36.2-83-83v311.6h-51.2V354l-83 83-36.2-36.2L512 256zM307.2 716.8V768h409.6v-51.2H307.2z" fill="#ffffff" fillRule="evenodd"></path>
                        </svg>
                      </button>
                    </td>
                    {
                      project.kaedim_status
                        ? <td> <input type="checkbox" className="checkbox accent-white text-white" defaultChecked disabled /> </td>
                        : <td> <input type="checkbox" className="checkbox text-white" disabled /> </td>
                    }
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {/* </div> */}
        <div className='absolute right-5 top-6 cursor-pointer btn-circle p-2' onClick={handleLogout}>
          <svg viewBox="0 0 24 24" className='hover:fill-white' fill="#E6D9C6">
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3h-7v-2h7V8l5 4-5 4z"></path>
          </svg>
        </div>
        <Link to={'/projector'}>
          <p className='absolute left-5 top-6 text-xs'>Projector</p>
        </Link>
      </div >
    </>
  )
}

export default ModellerView