
import React, { useEffect, useState } from "react";
import Header from "../components/AdminHeader";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import EditProfile from "../components/AdminProfile";
import {faChevronDown,faChevronUp,faFileArrowDown,faTrash,faCircleInfo} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { serverURL } from "../../services/serverURL";
import { jwtDecode } from "jwt-decode";
import {
  getAdminUsersApi,
  adminUpgradeUserApi,
  adminDeleteUserApi,
  adminListAcceptedPapersApi,
  adminListRejectedPapersApi,
  adminApprovePaperApi,
  deletePaperApi,
  publishPaperAPI,
  getUserPapersApi,
  getUserPaperStatusesApi,
  getMeApi,
} from "../../services/allApi";
import { getToken } from "../../services/authStorage";
const Profile = () => {
  const navigate = useNavigate();
  // Tabs
  const [publishStatus, setPublishStatus] = useState(true);
  const [statusStatus, setStatusStatus] = useState(false);
  const [contributionStatus, setContributionStatus] = useState(false);
  const [reviewerStatus, setReviewerStatus] = useState(false);
  const [addStatus, setAddStatus] = useState(false);
  const [removeGridStatus, setRemoveGridStatus] = useState(false);
  const [dashStatus, setDashStatus] = useState(false);
  const [dashTab, setDashTab] = useState('users');
  const [me, setMe] = useState(null);

  const reloadMe = async () => {
    try {
      const t = getToken();
      if (!t) { setMe(null); return; }
      const reqHeader = { Authorization: `Bearer ${t}` };
      const res = await getMeApi(reqHeader);
      if (res?.status === 200) setMe(res.data);
    } catch (error) { console.error("Error:", error); }
  };

  // Toggles
  const [expandedAddIndex, setExpandedAddIndex] = useState(null);
  const [statusExpandedIndex, setStatusExpandedIndex] = useState(null);
  const [expandedContribIndex, setExpandedContribIndex] = useState(null);

  // Data
  const [acceptedPapers, setAcceptedPapers] = useState([]);
  const [rejectedPapers, setRejectedPapers] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminPapers, setAdminPapers] = useState([]);
  const [adminStatusesMap, setAdminStatusesMap] = useState({});
  const [suggestionModal, setSuggestionModal] = useState({ open: false, text: '' });
  const [infoModal, setInfoModal] = useState({ open: false, name: '', info: null });
  const [jwtEmail, setJwtEmail] = useState("");

  // Publish form
  const [paperData, setPaperData] = useState({
    id: "",
    title: "",
    author: "",
    genre: "",
    year: "",
    type: "",
    publisher: "",
    abstract: "",
    content: "",
    email: "",
  });
  const [pdf, setPdf] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const handlePdfChange = (e) => setPdf(e.target.files[0]);

  const handlePublish = async () => {
    const missing = [];
    if (!paperData.title) missing.push("title");
    if (!paperData.author) missing.push("author");
    if (!paperData.genre) missing.push("genre");
    if (!paperData.year) missing.push("year");
    if (!paperData.type) missing.push("type");
    if (!paperData.publisher) missing.push("publisher");
    if (!paperData.abstract) missing.push("abstract");
    if (!paperData.email) missing.push("email");
    if (missing.length) { toast.error(`Please fill: ${missing.join(", ")}`); return; }
    if (!pdf) { toast.error("Please upload a PDF file"); return; }
    try {
      const t = getToken();
      const decoded = t ? jwtDecode(t) : null;
      const mail = decoded?.userMail || paperData.email;
      const genId = () => `P${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
      const idVal = (paperData.id && paperData.id.trim()) ? paperData.id.trim() : genId();
      const formData = new FormData();
      Object.keys(paperData).forEach((key) => {
        if (key === 'email') return; // enforce JWT email
        if (key === 'id') { formData.append('id', idVal); return; }
        formData.append(key, paperData[key]);
      });
      formData.append('email', mail);
      formData.append('pdf', pdf);
      const reqHeader = { Authorization: `Bearer ${t}` };
      const result = await publishPaperAPI(formData, reqHeader);
      if (result.status === 200) {
        toast.success('Paper published successfully');
        handleReset();
        try {
          const res = await getUserPapersApi(mail);
          if (res?.status === 200) setAdminPapers(res.data || []);
          const st = await getUserPaperStatusesApi(mail);
          if (st?.status === 200) setAdminStatusesMap(st.data || {});
        } catch (error) { console.error("Error:", error); }
      } else {
        toast.error(result?.data || 'Publish failed');
      }
    } catch (error) { console.error("Error:", error); toast.error('Publish failed'); }
  };

  const handleReset = () => {
    setPaperData({ id: "", title: "", author: "", genre: "", year: "", type: "", publisher: "", abstract: "", content: "", email: jwtEmail });
    setPdf(null);
    setFileKey((k)=>k+1);
  };

  useEffect(() => {
    const t = getToken();
    const reqHeader = t ? { Authorization: `Bearer ${t}` } : {};
    (async () => {
      try { const res = await getAdminUsersApi(reqHeader); if (res?.status === 200) setUsers(res.data || []); } catch (error) { console.error("Error:", error); }
    })();
  }, []);

  // Strict role gating: admin only
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const t = getToken();
        if (!t) { setIsAdmin(false); return; }
        const reqHeader = { Authorization: `Bearer ${t}` };
        const res = await getMeApi(reqHeader);
        setIsAdmin(res?.status === 200 && res.data?.role === 'admin');
        if (res?.status === 200) setMe(res.data);
      } catch (error) { console.error("Error:", error); setIsAdmin(false); }
    })();
  }, []);

  useEffect(() => {
    try {
      const t = getToken();
      if (t) {
        const decoded = jwtDecode(t);
        const mail = decoded?.userMail;
        if (mail) { setJwtEmail(mail); setPaperData((p) => ({ ...p, email: mail })); }
        (async () => {
          try {
            const res = await getUserPapersApi(mail);
            if (res?.status === 200) setAdminPapers(res.data || []);
            const st = await getUserPaperStatusesApi(mail);
            if (st?.status === 200) setAdminStatusesMap(st.data || {});
          } catch (error) { console.error("Error:", error); }
        })();
      }
    } catch (error) { console.error("Error:", error); }
  }, []);

  const refreshAccepted = async () => {
    const t = getToken();
    const reqHeader = t ? { Authorization: `Bearer ${t}` } : {};
    try {
      const r = await adminListAcceptedPapersApi(reqHeader);
      if (r?.status === 200) setAcceptedPapers(r.data || []);
      else toast.error(r?.data || "Admin access required");
    } catch (error) { console.error("Error:", error); toast.error("Admin access required"); }
  };
  const refreshRejected = async () => {
    const t = getToken();
    const reqHeader = t ? { Authorization: `Bearer ${t}` } : {};
    try {
      const r = await adminListRejectedPapersApi(reqHeader);
      if (r?.status === 200) setRejectedPapers(r.data || []);
      else toast.error(r?.data || "Admin access required");
    } catch (error) { console.error("Error:", error); toast.error("Admin access required"); }
  };

  return (
    <>
      <Header />
      {isAdmin ? (
        <>
      <div className="h-48 bg-gray-500"></div>
      <div className="h-[230px] w-[230px] rounded-full bg-white overflow-hidden -mt-32 mx-auto md:ml-[70px] md:-mt-[130px]">
        <img className="w-full h-full object-cover" src={me?.profile ? `${serverURL}/uploads/${me.profile}` : "https://cdn-icons-png.flaticon.com/512/3135/3135823.png"} alt="profile pic" />
      </div>
      <div className="flex flex-col md:flex-row px-5 md:px-20 mt-5 gap-4 md:gap-10">
        <p className="flex justify-center items-center"><span className="text-3xl">{me?.username || me?.name || (me?.email ? me.email.split('@')[0] : 'Admin')}</span>{" "}<FontAwesomeIcon icon={faCircleCheck} className="text-blue-500 ms-2" /></p>
        <EditProfile onUpdated={reloadMe} />
      </div>
      <p className="md:px-20 px-5 my-5 text-justify">{me?.bio || "Add your bio from Edit to show it here."}</p>

      <div className="px-3 md:px-20">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center items-center my-5 gap-2 md:gap-0 px-1 md:px-0">
          <p onClick={()=>{setPublishStatus(true);setStatusStatus(false);setContributionStatus(false);setReviewerStatus(false);setAddStatus(false);setRemoveGridStatus(false);setDashStatus(false);}} className={ publishStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>Publish Research</p>
          <p onClick={()=>{setPublishStatus(false);setStatusStatus(true);setContributionStatus(false);setReviewerStatus(false);setAddStatus(false);setRemoveGridStatus(false);setDashStatus(false);}} className={ statusStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>Publish Status</p>
          <p onClick={()=>{setPublishStatus(false);setStatusStatus(false);setContributionStatus(true);setReviewerStatus(false);setAddStatus(false);setRemoveGridStatus(false);setDashStatus(false);}} className={ contributionStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>Contributions</p>
          <p onClick={()=>{setPublishStatus(false);setStatusStatus(false);setContributionStatus(false);setReviewerStatus(false);setAddStatus(true);setRemoveGridStatus(false);setDashStatus(false);refreshAccepted();}} className={ addStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>Add to Grid</p>
          <p onClick={()=>{setPublishStatus(false);setStatusStatus(false);setContributionStatus(false);setReviewerStatus(false);setAddStatus(false);setRemoveGridStatus(true);setDashStatus(false);refreshRejected();}} className={ removeGridStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>Remove from Grid</p>
          <p onClick={()=>{setPublishStatus(false);setStatusStatus(false);setContributionStatus(false);setReviewerStatus(false);setAddStatus(false);setRemoveGridStatus(false);setDashStatus(true);(async()=>{const t=getToken();const reqHeader=t?{Authorization:`Bearer ${t}`}:{ };try{const res=await getAdminUsersApi(reqHeader);if(res?.status===200) setUsers(res.data||[]);}catch(error){console.error("Error:", error);}})();}} className={ dashStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>Dashboard</p>
        </div>

        {/* Publish Research (user parity) */}
        {publishStatus && (
          <div className="bg-gray-200 p-10 mt-20 mb-20 rounded">
            <ToastContainer position="top-right" />
            <h1 className="text-center text-3xl font-medium">Publish Research</h1>
            <div className="md:grid grid-cols-2 mt-5 w-full">
              <div>
                <div className="mb-3"><textarea value={paperData.title} rows={5} placeholder="Title" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,title:e.target.value})} /></div>
                <div className="mb-3"><textarea value={paperData.author} rows={3} placeholder="Author" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,author:e.target.value})} /></div>
                <div className="mb-3"><textarea value={paperData.genre} rows={2} placeholder="Genre" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,genre:e.target.value})} /></div>
                <div className="mb-3 grid grid-cols-3 gap-3">
                  <input value={paperData.year} placeholder="Year" className="p-2 bg-white rounded w-full" type="number" onChange={(e)=>setPaperData({...paperData,year:e.target.value})} />
                  <input value={paperData.type} placeholder="Type" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,type:e.target.value})} />
                  <input value={paperData.publisher} placeholder="Publisher" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,publisher:e.target.value})} />
                </div>
                <div className="mb-3"><textarea value={paperData.abstract} rows={5} placeholder="Abstract" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,abstract:e.target.value})} /></div>
                <div className="mb-3"><textarea value={paperData.content} rows={8} placeholder="Main Content" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,content:e.target.value})} /></div>
                <div className="mb-3"><input value={paperData.email} readOnly placeholder="Email" className="p-2 bg-gray-100 rounded w-full cursor-not-allowed" /></div>
                <div className="mb-3"><textarea value={paperData.id} rows={2} placeholder="Id (optional)" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,id:e.target.value})} /></div>
              </div>
              <div className="md:mx-5">
                <div className="mb-3 flex flex-col justify-center items-center w-full mt-10">
                  <label htmlFor="pdfFile">
                    <input key={fileKey} type="file" id="pdfFile" style={{ display: "none" }} accept="application/pdf" onChange={handlePdfChange} />
                    <img src="https://png.pngtree.com/png-vector/20221016/ourmid/pngtree-upload-file-vector-single-icon-clipart-transparent-background-png-image_6318311.png" alt="upload" style={{ height: "200px", width: "200px" }} />
                  </label>
                  <p className="text-center text-sm text-gray-600 mt-2">Please upload the abstract here.</p>
                  {pdf && (<p className="text-center text-sm text-gray-800 mt-1">Selected: {pdf.name}</p>)}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2"><button onClick={handleReset} className="bg-amber-500 rounded text-black px-3 py-2 text-sm md:px-4 md:py-2 md:text-base">Reset</button><button onClick={handlePublish} className="bg-green-500 rounded text-white px-3 py-2 text-sm md:px-4 md:py-2 md:text-base sm:ms-2">Submit</button></div>
          </div>
        )}

        {/* Publish Status (user parity) */}
        {statusStatus && (
          <div className="p-10 my-20 shadow rounded">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Publish Status</h2>
              <button onClick={async()=>{
                try{ const t=getToken(); const decoded=t?jwtDecode(t):null; const mail=decoded?.userMail || paperData.email; if(!mail) return; const r=await getUserPapersApi(mail); if(r?.status===200) setAdminPapers(r.data||[]); const s=await getUserPaperStatusesApi(mail); if(s?.status===200) setAdminStatusesMap(s.data||{});}catch(error){console.error("Error:", error);}
              }} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button>
            </div>
            <div className="flex flex-col w-full mt-10 md:mt-0 space-y-4">
              {adminPapers.filter(p=>!p.adminApproved).length === 0 && (<p className="text-center text-gray-600">No submissions yet.</p>)}
              {adminPapers.filter(p=>!p.adminApproved).map((p, idx) => {
                const s = adminStatusesMap[p.id] || {};
                const stRaw = (s.decision || (p.adminApproved ? 'accept' : 'pending')).toLowerCase();
                const st = stRaw === 'accept' ? 'accepted' : stRaw === 'reject' ? 'rejected' : stRaw === 'suggest' ? 'suggested' : stRaw;
                const isPending = st === 'pending';
                const isAccepted = st === 'accepted';
                const isRejected = st === 'rejected';
                const isSuggest = st === 'suggested';
                return (
                  <div key={p._id || idx} className="bg-gray-100 w-full p-3 rounded">
                    <h2 className="text-lg font-semibold">{p.title}</h2>
                    <p className="text-sm text-gray-700">{p.author}</p>
                    <p className="text-sm">Genre: {p.genre}</p>
                    <p className="text-sm">{p.title}{p.title?" | ":""}{p.year||""}{p.year?" | ":""}{p.type||""}{p.type?" | ":""}{p.publisher||""}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => setStatusExpandedIndex(statusExpandedIndex === idx ? null : idx)} className="flex items-center gap-2 hover:text-gray-700 focus:outline-none">
                        <FontAwesomeIcon icon={statusExpandedIndex === idx ? faChevronUp : faChevronDown} />
                        <span>Abstract</span>
                      </button>
                    </div>
                    {statusExpandedIndex === idx && (<div className="mt-2 bg-gray-200 p-3 text-sm rounded">{p.abstract}</div>)}
                    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mt-4 mb-2">
                      <button className={`py-2 px-3 shadow rounded border text-sm md:text-base ${isPending ? 'bg-blue-700 text-white border-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300'}`} style={isPending ? { backgroundColor: '#1d4ed8', color: '#ffffff', borderColor: '#1d4ed8' } : { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }}>Pending for review</button>
                      <button className={`py-2 px-3 shadow rounded border text-sm md:text-base ${isAccepted ? 'bg-green-700 text-white border-green-700' : 'bg-gray-100 text-gray-700 border-gray-300'}`} style={isAccepted ? { backgroundColor: '#15803d', color: '#ffffff', borderColor: '#15803d' } : { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }}>Accepted</button>
                      <button className={`py-2 px-3 shadow rounded border text-sm md:text-base ${isSuggest ? 'bg-yellow-500 text-black border-yellow-500 animate-pulse cursor-pointer' : 'bg-gray-100 text-gray-700 border-gray-300 cursor-default'}`} style={isSuggest ? { backgroundColor: '#f59e0b', color: '#111827', borderColor: '#f59e0b' } : { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }} onClick={isSuggest ? ()=>setSuggestionModal({ open:true, text: s.text || 'No suggestions provided yet.' }) : undefined}>Suggested Improvement</button>
                      <button className={`py-2 px-3 shadow rounded border text-sm md:text-base ${isRejected ? 'bg-red-700 text-white border-red-700 animate-pulse cursor-pointer' : 'bg-gray-100 text-gray-700 border-gray-300 cursor-default'}`} style={isRejected ? { backgroundColor: '#b91c1c', color: '#ffffff', borderColor: '#b91c1c' } : { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }} onClick={isRejected ? ()=>setSuggestionModal({ open:true, text: s.text || 'No reviewer notes.' }) : undefined}>Rejected</button>
                    </div>
                  </div>
                );
              })}
              {suggestionModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded p-5 w-11/12 md:w-1/2">
                    <h3 className="text-xl font-semibold mb-3">Reviewer Feedback</h3>
                    <p className="text-sm whitespace-pre-wrap">{suggestionModal.text}</p>
                    <div className="flex justify-end mt-4">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={()=>setSuggestionModal({ open:false, text:'' })}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contributions (user parity) */}
        {contributionStatus && (
          <div className="p-10 my-20 shadow rounded">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold">Contributions</h2><button onClick={async()=>{
              try{ const t=sessionStorage.getItem('token'); const decoded=t?jwtDecode(t):null; const mail=decoded?.userMail || paperData.email; if(!mail) return; const r=await getUserPapersApi(mail); if(r?.status===200) setAdminPapers(r.data||[]); const s=await getUserPaperStatusesApi(mail); if(s?.status===200) setAdminStatusesMap(s.data||{});}catch(error){console.error("Error:", error);}
            }} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button></div>
            <div className="bg-gray-100 p-4 rounded">
              <div className="flex flex-col w-full mt-4 md:mt-0 space-y-4">
                {adminPapers.filter(p=>p.adminApproved===true).length === 0 && (<p className="text-center text-gray-600">No contributions yet.</p>)}
                {adminPapers.filter(p=>p.adminApproved===true).map((p, idx) => (
                  <div key={p._id || idx} className="bg-gray-200 w-full p-3 rounded">
                    <button onClick={()=>navigate('/admin-view',{ state:{ paper: p }})} className="text-left text-lg font-semibold text-blue-700 hover:underline">{p.title}</button>
                    <p className="text-sm text-gray-700">{p.author}</p>
                    <p className="text-sm">Genre: {p.genre}</p>
                    <p className="text-sm">{p.title}{p.title?" | ":""}{p.year||""}{p.year?" | ":""}{p.type||""}{p.type?" | ":""}{p.publisher||""}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                      <button onClick={() => setExpandedContribIndex(expandedContribIndex === idx ? null : idx)} className="flex items-center gap-2 md:gap-2 hover:text-gray-700 focus:outline-none"><FontAwesomeIcon icon={expandedContribIndex === idx ? faChevronUp : faChevronDown} /><span>Abstract</span></button>
                      {p.pdf && (<a className="flex items-center gap-2 md:gap-2 hover:text-gray-700" href={`${serverURL}/uploads/${p.pdf}`} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faFileArrowDown} /><span>Download Abstract</span></a>)}
                      <button onClick={async()=>{try{const t=getToken();const reqHeader={Authorization:`Bearer ${t}`};const r=await deletePaperApi(p.id,reqHeader);if(r?.status===200){toast.success('Deleted');setAdminPapers(list=>list.filter(x=>x.id!==p.id));}else toast.error(r?.data||'Delete failed');}catch(error){console.error("Error:", error); toast.error('Delete failed')}}} className="flex items-center gap-2 md:gap-2 text-red-600 hover:text-red-700"><FontAwesomeIcon icon={faTrash} /><span>Delete</span></button>
                    </div>
                    {expandedContribIndex === idx && (<div className="mt-2 bg-gray-300 p-3 text-sm rounded">{p.abstract}</div>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add to Grid */}
        {addStatus && (
          <div className="p-10 my-20 shadow rounded">
            <ToastContainer position="top-right" />
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold">Add to Grid</h2><button onClick={refreshAccepted} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button></div>
            <div className="flex flex-col w-full mt-4 space-y-4">
              {acceptedPapers.length === 0 && <p className="text-gray-600">No reviewer-accepted papers pending.</p>}
              {acceptedPapers.map((p, idx) => (
                <div key={p._id || idx} className="bg-gray-100 p-4 rounded shadow w-full">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="text-sm">{p.author}</p>
                  <p className="text-sm">Genre: {p.genre}</p>
                  <p className="text-sm">{p.title}{p.title?" | ":""}{p.year||""}{p.year?" | ":""}{p.type||""}{p.type?" | ":""}{p.publisher||""}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => setExpandedAddIndex(expandedAddIndex === idx ? null : idx)} className="flex items-center gap-2 text-blue-600">
                      <FontAwesomeIcon icon={expandedAddIndex === idx ? faChevronUp : faChevronDown} />
                      Abstract
                    </button>
                    {p.pdf && (
                      <a className="flex items-center gap-2 text-blue-700" href={`${serverURL}/uploads/${p.pdf}`} target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={faFileArrowDown} />
                        <span>Download Abstract</span>
                      </a>
                    )}
                  </div>
                  {expandedAddIndex === idx && <div className="mt-2 bg-gray-200 p-2 text-sm rounded">{p.abstract}</div>}
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={async()=>{try{const t=getToken();const reqHeader={Authorization:`Bearer ${t}`};const r=await adminApprovePaperApi(p.id,reqHeader);if(r?.status===200){toast.success("Added to grid");setAcceptedPapers(list=>list.filter(x=>x.id!==p.id));await refreshAccepted();}else toast.error(r?.data||"Approve failed");}catch(error){console.error("Error:", error); toast.error("Approve failed")}}} className="bg-green-600 text-white px-3 py-2 rounded">Add to Grid</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remove from Grid */}
        {removeGridStatus && (
          <div className="p-10 my-20 shadow rounded">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold">Remove from Grid</h2><button onClick={refreshRejected} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button></div>
            <div className="flex flex-col w-full mt-4 space-y-4">
              {rejectedPapers.length === 0 && <p className="text-gray-600">No reviewer-rejected papers.</p>}
              {rejectedPapers.map((p, idx) => (
                <div key={p._id || idx} className="bg-gray-100 p-4 rounded shadow w-full">
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="text-sm">{p.author}</p>
                  <p className="text-sm">Genre: {p.genre}</p>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={async()=>{try{const t=getToken();const reqHeader={Authorization:`Bearer ${t}`};const r=await deletePaperApi(p.id,reqHeader);if(r?.status===200){toast.success("Removed from grid");setRejectedPapers(list=>list.filter(x=>x.id!==p.id));await refreshRejected();}else toast.error(r?.data||"Remove failed");}catch(error){console.error("Error:", error); toast.error("Remove failed")}}} className="bg-red-600 text-white px-3 py-2 rounded">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Dashboard */}
        {dashStatus && (
          <div className="p-10 my-20 shadow rounded">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 mb-4">
              <div className="flex gap-2">
                <button onClick={()=>setDashTab('users')} className={`px-3 py-2 rounded ${dashTab==='users' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Users</button>
                <button onClick={()=>setDashTab('reviewers')} className={`px-3 py-2 rounded ${dashTab==='reviewers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Reviewers</button>
                <button onClick={()=>setDashTab('admins')} className={`px-3 py-2 rounded ${dashTab==='admins' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Admins</button>
              </div>
              <button onClick={async()=>{const t=getToken();const reqHeader=t?{Authorization:`Bearer ${t}`}:{ };try{const res=await getAdminUsersApi(reqHeader);if(res?.status===200) setUsers(res.data||[]);}catch(error){console.error("Error:", error);}}} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button>
            </div>

            {dashTab==='users' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full justify-items-center mt-4">
                {users.filter(u=>u.role!=='reviewer' && u.role!=='admin').map((u)=> (
                  <div key={u._id} className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
                    <div className="h-32 w-full flex items-center justify-center"><img className="object-contain object-center h-full w-auto max-w-full mx-auto" src="https://cdn-icons-png.flaticon.com/512/3135/3135823.png" alt="Profile" /></div>
                    <div className="p-5 flex flex-col grow space-y-2">
                      <div className="flex items-center gap-2">
                        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">{u.username || u.name}</h5>
                        {/* Info button intentionally removed for Users */}
                      </div>
                      <div className="mb-2">
                        {(() => { const active = u.lastLogin && (Date.now() - new Date(u.lastLogin).getTime()) < 30*60*1000; return <span className={`text-xs px-2 py-1 rounded ${active ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>{active ? 'Active' : 'Inactive'}</span>; })()}
                      </div>
                      <p className="mb-3 text-sm text-gray-500 italic">{u.email}</p>
                      <p className="mb-3 text-sm">Role: {u.role}</p>
                      <div className="mt-auto flex flex-wrap gap-2">
                        <button onClick={async()=>{const t=getToken();const reqHeader={Authorization:`Bearer ${t}`};const r=await adminDeleteUserApi(u._id,reqHeader); if(r?.status===200){toast.success("User removed"); setUsers(list=>list.filter(x=>x._id!==u._id));} else toast.error(r?.data||"Remove failed")}} className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-red-700 bg-white text-red-700 shadow hover:bg-red-700 hover:text-white rounded-md">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dashTab==='reviewers' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full justify-items-center mt-4">
                {users.filter(u=>u.role==='reviewer').map((u)=> (
                  <div key={u._id} className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
                    <div className="h-32 w-full flex items-center justify-center"><img className="object-contain object-center h-full w-auto max-w-full mx-auto" src="https://cdn-icons-png.flaticon.com/512/3135/3135823.png" alt="Profile" /></div>
                    <div className="p-5 flex flex-col grow space-y-2">
                      <div className="flex items-center gap-2">
                        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">{u.username || u.name}</h5>
                        <button title="More info" onClick={()=>{ if(u.reviewerInfo){ setInfoModal({ open:true, name: u.username || u.name || u.email, info: u.reviewerInfo }); } else { toast.info('No reviewer info available'); } }} className="text-xs px-2 py-1 border rounded text-gray-700 hover:bg-gray-100 flex items-center gap-1">
                          <FontAwesomeIcon icon={faCircleInfo} />
                          Info
                        </button>
                      </div>
                      <div className="mb-2">
                        {(() => { const active = u.lastLogin && (Date.now() - new Date(u.lastLogin).getTime()) < 30*60*1000; return <span className={`text-xs px-2 py-1 rounded ${active ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>{active ? 'Active' : 'Inactive'}</span>; })()}
                      </div>
                      <p className="mb-3 text-sm text-gray-500 italic">{u.email}</p>
                      <div className="mt-auto flex flex-wrap gap-2">
                        
                        <button onClick={async()=>{const t=sessionStorage.getItem("token");const reqHeader={Authorization:`Bearer ${t}`};const r=await adminDeleteUserApi(u._id,reqHeader); if(r?.status===200){toast.success("Reviewer removed"); setUsers(list=>list.filter(x=>x._id!==u._id));} else toast.error(r?.data||"Remove failed")}} className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-red-700 bg-white text-red-700 shadow hover:bg-red-700 hover:text-white rounded-md">Remove</button>
                        <button onClick={async()=>{const t=getToken();const reqHeader={Authorization:`Bearer ${t}`};const r=await adminUpgradeUserApi(u._id,'admin',reqHeader); if(r?.status===200){toast.success("Upgraded to admin"); setUsers(list=>list.map(x=>x._id===u._id?{...x,role:'admin'}:x));} else toast.error(r?.data||"Upgrade failed")}} className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-green-700 bg-white text-green-700 shadow hover:bg-green-700 hover:text-white rounded-md">Upgrade to Admin</button>
                        <button onClick={async()=>{const t=getToken();const reqHeader={Authorization:`Bearer ${t}`};const r=await adminUpgradeUserApi(u._id,'user',reqHeader); if(r?.status===200){toast.success("Downgraded to user"); setUsers(list=>list.map(x=>x._id===u._id?{...x,role:'user'}:x));} else toast.error(r?.data||"Downgrade failed")}} className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-amber-700 bg-white text-amber-700 shadow hover:bg-amber-700 hover:text-white rounded-md">Downgrade to User</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dashTab==='admins' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full justify-items-center mt-4">
                {users.filter(u=>u.role==='admin').map((u)=> (
                  <div key={u._id} className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full">
                    <div className="h-32 w-full flex items-center justify-center"><img className="object-contain object-center h-full w-auto max-w-full mx-auto" src="https://cdn-icons-png.flaticon.com/512/3135/3135823.png" alt="Profile" /></div>
                    <div className="p-5 flex flex-col grow space-y-2">
                      <div className="flex items-center gap-2">
                        <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">{u.username || u.name}</h5>
                        <button title="More info" onClick={()=>{ if(u.reviewerInfo){ setInfoModal({ open:true, name: u.username || u.name || u.email, info: u.reviewerInfo }); } else { toast.info('No reviewer info available'); } }} className="text-xs px-2 py-1 border rounded text-gray-700 hover:bg-gray-100 flex items-center gap-1">
                          <FontAwesomeIcon icon={faCircleInfo} />
                          Info
                        </button>
                      </div>
                      <div className="mb-2">
                        {(() => { const active = u.lastLogin && (Date.now() - new Date(u.lastLogin).getTime()) < 30*60*1000; return <span className={`text-xs px-2 py-1 rounded ${active ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>{active ? 'Active' : 'Inactive'}</span>; })()}
                      </div>
                      <p className="mb-3 text-sm text-gray-500 italic">{u.email}</p>
                      <div className="mt-auto flex flex-wrap gap-2">
                        <button onClick={async()=>{const t=getToken();const reqHeader={Authorization:`Bearer ${t}`};const r=await adminUpgradeUserApi(u._id,'reviewer',reqHeader); if(r?.status===200){toast.success("Downgraded to reviewer"); setUsers(list=>list.map(x=>x._id===u._id?{...x,role:'reviewer'}:x));} else toast.error(r?.data||"Downgrade failed")}} className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-green-700 bg-white text-green-700 shadow hover:bg-green-700 hover:text-white rounded-md">Downgrade to Reviewer</button>
                        <button onClick={async()=>{const t=getToken();const reqHeader={Authorization:`Bearer ${t}`};const r=await adminUpgradeUserApi(u._id,'user',reqHeader); if(r?.status===200){toast.success("Downgraded to user"); setUsers(list=>list.map(x=>x._id===u._id?{...x,role:'user'}:x));} else toast.error(r?.data||"Downgrade failed")}} className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-amber-700 bg-white text-amber-700 shadow hover:bg-amber-700 hover:text-white rounded-md">Downgrade to User</button>
                        <button onClick={async()=>{const t=getToken();const reqHeader={Authorization:`Bearer ${t}`};const r=await adminDeleteUserApi(u._id,reqHeader); if(r?.status===200){toast.success("Admin removed"); setUsers(list=>list.filter(x=>x._id!==u._id));} else toast.error(r?.data||"Remove failed")}} className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-red-700 bg-white text-red-700 shadow hover:bg-red-700 hover:text-white rounded-md">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
        </>
      ) : (
        <div className="p-10 my-10">
          <div className="flex justify-center items-center min-h-[30vh] flex-col gap-6 px-4 text-center">
            <p className="text-2xl">Admin access required to view this panel.</p>
          </div>
        </div>
      )}
      {/* Info Modal */}
      {infoModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Reviewer Details - {infoModal.name}</h3>
              <button onClick={()=>setInfoModal({ open:false, name:'', info:null })} className="text-gray-600 hover:text-gray-800">Close</button>
            </div>
            {infoModal.info ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {Object.entries(infoModal.info).map(([k,v])=> (
                  <div key={k}>
                    <p className="font-medium capitalize">{k.replace(/([A-Z])/g,' $1')}</p>
                    {k === 'pdf' && Array.isArray(v) ? (
                      <ul className="list-disc ms-5">
                        {v.map((file, i)=> (
                          <li key={i}>
                            <a className="text-blue-700 hover:text-blue-900 underline" href={`${serverURL}/uploads/${file}`} target="_blank" rel="noreferrer">{file}</a>
                          </li>
                        ))}
                      </ul>
                    ) : Array.isArray(v) ? (
                      <ul className="list-disc ms-5">
                        {v.map((x, i)=> <li key={i}>{x}</li>)}
                      </ul>
                    ) : (
                      <p className="text-gray-700">{String(v || '—')}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No reviewer info available.</p>
            )}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Profile;


