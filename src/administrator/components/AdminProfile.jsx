import { faPenNib, faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { editUserProfileApi } from '../../services/allApi'

const EditProfile = ({ onUpdated }) => {
  const [offCanvasStatus,setOffCanvasStatus] = useState(false)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);

  const reset = () => {
    setUsername("");
    setPassword("");
    setConfirm("");
    setBio("");
    setImage(null);
  };

  const submit = async () => {
    if (password && password !== confirm) return;
    try {
      const fd = new FormData();
      if (username) fd.append('username', username);
      if (password) fd.append('password', password);
      if (bio) fd.append('bio', bio);
      if (image) fd.append('profile', image);
      const token = sessionStorage.getItem('token');
      const reqHeader = { Authorization: `Bearer ${token}` };
      const res = await editUserProfileApi(fd, reqHeader);
      if (res?.status === 200) {
        onUpdated && onUpdated(res.data);
        setOffCanvasStatus(false);
      }
      } catch (error) { console.error("Error:", error); }
  };

  return (
    <>
      <div>
       <button 
  onClick={()=>setOffCanvasStatus(true)} 
  className="bg-blue-500 rounded text-white px-4 py-2 hover:bg-white hover:border hover:border-blue-500 hover:text-blue-500 transition flex items-center justify-center gap-2"
>
  <FontAwesomeIcon icon={faPenToSquare}/> Edit
</button>

      </div>

      { offCanvasStatus && 
        <div>
          {/* Overlay */}
          <div className='fixed inset-0 bg-gray-500/75 transition-opacity w-full h-full z-40'></div>

          {/* Side panel */}
          <div className='bg-white h-full w-90 z-50 fixed top-0 left-0 shadow-lg'>
            <div className='bg-gray-800 px-4 py-4 flex justify-between items-center text-white text-2xl'>
              <h1>Edit User Profile</h1>
              <FontAwesomeIcon 
                icon={faXmark} 
                onClick={()=> setOffCanvasStatus(false)} 
                className='cursor-pointer hover:text-gray-300 transition' 
              />
            </div>

            <div className='flex flex-col items-center mt-6 px-5 overflow-y-auto'>
              {/* Profile Image */}
              <label htmlFor="imageFile" className="relative cursor-pointer">
                <input type="file" id="imageFile" style={{display:'none'}} accept="image/*" onChange={(e)=>setImage(e.target.files?.[0]||null)} />
                <img 
                  src={image ? URL.createObjectURL(image) : "https://www.iconpacks.net/icons/2/free-user-icon-3297-thumb.png"} 
                  alt="Profile" 
                  className="h-36 w-36 rounded-full border-2 border-gray-300 object-cover"
                />
                <div className='absolute bottom-0 right-0 bg-amber-400 p-2 rounded-full w-10 h-10 flex justify-center items-center shadow-md hover:bg-amber-500 transition'>
                  <FontAwesomeIcon icon={faPenNib} className='text-white'/>
                </div>
              </label>

              {/* Input Fields */}
              <div className='mb-3 w-full mt-6 space-y-4'>
                <input value={username} onChange={(e)=>setUsername(e.target.value)} type="text" placeholder="Username" className="p-2 bg-white rounded border border-gray-300 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="password" className="p-2 bg-white rounded border border-gray-300 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" placeholder="Confirm Password" className="p-2 bg-white rounded border border-gray-300 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <textarea value={bio} onChange={(e)=>setBio(e.target.value)} rows={5} placeholder="Bio" className="p-2 bg-white rounded border border-gray-300 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>

              {/* Buttons */}
              <div className='flex justify-end w-full mt-6 space-x-3'>
                <button onClick={reset} className='bg-amber-500 rounded text-black px-5 py-2 hover:bg-white hover:border hover:border-amber-500 hover:text-amber-500 transition'>Reset</button>
                <button onClick={submit} className='bg-green-500 rounded text-white px-5 py-2 hover:bg-white hover:border hover:border-green-500 hover:text-green-500 transition'>Submit</button>
              </div>
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default EditProfile
