import React, { useEffect, useState, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import Header from '../components/AdminHeader'
import Footer from '../../components/Footer'
import { Link, useNavigate } from 'react-router-dom'
import { searchKeyContext } from '../../context/contextShare'


  const Home = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { setSearchKey } = useContext(searchKeyContext);
  const [followed, setFollowed] = useState([false, false, false, false]);

  const markFollowed = (i) => {
    setFollowed((prev) => prev.map((v, idx) => (idx === i ? true : v)));
  };

  return (
    <>
    <Header/>
 <header className="flex justify-center items-center">
      <div id="main" className="flex justify-center items-center w-full mb-10">
        <div className="md:grid grid-cols-3">
          <div></div>

          <div className="text-white flex justify-center items-center flex-col">
            <h3 className="text-3xl md:text-5xl text-center">Advancing Technology for Humanity</h3>

            {/* Simple Search Bar (aligned with users Home) */}
            <div className="flex items-center w-full max-w-md bg-white shadow-sm mt-10 rounded-full overflow-hidden">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="grow py-3 px-4 text-gray-700 focus:outline-none placeholder-gray-500"
              />
              <button
                className="px-4 text-blue-700 hover:text-blue-900"
                onClick={() => { setSearchKey(query); navigate('/admin-collections'); }}
                aria-label="Search"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>
            </div>
          </div>

          <div></div>
        </div>
      </div>
    </header>





    {/* mission */}
    <section className='flex  flex-col md:p-10 md:px-10 p-5'>
      <h2 className='text-4xl mb-10'>Our Mission</h2>
      <p className='text-left' style={{fontSize:'20px'}}>At Gravastar, our mission is to create an open, innovative platform where researchers, students, and professionals can publish, access, and share scientific knowledge without boundaries. We aim to simplify the process of academic publishing while ensuring global visibility and credibility for every contribution. By combining intuitive design with powerful indexing and discovery tools, Gravastar empowers users to explore diverse fields of research and stay connected to the latest advancements shaping our world.

We envision a digital ecosystem that promotes transparency, collaboration, and accessibility in research. Gravastar is built on the belief that knowledge should not be locked behind paywalls but shared freely to accelerate learning, innovation, and societal progress. Through this platform, we strive to cultivate a vibrant community where ideas ignite, discoveries grow, and the pursuit of knowledge becomes a shared journey for all.</p>
    </section>



    {/* authors */}
   <section className='flex flex-col md:p-10 md:px-10 p-5'>
  <h2 className='text-4xl mb-10'>Featured Authors</h2>

  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full justify-items-center mt-10 md:mt-0'>

    
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
          Viswam N. Vishnu
        </h5>
        <p className="mb-3 text-sm text-gray-500 italic">MIT, USA</p>
        <p className="mb-3 font-normal text-gray-700">
          SpectralFormer: Rethinking Hyperspectral Image Classification With Transformers.
        </p>

       
        <div className="mt-auto">
          <button
  className={
    followed[0]
      ? "inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-green-600 bg-green-600 text-white shadow hover:bg-green-700 rounded-md transition-colors duration-200"
      : "inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-blue-700 bg-white text-blue-700 shadow hover:bg-blue-700 hover:text-white rounded-md transition-colors duration-200"
  }
  onClick={() => markFollowed(0)}
>
  {followed[0] ? 'Followed' : 'Follow'}
</button>

          <p className="font-normal text-gray-700 mt-3 mb-3">
            MORE FROM Viswam N. Vishnu
          </p>
        </div>
      </div>
    </div>

    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://t3.ftcdn.net/jpg/02/00/90/24/360_F_200902415_G4eZ9Ok3Ypd4SZZKjc8nqJyFVp1eOD6V.jpg"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
          Sreehari J.
        </h5>
        <p className="mb-3 text-sm text-gray-500 italic">MIT, USA</p>
        <p className="mb-3 font-normal text-gray-700">
          Quantum Internet Addressing.
        </p>

        <div className="mt-auto">
          <button
  className={
    followed[1]
      ? "inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-green-600 bg-green-600 text-white shadow hover:bg-green-700 rounded-md transition-colors duration-200"
      : "inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-blue-700 bg-white text-blue-700 shadow hover:bg-blue-700 hover:text-white rounded-md transition-colors duration-200"
  }
  onClick={() => markFollowed(1)}
>
  {followed[1] ? 'Followed' : 'Follow'}
</button>
          <p className="font-normal text-gray-700 mt-3 mb-3">
            MORE FROM Sreehari J.
          </p>
        </div>
      </div>
    </div>

  
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://media.hswstatic.com/eyJidWNrZXQiOiJjb250ZW50Lmhzd3N0YXRpYy5jb20iLCJrZXkiOiJnaWZcL3BsYXlcLzBiN2Y0ZTliLWY1OWMtNDAyNC05ZjA2LWIzZGMxMjg1MGFiNy0xOTIwLTEwODAuanBnIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjo4Mjh9fX0="
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
          Sidharth G. K.
        </h5>
        <p className="mb-3 text-sm text-gray-500 italic">Stanford University, USA</p>
        <p className="mb-3 font-normal text-gray-700">
          Generative Causality-driven Network for Graph Multi-task Learning
        </p>

        <div className="mt-auto">
          <button
  className={
    followed[2]
      ? "inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-green-600 bg-green-600 text-white shadow hover:bg-green-700 rounded-md transition-colors duration-200"
      : "inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-blue-700 bg-white text-blue-700 shadow hover:bg-blue-700 hover:text-white rounded-md transition-colors duration-200"
  }
  onClick={() => markFollowed(2)}
>
  {followed[2] ? 'Followed' : 'Follow'}
</button>
          <p className="font-normal text-gray-700 mt-3 mb-3">
            MORE FROM Sidharth G. K.
          </p>
        </div>
      </div>
    </div>

    {/* Card 4 */}
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://t4.ftcdn.net/jpg/03/83/25/83/360_F_383258331_D8imaEMl8Q3lf7EKU2Pi78Cn0R7KkW9o.jpg"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
          Sruthy Shibu
        </h5>
        <p className="mb-3 text-sm text-gray-500 italic">SNU, South Korea</p>
        <p className="mb-3 font-normal text-gray-700">
          SpectralFormer: Rethinking Hyperspectral Image Classification With Transformers.
        </p>

        <div className="mt-auto">
          <button
  className={
    followed[3]
      ? "inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-green-600 bg-green-600 text-white shadow hover:bg-green-700 rounded-md transition-colors duration-200"
      : "inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-blue-700 bg-white text-blue-700 shadow hover:bg-blue-700 hover:text-white rounded-md transition-colors duration-200"
  }
  onClick={() => markFollowed(3)}
>
  {followed[3] ? 'Followed' : 'Follow'}
</button>
          <p className="font-normal text-gray-700 mt-3 mb-3">
            MORE FROM Sruthy Shibu
          </p>
        </div>
      </div>
    </div>
  </div>
<div className="flex justify-center items-center mt-10">
    <Link to={'/admin-collections'}>
      <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-blue-700 bg-white text-blue-700 shadow hover:bg-blue-700 hover:text-white rounded-md transition-colors duration-200">
        Explore More
      </button>
    </Link>
  </div>

</section>







    {/* articles */}
     <section className='flex flex-col md:p-10 md:px-10 p-5 mb-5'>
  <h2 className='text-4xl mb-10'>Featured Articles</h2>

  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full justify-items-center mt-10 md:mt-0'>

    
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://www.asc-csa.gc.ca/images/recherche/tiles/d0927ef1-27a7-4aa5-b597-599b0570451b.jpg"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        
        <p className="mb-3 font-normal text-gray-700">
          As the most powerful space telescope ever built, Webb is set to reveal the hidden universe in unprecedented detail. Webb is an international collaboration between NASA, the European Space Agency, and the Canadian Space Agency.
        </p>

        
        <div className="mt-auto">
          
          <button className="font-normal text-blue-700 mt-3 mb-3 hover:underline" onClick={() => navigate('/admin-collections')}>
            READ MORE
          </button>
        </div>
      </div>
    </div>

    
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2022/08/heart_of_the_phantom_galaxy/24419865-1-eng-GB/Heart_of_the_Phantom_Galaxy.jpg"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        
        <p className="mb-3 font-normal text-gray-700">
          As the most powerful space telescope ever built, Webb is set to reveal the hidden universe in unprecedented detail. Webb is an international collaboration between NASA, the European Space Agency, and the Canadian Space Agency.
        </p>

        
        <div className="mt-auto">
          
          <button className="font-normal text-blue-700 mt-3 mb-3 hover:underline" onClick={() => navigate('/admin-collections')}>
            READ MORE
          </button>
        </div>
      </div>
    </div>

    
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://live.staticflickr.com/65535/53405989488_c12c5b2532.jpg"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        
        <p className="mb-3 font-normal text-gray-700">
          As the most powerful space telescope ever built, Webb is set to reveal the hidden universe in unprecedented detail. Webb is an international collaboration between NASA, the European Space Agency, and the Canadian Space Agency.
        </p>

       
        <div className="mt-auto">
          
          <button className="font-normal text-blue-700 mt-3 mb-3 hover:underline" onClick={() => navigate('/admin-collections')}>
            READ MORE
          </button>
        </div>
      </div>
    </div>

 
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://science.nasa.gov/wp-content/uploads/2023/06/webb-flickr-52259221868-30e1c78f0c-4k-jpg.webp"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col flex-grow">
        
        <p className="mb-3 font-normal text-gray-700">
          As the most powerful space telescope ever built, Webb is set to reveal the hidden universe in unprecedented detail. Webb is an international collaboration between NASA, the European Space Agency, and the Canadian Space Agency.
        </p>

       
        <div className="mt-auto">
          
          <button className="font-normal text-blue-700 mt-3 mb-3 hover:underline" onClick={() => navigate('/admin-collections')}>
            READ MORE
          </button>
        </div>
      </div>
    </div>
  </div>
<div className="flex justify-center items-center mt-10">
   <Link to={'/admin-collections'}>
      <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-blue-700 bg-white text-blue-700 shadow hover:bg-blue-700 hover:text-white rounded-md transition-colors duration-200">
        Explore More
      </button>
   </Link>
  </div>

</section>





    

<Footer/>

    </>
  )
}

export default Home