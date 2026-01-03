import React, { useContext, useEffect, useRef, useState } from 'react';
import Header from '../components/AdminHeader';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faFileArrowDown, faCopyright } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { serverURL } from '../../services/serverURL';
import { getMeApi, getAllPapersApi } from '../../services/allApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchKeyContext } from '../../context/contextShare';
import { getToken } from '../../services/authStorage';

const AllBooks = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);

  const [genreOptions, setGenreOptions] = useState([]);
  const [publisherOptions, setPublisherOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPublisher, setSelectedPublisher] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState('');
  const [yearRange, setYearRange] = useState({ from: '', to: '' });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { searchKey, setSearchKey } = useContext(searchKeyContext);

  const genreRef = useRef(null);
  const publisherRef = useRef(null);
  const typeRef = useRef(null);
  const dateRef = useRef(null);

  const [genreOpen, setGenreOpen] = useState(false);
  const [publisherOpen, setPublisherOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchPapers = async () => {
    try {
      const allRes = await getAllPapersApi();
      let list = [];
      if (allRes?.status === 200) {
        const all = allRes.data || [];
        list = all.filter(p => p.adminApproved === true);
      }

      setPapers(list);
      setFilteredPapers(list);
      const genres = Array.from(new Set((list || []).map(p => p.genre).filter(Boolean)));
      const publishers = Array.from(new Set((list || []).map(p => p.publisher).filter(Boolean)));
      const types = Array.from(new Set((list || []).map(p => p.type).filter(Boolean)));
      setGenreOptions(['All', ...genres]);
      setPublisherOptions(['All', ...publishers]);
      setTypeOptions(['All', ...types]);
    } catch (error) {
      console.error("Error:", error);
      toast.error('Failed to load papers');
    }
  };

  useEffect(() => { fetchPapers(); }, []);
  // Refetch on navigation changes (e.g., after reject/suggest redirects)
  useEffect(() => { fetchPapers(); }, [location.key]);
  

  // Strict role gating: admin only
  useEffect(() => {
    (async () => {
      try {
        if (!token) { setIsAdmin(false); return; }
        const reqHeader = { Authorization: `Bearer ${token}` };
        const res = await getMeApi(reqHeader);
        if (res?.status === 200 && (res.data?.role === 'admin')) setIsAdmin(true);
        else setIsAdmin(false);
      } catch (error) { console.error("Error:", error); setIsAdmin(false); }
    })();
  }, [token]);

  useEffect(() => {
    let temp = [...papers];

    const q = (searchKey || '').trim().toLowerCase();
    if (q) {
      temp = temp.filter(p => (p.title || '').toLowerCase().includes(q));
    }
    if (selectedGenre !== 'All') temp = temp.filter(p => p.genre === selectedGenre);
    if (selectedPublisher !== 'All') temp = temp.filter(p => p.publisher === selectedPublisher);
    if (selectedType !== 'All') temp = temp.filter(p => p.type === selectedType);
    if (yearFilter) temp = temp.filter(p => p.year === parseInt(yearFilter));
    if (yearRange.from && yearRange.to) temp = temp.filter(p => p.year >= parseInt(yearRange.from) && p.year <= parseInt(yearRange.to));

    setFilteredPapers(temp);
  }, [searchKey, selectedGenre, selectedPublisher, selectedType, yearFilter, yearRange, papers]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateRef.current && !dateRef.current.contains(e.target)) setDateDropdownOpen(false);
      if (genreRef.current && !genreRef.current.contains(e.target)) setGenreOpen(false);
      if (publisherRef.current && !publisherRef.current.contains(e.target)) setPublisherOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleAbstract = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSearch = () => {
    let temp = [...papers];
    const q = (searchKey || '').trim().toLowerCase();
    if (q) {
      temp = temp.filter(p => (p.title || '').toLowerCase().includes(q));
    }
    if (selectedGenre !== 'All') temp = temp.filter(p => p.genre === selectedGenre);
    if (selectedPublisher !== 'All') temp = temp.filter(p => p.publisher === selectedPublisher);
    if (selectedType !== 'All') temp = temp.filter(p => p.type === selectedType);
    if (yearFilter) temp = temp.filter(p => p.year === parseInt(yearFilter));
    if (yearRange.from && yearRange.to) temp = temp.filter(p => p.year >= parseInt(yearRange.from) && p.year <= parseInt(yearRange.to));
    setFilteredPapers(temp);
  };

  const resetDateFilter = () => {
    setYearFilter('');
    setYearRange({ from: '', to: '' });
  };

  // Reset all filters and search
  const resetAllFilters = () => {
    setSearchKey('');
    setSelectedGenre('All');
    setSelectedPublisher('All');
    setSelectedType('All');
    setYearFilter('');
    setYearRange({ from: '', to: '' });
    setFilteredPapers(papers);
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Header />

      {/* Header Search Bar */}
      <header className="flex justify-center items-center">
        <div id="main" className="flex justify-center items-center w-full mb-10">
          <div className="md:grid grid-cols-3">
            <div></div>
            <div className="text-white flex justify-center items-center flex-col">
              <h3 className="text-5xl text-center">Advancing Technology for Humanity</h3>
              <div className="flex items-center w-full max-w-lg mt-10 gap-3 px-3 md:px-0">
                <input
                  type="text"
                  placeholder="Search papers by title"
                  value={searchKey}
                  onChange={(e)=>setSearchKey(e.target.value)}
                  className="grow py-3 px-4 text-gray-700 focus:outline-none placeholder-gray-500 rounded-full border bg-white"
                />
                <button onClick={handleSearch} className="px-3 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full bg-blue-600 text-white hover:bg-blue-700">
                  Search
                </button>
                <button onClick={resetAllFilters} className="px-3 py-2 text-sm md:px-6 md:py-3 md:text-base rounded-full border bg-white text-gray-700 hover:bg-gray-100">
                  Reset Filters
                </button>
              </div>
              
            </div>
            <div></div>
          </div>
        </div>
      </header>

      {/* Mobile Filters Toggle */}
      <div className="md:hidden px-5 pt-6">
        <button
          className="px-5 py-2 pt-3 rounded-full border bg-white text-gray-700 hover:bg-gray-100"
          onClick={() => setMobileFiltersOpen((v) => !v)}
        >
          {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
        {mobileFiltersOpen && (
          <div className="mt-4 space-y-4">
            {/* Genre */}
            <div className="relative" ref={genreRef}>
              <span className="font-semibold mb-1 block">Genre</span>
              <button
                className="w-full px-4 py-2 bg-gray-200 rounded-full flex justify-between items-center"
                onClick={() => setGenreOpen(!genreOpen)}
              >
                {selectedGenre}
                <FontAwesomeIcon icon={genreOpen ? faChevronUp : faChevronDown} />
              </button>
              {genreOpen && (
                <ul className="bg-white shadow-md mt-2 rounded-md w-full max-h-48 overflow-auto z-10">
                  {genreOptions.map(g => (
                    <li
                      key={g}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedGenre === g ? 'bg-blue-100' : ''}`}
                      onClick={() => { setSelectedGenre(g); setGenreOpen(false); }}
                    >
                      {g}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Publisher */}
            <div className="relative" ref={publisherRef}>
              <span className="font-semibold mb-1 block">Publisher</span>
              <button
                className="w-full px-4 py-2 bg-gray-200 rounded-full flex justify-between items-center"
                onClick={() => setPublisherOpen(!publisherOpen)}
              >
                {selectedPublisher}
                <FontAwesomeIcon icon={publisherOpen ? faChevronUp : faChevronDown} />
              </button>
              {publisherOpen && (
                <ul className="bg-white shadow-md mt-2 rounded-md w-full max-h-48 overflow-auto z-10">
                  {publisherOptions.map(p => (
                    <li
                      key={p}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedPublisher === p ? 'bg-blue-100' : ''}`}
                      onClick={() => { setSelectedPublisher(p); setPublisherOpen(false); }}
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Type */}
            <div className="relative" ref={typeRef}>
              <span className="font-semibold mb-1 block">Type</span>
              <button
                className="w-full px-4 py-2 bg-gray-200 rounded-full flex justify-between items-center"
                onClick={() => setTypeOpen(!typeOpen)}
              >
                {selectedType}
                <FontAwesomeIcon icon={typeOpen ? faChevronUp : faChevronDown} />
              </button>
              {typeOpen && (
                <ul className="bg-white shadow-md mt-2 rounded-md w-full max-h-48 overflow-auto z-10">
                  {typeOptions.map(t => (
                    <li
                      key={t}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedType === t ? 'bg-blue-100' : ''}`}
                      onClick={() => { setSelectedType(t); setTypeOpen(false); }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Date */}
            <div className="relative" ref={dateRef}>
              <span className="font-semibold mb-1 block">Date</span>
              <button
                className="w-full px-4 py-2 bg-gray-200 rounded-full flex justify-between items-center"
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              >
                {yearFilter || (yearRange.from && yearRange.to) ? 'Filtered' : 'Select'}
                <FontAwesomeIcon icon={dateDropdownOpen ? faChevronUp : faChevronDown} />
              </button>
              {dateDropdownOpen && (
                <div className="bg-white shadow-md mt-2 p-3 rounded-md w-full z-10">
                  <div className="mb-2 flex justify-between items-center">
                    <label className="block text-sm font-medium">Specific Year:</label>
                    <button
                      className="text-sm text-red-600 hover:underline"
                      onClick={resetDateFilter}
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    type="number"
                    placeholder="e.g. 2023"
                    value={yearFilter}
                    onChange={e => setYearFilter(e.target.value)}
                    className="w-full px-2 py-1 border rounded mb-2"
                  />
                  <div>
                    <label className="block text sm font-medium">Range:</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="From"
                        value={yearRange.from}
                        onChange={e => setYearRange(prev => ({ ...prev, from: e.target.value }))}
                        className="w-1/2 px-2 py-1 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="To"
                        value={yearRange.to}
                        onChange={e => setYearRange(prev => ({ ...prev, to: e.target.value }))}
                        className="w-1/2 px-2 py-1 border rounded"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="px-5 md:px-10 py-10 flex gap-5">
        {/* Left Filters */}
        <div className="w-64 md:sticky md:top-24 hidden md:flex flex-col gap-5 mt-15">
          {/* Genre */}
          <div className="relative" ref={genreRef}>
            <span className="font-semibold mb-1 block">Genre</span>
            <button
              className="w-full px-4 py-2 bg-gray-200 rounded-full flex justify-between items-center"
              onClick={() => setGenreOpen(!genreOpen)}
            >
              {selectedGenre}
              <FontAwesomeIcon icon={genreOpen ? faChevronUp : faChevronDown} />
            </button>
            {genreOpen && (
              <ul className="bg-white shadow-md mt-2 rounded-md w-full max-h-48 overflow-auto z-10">
                {genreOptions.map(g => (
                  <li
                    key={g}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedGenre === g ? 'bg-blue-100' : ''}`}
                    onClick={() => { setSelectedGenre(g); setGenreOpen(false); }}
                  >
                    {g}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Publisher */}
          <div className="relative" ref={publisherRef}>
            <span className="font-semibold mb-1 block">Publisher</span>
            <button
              className="w-full px-4 py-2 bg-gray-200 rounded-full flex justify-between items-center"
              onClick={() => setPublisherOpen(!publisherOpen)}
            >
              {selectedPublisher}
              <FontAwesomeIcon icon={publisherOpen ? faChevronUp : faChevronDown} />
            </button>
            {publisherOpen && (
              <ul className="bg-white shadow-md mt-2 rounded-md w-full max-h-48 overflow-auto z-10">
                {publisherOptions.map(p => (
                  <li
                    key={p}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedPublisher === p ? 'bg-blue-100' : ''}`}
                    onClick={() => { setSelectedPublisher(p); setPublisherOpen(false); }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Type */}
          <div className="relative" ref={typeRef}>
            <span className="font-semibold mb-1 block">Type</span>
            <button
              className="w-full px-4 py-2 bg-gray-200 rounded-full flex justify-between items-center"
              onClick={() => setTypeOpen(!typeOpen)}
            >
              {selectedType}
              <FontAwesomeIcon icon={typeOpen ? faChevronUp : faChevronDown} />
            </button>
            {typeOpen && (
              <ul className="bg-white shadow-md mt-2 rounded-md w-full max-h-48 overflow-auto z-10">
                {typeOptions.map(t => (
                  <li
                    key={t}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedType === t ? 'bg-blue-100' : ''}`}
                    onClick={() => { setSelectedType(t); setTypeOpen(false); }}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Date */}
          <div className="relative" ref={dateRef}>
            <span className="font-semibold mb-1 block">Date</span>
            <button
              className="w-full px-4 py-2 bg-gray-200 rounded-full flex justify-between items-center"
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            >
              {yearFilter || (yearRange.from && yearRange.to) ? 'Filtered' : 'Select'}
              <FontAwesomeIcon icon={dateDropdownOpen ? faChevronUp : faChevronDown} />
            </button>
            {dateDropdownOpen && (
              <div className="bg-white shadow-md mt-2 p-3 rounded-md w-full z-10">
                <div className="mb-2 flex justify-between items-center">
                  <label className="block text-sm font-medium">Specific Year:</label>
                  <button
                    className="text-sm text-red-600 hover:underline"
                    onClick={resetDateFilter}
                  >
                    Reset
                  </button>
                </div>
                <input
                  type="number"
                  placeholder="e.g. 2023"
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                  className="w-full px-2 py-1 border rounded mb-2"
                />
                <div>
                  <label className="block text sm font-medium">Range:</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="From"
                      value={yearRange.from}
                      onChange={e => setYearRange(prev => ({ ...prev, from: e.target.value }))}
                      className="w-1/2 px-2 py-1 border rounded"
                    />
                    <input
                      type="number"
                      placeholder="To"
                      value={yearRange.to}
                      onChange={e => setYearRange(prev => ({ ...prev, to: e.target.value }))}
                      className="w-1/2 px-2 py-1 border rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Paper List */}
        <div className="flex-1">
          {!token || !isAdmin ? (
            <div className="flex justify-center items-center min-h-[40vh] flex-col gap-6 px-4 text-center">
              <p className="text-2xl">Admin access required to view collections.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
                <div className="bg-gray-100 p-6 rounded shadow">Login to view abstracts</div>
                <div className="bg-gray-100 p-6 rounded shadow">Login to open paper details</div>
                <div className="bg-gray-100 p-6 rounded shadow">Login to download PDFs</div>
              </div>
            </div>
          ) : (
            filteredPapers.length === 0 ? (
              <p>No papers found.</p>
            ) : (
              filteredPapers.map((paper, index) => (
                <div key={paper._id || index} className="bg-gray-100 p-4 rounded shadow w-full mb-4">
                  <button
                    className="font-semibold text-left text-lg text-blue-700 hover:underline"
                    onClick={() => navigate('/admin-view', { state: { paper } })}
                  >
                    {paper.title}
                  </button>
                  <div className="mt-1">
                    <span className="text-xs px-2 py-1 rounded bg-green-200 text-green-800">Approved</span>
                  </div>
                  <p className="text-sm">{paper.author}</p>
                  <p className="text-sm">Genre: {paper.genre}</p>
                  <p className="text-sm">{paper.title}{paper.title ? ' | ' : ''}{paper.year || ''}{paper.year ? ' | ' : ''}{paper.type || ''}{paper.type ? ' | ' : ''}{paper.publisher || ''}</p>

                   <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => toggleAbstract(index)}
                      className="flex items-center gap-2 text-blue-600"
                    >
                      <FontAwesomeIcon icon={expandedIndex === index ? faChevronUp : faChevronDown} />
                      Abstract
                    </button>
                      {paper.pdf && (
                      <a className="flex items-center gap-2 text-blue-700 hover:text-blue-900" href={`${serverURL}/uploads/${paper.pdf}`} target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={faFileArrowDown} />
                        <span>Download Abstract</span>
                      </a>
                    )}
                    <button className="flex items-center gap-2 text-gray-700" onClick={()=>toast.info(`Rights belong to ${paper.author}`)}>
                      <FontAwesomeIcon icon={faCopyright} />
                      <span>Copyright</span>
                    </button>
                  </div>

                  {expandedIndex === index && (
                    <div className="mt-2 bg-gray-200 p-2 text-sm rounded">{paper.abstract}</div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AllBooks;
