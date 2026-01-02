import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faAddressCard,faPowerOff} from '@fortawesome/free-solid-svg-icons'
import { faBars,faUser } from '@fortawesome/free-solid-svg-icons'
import { faFacebook } from '@fortawesome/free-brands-svg-icons'
import { Link, useLocation } from 'react-router-dom'
import { serverURL } from '../../services/serverURL'
import { getMeApi } from '../../services/allApi'
const Header = () => {
  const [status,setStatus] = useState(false)
  const [ dropDownStatus, setDropDownStatus] = useState(false)
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const [me, setMe] = useState(null);
  const [existingUser, setExistingUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(!!token);
  const location = useLocation();

  useEffect(()=>{
    (async ()=>{
      try{
        const currentToken = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
        if(!currentToken) { setMe(null); return; }
        const reqHeader = { Authorization: `Bearer ${currentToken}` };
        const res = await getMeApi(reqHeader);
        if(res?.status===200) setMe(res.data);
      }catch(_ERR){ /* noop */ }
    })();
  },[location]);

  useEffect(()=>{
    try {
      const euStr = typeof window !== 'undefined' ? sessionStorage.getItem('existingUser') : null;
      setExistingUser(euStr ? JSON.parse(euStr) : null);
    } catch { setExistingUser(null); }
  },[]);

  // Keep loggedIn reactive across storage changes, focus, visibility, route nav and custom auth-change
  useEffect(()=>{
    const updateAuth = () => {
      const t = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
      setLoggedIn(!!t);
      try {
        const euStr = typeof window !== 'undefined' ? sessionStorage.getItem('existingUser') : null;
        setExistingUser(euStr ? JSON.parse(euStr) : null);
      } catch { /* noop */ }
    };
    updateAuth();
    const onStorage = () => updateAuth();
    const onFocus = () => updateAuth();
    const onVis = () => updateAuth();
    const onAuthChange = () => updateAuth();
    const onMessage = (e) => { try { if (e?.data && e.data.type === 'auth-change') updateAuth(); } catch { /* noop */ } };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('auth-change', onAuthChange);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('auth-change', onAuthChange);
      window.removeEventListener('message', onMessage);
    };
  },[location]);

  const profileName = me?.profile || existingUser?.profile;
  return (
    <>

    <nav className='p-3 w-full bg-gray-900 text-white md:flex justify-center'>
      <div className='flex justify-between px-3 md:hidden'>
        <span onClick={()=>setStatus(!status)} className='text-2xl'><FontAwesomeIcon icon={faBars} /></span>
       
        <button type="button" className="inline-flex items-center justify-center gap-x-1.5 rounded-md text-sm font-semibold text-gray-900" id="menu-button" aria-expanded="true" aria-haspopup="true" onClick={()=>setDropDownStatus(!dropDownStatus)}>
          <img
            src={profileName ? `${serverURL}/uploads/${profileName}` : 'https://www.iconpacks.net/icons/2/free-user-icon-3297-thumb.png'}
            alt="User"
            style={{ width: '40px', height: '40px' }}
            className="rounded-full object-cover"
          />
        </button> 

{dropDownStatus && <div
className="absolute right-0 z-10 mt-11.5 w-56 origin-top-right rounded-md I bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex="-1">

<div className="py-1" role="none"> 
  {loggedIn ? (
    <>
      <Link to={'/profile'}>
        <p className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="menu-item-0">
          <FontAwesomeIcon icon={faAddressCard} className="me-2" /> Profile
        </p>
      </Link>
      <button
        className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="menu-item-1"
        onClick={() => { sessionStorage.removeItem('token'); window.location.reload(); }}
      >
        <FontAwesomeIcon icon={faPowerOff} className="me-2" /> Logout
      </button>
    </>
  ) : (
    <Link to={'/login'}>
      <p className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabIndex="-1" id="menu-item-2">
        <FontAwesomeIcon icon={faUser} className="me-2" /> Login
      </p>
    </Link>
  )}
</div> </div>}

      </div>
      <ul className={status? 'md:flex':'md:flex justify-center hidden'}>
        <Link to={'/'}><li className='mx-4 mt-3 md:mt-0'>Home</li></Link>
        <Link to={'/collections'}><li className='mx-4 mt-3 md:mt-0'>Collections</li></Link>
        {/* <Link to={'/view'}><li className='mx-4 mt-3 md:mt-0'>View</li></Link> */}
        <Link to={'/profile'}><li className='mx-4 mt-3 md:mt-0'>User Profile</li></Link>
      </ul>
    </nav>



    <div className='md:grid grid-cols-3 p-3 bg-black'>
      <div className='flex items-center'>
        <h2 className='flex  flex-col md:p-5 md:px-15 p-5 text-white'>GRAVASTAR</h2>
        <h1 className='text-2xl md:hidden ms-2 text-white'>“Empowering Ideas, Connecting Minds.”</h1>
      </div>
      <div className='md:flex justify-center items-center hidden'>
        <h1 className='text-2xl text-white'>“Empowering Ideas, Connecting Minds.”</h1>
      </div>
      <div className='md:flex justify-end items-center hidden'>
        <FontAwesomeIcon icon={faInstagram} className='me-3 text-white' />
        <FontAwesomeIcon icon={faXTwitter} className='me-3 text-white' />
        <FontAwesomeIcon icon={faFacebook} className='me-3 text-white' />

        {loggedIn ? (
          <button
            className='border border-white rounded px-3 py-2 ms-3 text-white'
            onClick={()=>{sessionStorage.removeItem('token'); window.location.reload();}}
          >
            <FontAwesomeIcon icon={faPowerOff} className='me-2 text-white' /> Logout
          </button>
        ) : (
          <Link to={'/login'}>
            <button className='border border-white rounded px-3 py-2 ms-3 text-white'>
              <FontAwesomeIcon icon={faUser} className='me-2 text-white' /> Login
            </button>
          </Link>
        )}




      </div>
    </div>

    
    </>
  )
}

export default Header