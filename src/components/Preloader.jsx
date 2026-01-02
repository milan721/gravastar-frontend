import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Preloader = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectTo = typeof window !== 'undefined' ? (sessionStorage.getItem('redirectToPath') || '/') : '/';
    const timer = setTimeout(() => {
      navigate(redirectTo, { replace: true });
      try { sessionStorage.removeItem('redirectToPath'); } catch (error) { console.error("Error:", error); }
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <>
    <div className='w-full h-screen flex justify-center items-center bg-black'>
            <div className='md:grid grid-cols-3'>
                <div></div>
                <div className='flex justify-center items-center flex-col p-5 md:p-0'>
                    <img src="https://i.pinimg.com/originals/b9/1e/11/b91e1131ca20f6369aa68d21cb3a8960.gif" alt="" />
                    
                </div>
                <div></div>
            </div>
        </div>
    </>
  )
}

export default Preloader