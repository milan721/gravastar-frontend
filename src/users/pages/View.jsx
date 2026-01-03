import React, { useRef, useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import { jsPDF } from 'jspdf';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFileArrowDown, faTrash, faCopyright,} from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { serverURL } from '../../services/serverURL';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { searchKeyContext } from '../../context/contextShare';
import { deletePaperApi, getMeApi } from '../../services/allApi';
import { jwtDecode } from 'jwt-decode';
import { getToken } from '../../services/authStorage';

const AllBooks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paper = location.state?.paper;
  const { setSearchKey } = useContext(searchKeyContext);
  const [query, setQuery] = useState("");
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    if (!paper) {
      toast.info('No paper selected. Redirecting to collections...');
      const t = setTimeout(() => navigate('/collections'), 1200);
      return () => clearTimeout(t);
    }
  }, [paper, navigate]);

  useEffect(() => {
    try {
      const token = getToken();
      if (!token || !paper) { setCanDelete(false); return; }
      const decoded = jwtDecode(token);
      const email = decoded?.userMail;
      // Owner can delete; also allow admin
      (async () => {
        try {
          const reqHeader = { Authorization: `Bearer ${token}` };
          const me = await getMeApi(reqHeader);
          const isAdmin = me?.status === 200 && me.data?.role === 'admin';
          setCanDelete(Boolean(email && (email === paper.email || isAdmin)));
        } catch (error) {
          console.error("Error:", error);
          setCanDelete(Boolean(email && email === paper.email));
        }
      })();
    } catch (error) { console.error("Error:", error); setCanDelete(false); }
  }, [paper]);

  const abstractRef = useRef(null);
  const contentRef = useRef(null);

  const scrollTo = (ref) => ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Removed text-based abstract download; use uploaded PDF instead

  const downloadPDF = () => {
    if (!paper?.pdf) return;
    const url = `${serverURL}/uploads/${paper.pdf}`;
    window.open(url, '_blank');
  };

  const downloadResearchPDF = () => {
    if (!paper) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const meta = [paper.title, paper.author, paper.genre, paper.year, paper.type, paper.publisher]
      .filter(v => v !== undefined && v !== null && v !== '')
      .join(' || ');
    let y = 40;
    doc.setFontSize(14);
    doc.text(`Metadata: ${meta}`, 40, y);
    y += 24;
    doc.text(`paper_id: ${paper.id || ''}`, 40, y);
    y += 32;
    doc.setFontSize(16);
    doc.text('Abstract', 40, y);
    y += 20;
    doc.setFontSize(12);
    const absLines = doc.splitTextToSize(paper.abstract || '', 520);
    doc.text(absLines, 40, y);
    y += absLines.length * 14 + 24;
    doc.setFontSize(16);
    doc.text('Main Content', 40, y);
    y += 20;
    doc.setFontSize(12);
    const contLines = doc.splitTextToSize(paper.content || '', 520);
    doc.text(contLines, 40, y);
    doc.save(`${paper.title || 'research'}.pdf`);
  };

  const handleDelete = async () => {
    try {
      const token = getToken();
      if (!token) { toast.info('Please login'); return; }
      const reqHeader = { Authorization: `Bearer ${token}` };
      const res = await deletePaperApi(paper.id, reqHeader);
      if (res?.status === 200) {
        toast.success('Paper deleted');
        setTimeout(()=> navigate('/profile'), 800);
      } else {
        toast.error(res?.data || 'Delete failed');
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error('Delete failed');
    }
  };


  return (
    <>
      <ToastContainer position="top-right" />
      <Header />

      {/* ======= SEARCH HEADER (navigates to Collections) ======= */}
      <div className="flex justify-center items-center flex-col">
        <h3 className="mt-5 text-3xl font-medium">View Paper</h3>
        <div className="flex my-8 w-full justify-center items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            placeholder="search by title"
            className="border border-gray-200 placeholder-gray-400 p-2 w-4/5 md:w-1/3 rounded"
          />
          <button
            className="bg-blue-700 text-white py-2 px-3 rounded shadow hover:border hover:border-blue-700 hover:text-blue-700 hover:bg-white"
            onClick={()=>{ setSearchKey(query); navigate('/collections'); }}
          >
            Search
          </button>
        </div>

      </div>

      {/* ======= MAIN CONTENT: TOGGLES + SECTIONS ======= */}
      <div className="md:grid grid-cols-[1fr_4fr] gap-x-6 gap-y-6 md:py-10 md:px-10 p-5">

        {/* ======= SECTIONS TOGGLE ======= */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded p-3 shadow">
            <h2 className="text-xl font-semibold mb-3">Sections</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="filter" onChange={()=>scrollTo(abstractRef)} /> <span>Abstract</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="filter" onChange={()=>scrollTo(contentRef)} /> <span>Main Content</span></label>
            </div>
          </div>
        </div>

        {/* ======= PAPER SECTIONS ======= */}
        <div className="flex flex-col w-full mt-10 md:mt-0 space-y-4">
          {paper && (
            <>
              {/* Info block: title, metadata, actions */}
              <div className="bg-gray-100 w-full p-4 rounded">
                <h2 className="text-2xl font-semibold mb-1">{paper.title}</h2>
                <p className="text-sm text-gray-700 mb-3">{[paper.title, paper.author, paper.genre, paper.year, paper.type, paper.publisher, `paper_id: ${paper.id}`].filter(v => v !== undefined && v !== null && v !== '').join(' || ')}</p>
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <button onClick={downloadPDF} className="text-blue-700 flex items-center gap-2"><FontAwesomeIcon icon={faFileArrowDown} /> Download Abstract</button>
                  <button onClick={downloadResearchPDF} className="text-blue-700 flex items-center gap-2"><FontAwesomeIcon icon={faFileArrowDown} /> Download Research PDF</button>
                  <button onClick={()=>toast.info(`Rights belong to ${paper.author}`)} className="text-gray-700 flex items-center gap-2"><FontAwesomeIcon icon={faCopyright} /> Copyright</button>
                  {canDelete && (
                    <button onClick={handleDelete} className="text-red-600 flex items-center gap-2 hover:text-red-700">
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Abstract block: separate card */}
              <div className="bg-gray-100 w-full p-4 rounded" ref={abstractRef}>
                <h3 className="text-xl font-semibold mb-2">Abstract</h3>
                <p className="mt-2 bg-gray-200 p-3 text-sm rounded">{paper.abstract || 'No abstract provided.'}</p>
              </div>

              {/* Main Content block: separate card */}
              <div className="bg-gray-100 w-full p-4 rounded" ref={contentRef}>
                <h3 className="text-xl font-semibold mb-2">Main Content</h3>
                <p className="mt-2 bg-gray-200 p-3 text-sm rounded">{paper.content || 'No content provided.'}</p>
              </div>
            </>
          )}
        </div>
        </div>

      <Footer />
    </>
  );
};

export default AllBooks;
