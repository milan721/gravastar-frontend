import React, { useEffect, useRef, useState, useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import Header from '../components/ReviewHeader'
import Footer from '../../components/Footer'
import { Link, useNavigate } from 'react-router-dom'
import { searchKeyContext } from '../../context/contextShare'


  const Home = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { setSearchKey } = useContext(searchKeyContext);

  
  useEffect(() => {}, []);

  return (
    <>
    <Header/>
 <header className="flex justify-center items-center">
      <div id="main" className="flex justify-center items-center w-full mb-10">
        <div className="md:grid grid-cols-3">
          <div></div>

          <div className="text-white flex justify-center items-center flex-col">
            <h3 className="text-5xl text-center">Advancing Technology for Humanity</h3>

          
            {/* Simple Search Bar (mirrors user Home) */}
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
                onClick={() => { setSearchKey(query); navigate('/review-collections'); }}
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
          src="https://globalnews.ca/wp-content/uploads/2013/11/ryangosling.jpg?quality=65&strip=all"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col grow">
        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
          Viswam N. Vishnu
        </h5>
        <p className="mb-3 text-sm text-gray-500 italic">MIT, USA</p>
        <p className="mb-3 font-normal text-gray-700">
          SpectralFormer: Rethinking Hyperspectral Image Classification With Transformers.
        </p>

       
        <div className="mt-auto">
          <a
  href="#"
  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-blue-700 bg-white text-blue-700 shadow hover:bg-blue-700 hover:text-white rounded-md transition-colors duration-200"
>
  Follow
</a>

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
          src="https://globalnews.ca/wp-content/uploads/2013/11/ryangosling.jpg?quality=65&strip=all"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col grow">
        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
          Sreehari J.
        </h5>
        <p className="mb-3 text-sm text-gray-500 italic">MIT, USA</p>
        <p className="mb-3 font-normal text-gray-700">
          Quantum Internet Addressing.
        </p>

        <div className="mt-auto">
          <a
  href="#"
  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-blue-700 bg-white text-blue-700 shadow hover:bg-blue-700 hover:text-white rounded-md transition-colors duration-200"
>
  Follow
</a>
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
          src="https://globalnews.ca/wp-content/uploads/2013/11/ryangosling.jpg?quality=65&strip=all"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col grow">
        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
          Sidharth G. K.
        </h5>
        <p className="mb-3 text-sm text-gray-500 italic">Stanford University, USA</p>
        <p className="mb-3 font-normal text-gray-700">
          Generative Causality-driven Network for Graph Multi-task Learning
        </p>

        <div className="mt-auto">
          <a
  href="#"
  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-blue-700 bg-white text-blue-700 shadow hover:bg-blue-700 hover:text-white rounded-md transition-colors duration-200"
>
  Follow
</a>
          <p className="font-normal text-gray-700 mt-3 mb-3">
            MORE FROM Sidharth G. K.
          </p>
        </div>
      </div>
    </div>

  
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://globalnews.ca/wp-content/uploads/2013/11/ryangosling.jpg?quality=65&strip=all"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col grow">
        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">
          Sruthy Shibu
        </h5>
        <p className="mb-3 text-sm text-gray-500 italic">SNU, South Korea</p>
        <p className="mb-3 font-normal text-gray-700">
          SpectralFormer: Rethinking Hyperspectral Image Classification With Transformers.
        </p>

        <div className="mt-auto">
          <a
  href="#"
  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-blue-700 bg-white text-blue-700 shadow hover:bg-blue-700 hover:text-white rounded-md transition-colors duration-200"
>
  Follow
</a>
          <p className="font-normal text-gray-700 mt-3 mb-3">
            MORE FROM Sruthy Shibu
          </p>
        </div>
      </div>
    </div>
  </div>
<div className="flex justify-center items-center mt-10">
    <Link to={'/review-collections'}>
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

      <div className="p-5 flex flex-col grow">
        
        <p className="mb-3 font-normal text-gray-700">
          As the most powerful space telescope ever built, Webb is set to reveal the hidden universe in unprecedented detail. Webb is an international collaboration between NASA, the European Space Agency, and the Canadian Space Agency.
        </p>

  
        <div className="mt-auto">
          
          <p className="font-normal text-gray-700 mt-3 mb-3">
            READ MORE
          </p>
        </div>
      </div>
    </div>


    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://www.asc-csa.gc.ca/images/recherche/tiles/d0927ef1-27a7-4aa5-b597-599b0570451b.jpg"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col grow">
        
        <p className="mb-3 font-normal text-gray-700">
          As the most powerful space telescope ever built, Webb is set to reveal the hidden universe in unprecedented detail. Webb is an international collaboration between NASA, the European Space Agency, and the Canadian Space Agency.
        </p>

   
        <div className="mt-auto">
          
          <p className="font-normal text-gray-700 mt-3 mb-3">
            READ MORE
          </p>
        </div>
      </div>
    </div>

   
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://www.asc-csa.gc.ca/images/recherche/tiles/d0927ef1-27a7-4aa5-b597-599b0570451b.jpg"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col grow">
        
        <p className="mb-3 font-normal text-gray-700">
          As the most powerful space telescope ever built, Webb is set to reveal the hidden universe in unprecedented detail. Webb is an international collaboration between NASA, the European Space Agency, and the Canadian Space Agency.
        </p>

       
        <div className="mt-auto">
          
          <p className="font-normal text-gray-700 mt-3 mb-3">
            READ MORE
          </p>
        </div>
      </div>
    </div>

  
    <div className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
      <div className="h-64 w-full">
        <img
          className="object-cover object-center w-full h-full"
          src="https://www.asc-csa.gc.ca/images/recherche/tiles/d0927ef1-27a7-4aa5-b597-599b0570451b.jpg"
          alt="Card image"
        />
      </div>

      <div className="p-5 flex flex-col grow">
        
        <p className="mb-3 font-normal text-gray-700">
          As the most powerful space telescope ever built, Webb is set to reveal the hidden universe in unprecedented detail. Webb is an international collaboration between NASA, the European Space Agency, and the Canadian Space Agency.
        </p>

        <div className="mt-auto">
          
          <p className="font-normal text-gray-700 mt-3 mb-3">
            READ MORE
          </p>
        </div>
      </div>
    </div>
  </div>
<div className="flex justify-center items-center mt-10">
   <Link to={'/review-collections'}>
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