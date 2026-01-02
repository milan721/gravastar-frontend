import React, { useState, useRef } from 'react';
import Header from '../components/ReviewHeader';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown, faCopyright } from '@fortawesome/free-solid-svg-icons';
import SuggestImprovementModal from '../pages/ReviewImprove';
import { useLocation, useNavigate } from 'react-router-dom';
import { serverURL } from '../../services/serverURL';
import { submitReviewDecisionApi } from '../../services/allApi';
import { jsPDF } from 'jspdf';
import { toast, ToastContainer } from 'react-toastify';

const ReviewView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const paper = state?.paper;
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const [abstractOpen, setAbstractOpen] = useState(true);
  const [contentOpen, setContentOpen] = useState(true);
  const abstractRef = useRef(null);
  const contentRef = useRef(null);
  const scrollTo = (ref) => ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const [modal, setModal] = useState({ open: false, mode: 'suggest' });

  const metaLine = (p) => [p.title, p.author, p.genre, p.year, p.type, p.publisher].filter(v=>v!==undefined && v!==null && v!=='').join(' || ');

  const downloadAbstractPdf = () => {
    if (!paper) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const meta = metaLine(paper);
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
    const meta = metaLine(paper);
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

  if (!paper) {
    return (
      <>
        <Header />
        <div className="min-h-[40vh] flex items-center justify-center">
          <p>No paper selected.</p>
        </div>
        <Footer />
      </>
    );
  }

  const submitDecision = async (decision, text='') => {
    if (!token) { toast.info('Login required'); return; }
    try {
      const res = await submitReviewDecisionApi(paper.id, { decision, text }, { Authorization: `Bearer ${token}` });
      if (res?.status === 200) {
        toast.success('Decision submitted');
        setTimeout(()=>navigate(-1), 800);
      } else {
        toast.error(res?.data || 'Submit failed');
      }
    } catch (_ERR) {
      void _ERR;
      toast.error('Submit failed');
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Header />
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
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">{paper.title}</h2>
          <div className="mt-1">
            <span className={`text-xs px-2 py-1 rounded ${paper.adminApproved ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
              {paper.adminApproved ? 'Approved' : 'Pending Approval'}
            </span>
          </div>
          <p className="text-sm mt-1">{[paper.title, paper.author, paper.genre, paper.year, paper.type, paper.publisher].filter(v => v !== undefined && v !== null && v !== '').join(' || ')}{` || paper_id: ${paper.id || ''}`}</p>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <button onClick={downloadAbstractPdf} className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <FontAwesomeIcon icon={faFileArrowDown} />
              <span>Download Abstract</span>
            </button>
            <button onClick={downloadResearchPdf} className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
              <FontAwesomeIcon icon={faFileArrowDown} />
              <span>Download Research</span>
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

          </div>

          {/* Abstract block */}
          <div ref={abstractRef} className="bg-gray-100 p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-2">Abstract</h3>
            <div className="mt-2 bg-gray-200 p-2 text-sm rounded">{paper.abstract}</div>
          </div>

          {/* Main Content block */}
          <div ref={contentRef} className="bg-gray-100 p-4 rounded shadow">
            <h3 className="text-xl font-semibold mb-2">Main Content</h3>
            <div className="mt-2 bg-gray-200 p-2 text-sm rounded">{paper.content}</div>
          </div>

          <div className="flex justify-center items-center gap-4 mt-6 flex-wrap">
            <button onClick={()=>setModal({ open: true, mode: 'reject' })} className="bg-red-700 text-white py-2 px-3 shadow hover:border hover:border-red-700 hover:text-red-700 hover:bg-white">Reject</button>
            <button onClick={()=>setModal({ open: true, mode: 'suggest' })} className="bg-blue-700 text-white py-2 px-3 shadow hover:border hover:border-blue-700 hover:text-blue-700 hover:bg-white">Suggest Improvements</button>
            <button onClick={()=>submitDecision('accept')} className="bg-green-700 text-white py-2 px-3 shadow hover:border hover:border-green-700 hover:text-green-700 hover:bg-white">Accept</button>
          </div>
        </div>
      </div>

      <SuggestImprovementModal
        open={modal.open}
        mode={modal.mode}
        onClose={()=>setModal({ open:false, mode:'suggest' })}
        onSubmit={({ status, text }) => { setModal({ open:false, mode:'suggest' }); submitDecision(status === 'reject' ? 'reject' : 'suggest', text || ''); }}
      />

      <Footer />
    </>
  );
};

export default ReviewView;
