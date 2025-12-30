import React from 'react'
import { Link } from 'react-router-dom'

const PagenotFound = () => {
  return (
    <>
    <div className='w-full h-screen flex justify-center items-center'>
        <div className='md:grid grid-cols-3'>
            <div></div>
            <div className='flex justify-center items-center flex-col p-5 md:p-0'>
                <img src="https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUycGg3czJoM2VvMWs4M3pzeWI4Znk5NWw1dWhha3pkNmR5bHZwbWcxZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8L0Pky6C83SzkzU55a/source.gif" alt="" />
                <p>Oh No !</p>
                <h2 className='md:text-5xl text-2xl mt-4'>Looks Like You Are Lost</h2>
                <h5 className='mt-4'>Page you are looking for is not available</h5>
                <Link to={"/"}><button className='mt-4 px-4 py-3 bg-blue-500 text-white rounded hover:border hover:border-blue-500 hover:bg-white hover:text-blue-500'>Back Home</button></Link>
            </div>
            <div></div>
        </div>
    </div>
    </>
  )
}

export default PagenotFound