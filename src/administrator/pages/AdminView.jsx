import React, { useState, useRef } from 'react';
import Header from '../components/AdminHeader';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faChevronDown,faChevronUp,faFileArrowDown,faCopyright, faTrash,} from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { serverURL } from '../../services/serverURL';
import { adminApprovePaperApi, submitReviewDecisionApi, deletePaperApi } from '../../services/allApi';
import { jsPDF } from 'jspdf';
import { useContext } from 'react';
import { searchKeyContext } from '../../context/contextShare';
import SuggestImprovementModal from '../../reviewer/pages/ReviewImprove';

const AllBooks = () => {
 
  const [expandedIndex, setExpandedIndex] = useState(null);
  const abstractRef = useRef(null);
  const contentRef = useRef(null);
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setSearchKey } = useContext(searchKeyContext);
  const [searchTerm, setSearchTerm] = useState('');
  const paper = state?.paper;
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const [modal, setModal] = useState({ open: false, mode: 'suggest' });

  const handleToggle = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const scrollTo = (ref) => ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const metadataLine = (p) => [p.title, p.author, p.genre, p.year, p.type, p.publisher].filter(v=>v!==undefined && v!==null && v!=='').join(' || ');

  const downloadAbstractPdf = () => {
    if (!paper) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const meta = metadataLine(paper);
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
    const lines = doc.splitTextToSize(paper.abstract || '', 520);
    doc.text(lines, 40, y);
    doc.save(`${paper.title || 'abstract'}.pdf`);
  };

  const downloadResearchPdf = () => {
    if (!paper) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const meta = metadataLine(paper);
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

  
 

  return (
    <>
      <Header />

     
      <div className="flex justify-center items-center flex-col">
        <h3 className="mt-5 text-3xl font-medium">Collection-View</h3>
        <div className="flex my-8 w-full justify-center items-center">
          <input
            type="text"
            placeholder="search by title"
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
            className="border border-gray-200 placeholder-gray-200 p-2 w-1/4"
          />
          <button
            onClick={()=>{ setSearchKey((searchTerm || '').trim()); navigate('/admin-collections'); }}
            className="bg-blue-700 text-white py-2 px-3 shadow hover:border hover:border-blue-700 hover:text-blue-700 hover:bg-white"
          >
            Search...
          </button>
        </div>
      </div>

 
      <div className="md:grid grid-cols-[1fr_4fr] gap-x-6 gap-y-6 md:py-10 md:px-10 p-5">

      
        <div className="space-y-4">
          

          
          <div className="bg-gray-100 rounded p-3 shadow">
            <h2 className="text-xl font-semibold mb-3">Sections</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="filter" onChange={()=>scrollTo(abstractRef)} /> <span>Abstract</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="filter" onChange={()=>scrollTo(contentRef)} /> <span>Main Content</span></label>
            </div>
          </div>

          
        </div>

        <div className="flex flex-col w-full mt-10 md:mt-0 space-y-4">
        
       
          <div className="bg-gray-100 w-full p-2">
            {paper ? (
              <>
                <h2 className="font-semibold">{paper.title}</h2>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${paper.adminApproved ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                    {paper.adminApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  {[paper.title, paper.author, paper.genre, paper.year, paper.type, paper.publisher].filter(v=>v!==undefined && v!==null && v!=='').join(' || ')}
                  {` || paper_id: ${paper.id || ''}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-red-600">No paper selected.</p>
            )}
        
            <div className="flex grid-cols-2 gap-2">
              <button
                onClick={() => handleToggle(0)}
                className="flex items-center gap-2 mt-2 hover:text-gray-200 focus:outline-none"
              >
                <FontAwesomeIcon
                  icon={expandedIndex === 0 ? faChevronUp : faChevronDown}
                />
                <span>Abstract</span>
              </button>
              <button onClick={downloadAbstractPdf} className="flex items-center mt-3 text-blue-700 hover:text-blue-900">
                <FontAwesomeIcon icon={faFileArrowDown} />
                <span className="ms-2">Download Abstract</span>
              </button>
              <button onClick={downloadResearchPdf} className="flex items-center mt-3 text-blue-700 hover:text-blue-900">
                <FontAwesomeIcon icon={faFileArrowDown} />
                <span className="ms-2">Download Research</span>
              </button>
              {paper?.pdf && (
                <a className="flex items-center mt-3 text-blue-700 hover:text-blue-900" href={`${serverURL}/uploads/${paper.pdf}`} target="_blank" rel="noreferrer">
                  <FontAwesomeIcon icon={faFileArrowDown} />
                  <span className="ms-2">Download Abstract</span>
                </a>
              )}
              <FontAwesomeIcon
                className="flex items-center mt-3 hover:text-gray-200 focus:outline-none"
                icon={faCopyright}
              />
                <FontAwesomeIcon className="flex items-center mt-3 hover:text-red-600 focus:outline-none" icon={faTrash} />
            </div>
        
            {paper && (
              <>
                <div ref={abstractRef} className="mt-2 bg-gray-200 p-3 text-sm">
                  <h3 className="font-semibold mb-2">Abstract</h3>
                  <p>{paper.abstract}</p>
                </div>
                <div ref={contentRef} className="mt-4 bg-gray-200 p-3 text-sm">
                  <h3 className="font-semibold mb-2">Main Content</h3>
                  <p>{paper.content}</p>
                </div>
              </>
            )}
            <div className="flex justify-center items-center gap-4 mt-4 mb-4 ">
              <button
                onClick={()=>setModal({ open:true, mode:'reject' })}
                className="bg-red-700 text-white py-2 px-3 shadow hover:border hover:border-red-700 hover:text-red-700 hover:bg-white"
              >Reject</button>
              <button
                onClick={()=>setModal({ open:true, mode:'suggest' })}
                className="bg-blue-700 text-white py-2 px-3 shadow hover:border hover:border-blue-700 hover:text-blue-700 hover:bg-white"
              >Suggest for improvements</button>
            </div>
          </div>
        
         
        
         
        
        </div>
      </div>

      <ToastContainer position="top-right" />
      <SuggestImprovementModal
        open={modal?.open}
        mode={modal?.mode || 'suggest'}
        onClose={()=>setModal({ open:false, mode:'suggest' })}
        onSubmit={async ({ status, text }) => {
          setModal({ open:false, mode:'suggest' });
          if (!paper) return;
          if (!token) { toast.info('Admin login required'); return; }
          try {
            if (status === 'reject') {
              const r = await deletePaperApi(paper.id, { Authorization: `Bearer ${token}` });
              if (r?.status === 200) { toast.success('Paper rejected/removed'); navigate('/admin-collections'); } else toast.error(r?.data || 'Reject failed');
            } else {
              const r = await submitReviewDecisionApi(paper.id, { decision:'suggest', text: text || '' }, { Authorization: `Bearer ${token}` });
              if (r?.status === 200) { toast.success('Suggestion submitted'); navigate('/admin-collections'); } else toast.error(r?.data || 'Suggest failed');
            }
          } catch (_ERR) { void _ERR; toast.error('Action failed'); }
        }}
      />
      <Footer />
    </>
  );
};

export default AllBooks;
