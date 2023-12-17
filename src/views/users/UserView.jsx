import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProjectionWnd from '../../components/ProjectionWnd';
import ModelShow from '../../components/ModelShow';

const UserView = () => {

  const navigate = useNavigate();

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [fbFlag, setFBFlag] = useState();
  const [frontUrl, setFrontUrl] = useState(null);
  const [backUrl, setBackUrl] = useState(null);

  const [enhanceState, setEnhanceState] = useState(false);
  const [maskState, setMaskState] = useState(false);
  const [kaedimState, setKaedimState] = useState(false);
  const [warpState, setWarpState] = useState(false);
  const [projectionState, setProjectionState] = useState(false);
  const [finalState, setFinalState] = useState(false);

  const [model, setModel] = useState('public/models/cone.fbx');
  const [projectFront, setProjectFront] = useState('public/images/front.jpeg');
  const [projectBack, setProjectBack] = useState('public/images/back.jpeg')

  const frontRef = useRef(null);
  const backRef = useRef(null);

  useEffect(() => {
    if (frontImage && backImage) {
      document.getElementById('startModal').showModal();
    }
  }, [frontImage, backImage])

  const handleProgress = async () => {
    setEnhanceState(true);

    // enhance image
    const formData = new FormData();
    formData.append('frontImage', frontImage);
    formData.append('backImage', backImage);

    const enhanceRes = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/kaedim/enhance/${sessionStorage.getItem('user')}`, {
      method: 'POST',
      body: formData
    })

    if (enhanceRes.ok) {
      const enhanceData = await enhanceRes.json();
      console.log('>>> Enhanced \n', enhanceData);

      sessionStorage.setItem('projectID', enhanceData.id);
      setProjectFront(enhanceData.frontImage);
      setProjectBack(enhanceData.backImage); 

      setMaskState(true);
      setTimeout(() => setKaedimState(true), 3000);

      // kaedim api
      const reghookRes = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/kaedim/registerHook`);
      if (reghookRes.status == 200) {
        const reghookdata = await reghookRes.json();
        console.log('>>> Registered WebHook', reghookdata);

        sessionStorage.setItem('jwt', reghookdata.jwt);

        const kaedimRes = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/kaedim/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            jwt: reghookdata.jwt
          })
        });
        if (kaedimRes.status == 200) {
          const kaedimData = await kaedimRes.json();
          sessionStorage.setItem('requestID', kaedimData.requestID);

          // fetch request
          let timeId = setInterval(async () => {
            const fetchreqRes = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/kaedim/fetchRequest`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                jwt: reghookdata.jwt,
                requestID: kaedimData.requestID,
                id: sessionStorage.getItem('projectID'),
              })
            });

            if (fetchreqRes.status == 200) {
              const fetchreqData = await fetchreqRes.json();
              console.log(fetchreqData);
              clearInterval(timeId);
              setModel(fetchreqData.fbxUrl);

              let timeId1 = setInterval( async () => {
                const checkKaedim = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/project/getone/${sessionStorage.getItem('projectID')}`);
                if (checkKaedim.status == 200) {
                  const isCheck = await checkKaedim.json();
                  console.log(isCheck)
                  if (isCheck.kaedim_status) {
                    clearInterval(timeId1);

                    setWarpState(true);
                    setTimeout( () => setProjectionState(true), 4000);

                    let timeId2 = setInterval( async () => {
                      const checkProjection = await fetch(`${import.meta.env.VITE_API_ROOT}/v1/project/getone/${sessionStorage.getItem('projectID')}`);
                      if (checkProjection.status == 200) {
                        const isComplete = await checkProjection.json();
                        console.log(isComplete);
                        if (isComplete.projection_status) {
                          clearInterval(timeId2);

                          setModel(isComplete.fbxUrl);
                          setFinalState(true);
                        }
                      }
                    }, 2000);
                  }
                }
              }, 2000)
              
            }
          }, 2000);
        } else {
          console.error(kaedimRes.data)
        }

      } else {
        console.error(reghookRes.data)
      }
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('token');

    navigate('/');
  }

  const handleFileChange = (event) => {
    console.log(event)
    const file = event.target.files[0];
    if (!file) return;

    if (fbFlag == 'front') {
      setFrontImage(file);
      setFrontUrl(URL.createObjectURL(file));
    } else {
      setBackImage(file);
      setBackUrl(URL.createObjectURL(file));
    }
  }

  const handleFrontUpload = (event) => {
    if (enhanceState) return;
    setFBFlag('front');
    frontRef.current.click();
  }

  const handleBackUpload = (event) => {
    if (enhanceState) return;
    setFBFlag('back');
    backRef.current.click();
  }

  return (
    <div className='bg-[#050505] w-[100vw] h-[100vh] text-[#E6D9C6]' style={{ fontFamily: 'Copperplate Gothic Bold' }}>
      <div className='lg:w-[65vw] h-[100vh] pl-10 float-left justify-center'>
        {/* <img src='src\assets\assassin.jpg' className='my-auto' alt='Assassin'></img> */}
        <div className='h-3/5 border-2 border-dashed border-[#E6D9C6] mx-20 mt-20 mb-[1.6rem] flex justify-center'>
          <div className={`w-1/3 border-[1px] border-dashed m-10 rounded-xl relative border-[#E6D9C6] ${!enhanceState && 'hover:border-[#fa8039] cursor-pointer'} flex justify-center`} onClick={handleFrontUpload}>
            {
              frontImage ?
                <img src={frontUrl} className='rounded-xl p-1' alt='front' />
                :
                <div className='m-auto text-center text-xl leading-loose'>
                  <img src='../src/assets/upload.png' className='mx-auto' alt='upload' />
                  Drag and Drop
                  <br />
                  (Front)
                </div>
            }
            <input type='file' ref={frontRef} className='hidden' accept='image/*' onChange={handleFileChange} />
          </div>
          <div className={`w-1/3 border-[1px] border-dashed m-10 rounded-xl border-[#E6D9C6] ${!enhanceState && 'hover:border-[#fa8039] cursor-pointer'} flex justify-center`} onClick={handleBackUpload}>
            {
              backImage ?
                <img src={backUrl} className='rounded-xl p-1' alt='front' />
                :
                <div className='m-auto text-center text-xl leading-loose'>
                  <img src='../src/assets/upload.png' className='mx-auto' alt='upload' />
                  Drag and Drop
                  <br />
                  (Back)
                </div>
            }
            <input type='file' ref={backRef} className='hidden' accept='image/*' onChange={handleFileChange} />
          </div>
        </div>
        <div className='h-1/5 border-2 border-dashed flex mx-20 border-[#E6D9C6]'>
          <ul className="steps m-auto">
            <li className={`step ${maskState ? 'step-accent' : enhanceState && 'step-warning'}`} data-content={`${maskState ? '✓' : enhanceState ? '★' : ''}`}>Enhance</li>
            <li className={`step ${kaedimState ? 'step-accent' : maskState && 'step-warning'}`} data-content={`${kaedimState ? '✓' : maskState ? '★' : ''}`}>Mask</li>
            <li className={`step ${warpState ? 'step-accent' : kaedimState && 'step-warning'}`} data-content={`${warpState ? '✓' : kaedimState ? '★' : ''}`}>Kaedim</li>
            <li className={`step ${projectionState ? 'step-accent' : warpState && 'step-warning'}`} data-content={`${projectionState ? '✓' : warpState ? '★' : ''}`}>Warp</li>
            <li className={`step ${finalState ? 'step-accent' : projectionState && 'step-warning'}`} data-content={`${finalState ? '✓' : projectionState ? '★' : ''}`}>Projection</li>
          </ul>
        </div>
      </div>
      <div className='lg:w-[35vw] h-[100vh] float-right flex justify-center'>
        <div className='border-2 border-dashed w-full mr-20 my-20 border-[#E6D9C6]'>
          {finalState && <ModelShow model={model} />}
          { !finalState && projectionState && <ProjectionWnd model={model} projectFront={projectFront} projectBack={projectBack} />}
          {/* <ProjectionWnd model={model} projectFront={projectFront} projectBack={projectBack} /> */}
        </div>
      </div>

      <div className='absolute right-5 top-6 cursor-pointer btn-circle p-2' onClick={handleLogout}>
        <svg viewBox="0 0 24 24" className='hover:fill-white' fill="#E6D9C6">
          <path fill="none" d="M0 0h24v24H0z"></path>
          <path d="M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6v-3h-7v-2h7V8l5 4-5 4z"></path>
        </svg>
      </div>

      <dialog id="startModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-warning text-lg">Really?</h3>
          <p className="py-4 text-sm">Please confirm these images...</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn" onClick={handleProgress}>Confirm</button>
              <button className="btn ml-4" onClick={() => { setFrontImage(null); setBackImage(null); frontRef.current.value = null; backRef.current.value = null; }}>Try again</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* <img className='absolute' src='../src/assets/assassin.jpg' alt='assassin' /> */}
    </div >
  )
}

export default UserView