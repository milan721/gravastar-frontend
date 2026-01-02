import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faFacebook } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight'

const Footer = () => {
  return (
    <>
    <div className='md:flex justify-between px-5 py-6 bg-blue-900 text-white gap-x-24'>
      <div className='flex flex-col flex-1 text-left'>
        <h3 className='text-white mt-4'>ABOUT US</h3>
        <p className='text-white mt-2'>Our mission is to create an open, innovative platform where researchers, students, and professionals can publish, access, and share scientific knowledge without boundaries. We aim to simplify the process of academic publishing while ensuring global visibility and credibility for every contribution.</p>
      </div>

      <div className='items-center justify-center '>
        <h3 className='text-white mt-4 '>NEWSLETTER</h3>
        <p className='text-white mt-2'>Stay updated with our latest trends</p>
        <input type="text" placeholder='Email ID' className='rounded border p-1 mt-2' style={{background:'white', color:'black'}} />
        <span className="bg-yellow-400 p-1 ms-1 rounded border-yellow-400 text-yellow py-1 px-2 shadow hover:border hover:border-white hover:text-white hover:bg-yellow"><FontAwesomeIcon icon={faArrowRight} /></span>
      </div>

      <div className='items-center justify-center '>
        <h3 className='text-white mt-4 '>PROFESSIONAL INFORMATION</h3>
        <p className='text-white mt-2'>Communications Preferences</p>
        <p className='text-white mt-2'>Profession and Education</p>
        <p className='text-white mt-2'>Technical interests</p>
       
      </div>

      <div className='items-center justify-center me-3'>
        <h3 className='text-white mt-4'>FOLLOW US</h3>
        <p className='text-white mt-2'>Let us be social</p>
        <div className='mt-2'>
          <FontAwesomeIcon icon={faInstagram} className='me-3' style={{color:'white'}} />
          <FontAwesomeIcon icon={faXTwitter} className='me-3' style={{color:'white'}} />
          <FontAwesomeIcon icon={faFacebook} className='me-3' style={{color:'white'}} />
        </div>
      </div>


    </div>


    <div className='bg-blue-800 p-5'>

     
        <p className='text-white mt-2 text-center '>About GRAVASTAR | Contact Us | Help | Accessibility | Terms of Use | Nondiscrimination Policy | GRAVASTAR Ethics Reporting | Sitemap | GRAVASTAR Privacy Policy.</p>
        <p className='text-white mt-2 text-center '> A public charity, GRAVASTAR is the world's largest technical professional organization dedicated to advancing technology for the benefit of humanity.</p>
       
      

      
    </div>
    <div className='bg-gray-500 p-5'>
      <p className='text-center text-white'>Copyright 2025 GRAVASTAR - All rights reserved, including rights for text and data mining and training of artificial intelligence and similar technologies.</p>
    </div>
    </>
  )
}

export default Footer