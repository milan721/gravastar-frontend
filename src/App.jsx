
import { Route,Routes } from "react-router-dom"
import Home from "./users/pages/Home"
import Auth from "./pages/Auth"
import PagenotFound from "./pages/PagenotFound"
import { useEffect, useState } from "react"
import Preloader from "./components/Preloader"
import Collections from "./users/pages/Collections"
import View from "./users/pages/View"
import UserProfile from "./users/pages/Profile"

import AdminPanel from "./administrator/pages/AdminPanel"
import AdminCollection from"./administrator/pages/AdminCollections"
import AdminHome from"./administrator/pages/AdminHome"
import AdminView from"./administrator/pages/AdminView"
import AdminProfile from"./administrator/pages/AdminProfile"
import ReviewPanel from "./reviewer/pages/ReviewPanel"
import ReviewHome from "./reviewer/pages/ReviewHome"
import ReviewView from "./reviewer/pages/ReviewView"
import ReviewCollections from "./reviewer/pages/ReviewCollections"
import EditModal from "./reviewer/pages/ReviewImprove"
import SuggestImprovementModal from "./reviewer/pages/ReviewImprove"
import ReviewProfilePage from "./reviewer/pages/ReviewProfile"



function App() {


  const [isLoading, setIsLoading] = useState(true)

  useEffect(()=>{
    const timer = setTimeout(()=>{
      setIsLoading(false)
    },2000)
    return () => clearTimeout(timer)
  },[])
  

  return (
    <>
      
        <Routes>
          <Route path='/' element={ isLoading ? <Preloader/> : <Home/>}/>
          <Route path='/loading' element={<Preloader/>}/>
          <Route path='/login' element={<Auth/>}/>
          <Route path='/register' element={<Auth register/>}/>
          <Route path='/collections' element={<Collections/>}/>
          <Route path='/*' element={<PagenotFound/>}/>
          <Route path='/profile' element={<UserProfile/>}/>
          <Route path='/view' element={<View/>}/>
          {/* Show preloader route for role-based redirects */}
          <Route path='/admin-panel' element={isLoading ? <Preloader/> : <AdminPanel/>}/>
          <Route path='/admin-collections' element={<AdminCollection/>}/>
          <Route path='/admin-view' element={<AdminView/>}/>
          <Route path='/admin-home' element={<AdminHome/>}/>
          <Route path='/admin-profile' element={<AdminProfile/>}/>

             <Route path='/review-panel' element={isLoading ? <Preloader/> : <ReviewPanel/>}/>
          <Route path='/review-collections' element={<ReviewCollections/>}/>
          <Route path='/review-view' element={<ReviewView/>}/>
          <Route path='/review-home' element={<ReviewHome/>}/>
           <Route path='/suggest' element={<SuggestImprovementModal />}/>
          <Route path='/review-profile' element={<ReviewProfilePage/>}/>

         
          {/* /* any other url other than above mentioned */}
        </Routes>
      
    </>
  )
}

export default App
