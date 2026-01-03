import React, { useState, useEffect } from "react";
import Header from "../components/ReviewHeader";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import EditProfile from "../components/ReviewProfile";
import { faChevronDown, faChevronUp, faFileArrowDown, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import {
  getReviewFeedApi,
  getReviewerRequestsApi,
  reviewerApproveRequestApi,
  reviewerDeleteRequestApi,
  getUserPapersApi,
  getUserPaperStatusesApi,
  publishPaperAPI,
  deletePaperApi,
  getMyReviewStatusesApi,
  getMeApi,
} from "../../services/allApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { serverURL } from "../../services/serverURL";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../../services/authStorage";

const Profile = () => {
  const [publishStatus, setPublishStatus] = useState(false);
  const [statusStatus, setStatusStatus] = useState(false);
  const [contributionStatus, setContributionStatus] = useState(false);
  const [reviewerStatus, setReviewerStatus] = useState(true);
  const [userStatus, setUserStatus] = useState(false);

  const [feed, setFeed] = useState([]);
  
  // Separate toggles per section so they persist across switches
  const [expandedReviewIndex, setExpandedReviewIndex] = useState(null);
  const [expandedContribIndex, setExpandedContribIndex] = useState(null);

  const navigate = useNavigate();
  const token = getToken();
  const [isReviewer, setIsReviewer] = useState(false);
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

  // Strict role gating: reviewer or admin
  useEffect(() => {
    (async () => {
      try {
        if (!token) { setIsReviewer(false); return; }
        const reqHeader = { Authorization: `Bearer ${token}` };
        const res = await getMeApi(reqHeader);
        const role = res?.status === 200 ? res.data?.role : null;
        setIsReviewer(role === 'reviewer' || role === 'admin');
        if (res?.status === 200) setMe(res.data);
      } catch (error) { console.error("Error:", error); setIsReviewer(false); }
    })();
  }, [token]);

  const handleToggleReview = (index) => {
    setExpandedReviewIndex(expandedReviewIndex === index ? null : index);
  };

  useEffect(() => {
    const load = async () => {
      const t = getToken();
      if (!t) return;
      try {
        const res = await getReviewFeedApi("", { Authorization: `Bearer ${t}` });
        // Load my decisions and filter out already-reviewed papers
        const my = await getMyReviewStatusesApi({ Authorization: `Bearer ${t}` });
        const map = my?.status === 200 ? (my.data || {}) : {};
        if (res?.status === 200) {
          const list = (res.data || []).filter((p) => !map[p.id]);
          setFeed(list);
        } else if (res?.status === 401) {
          toast.info("Please login to view the review feed.");
        } else if (res?.status === 403) {
          toast.info("Reviewer access required to view the review feed.");
        } else if (res) {
          toast.error(res?.data?.error || "Failed to load review feed");
        }
        if (my && my.status !== 200) {
          if (my.status === 401) toast.info("Login required to load your review statuses.");
          else toast.error(my?.data?.error || "Failed to load your review statuses");
        }
      } catch (err) { console.error("Error:", err); }
    };
    load();
  }, []);

  // Mirror user's Status/Contributions: load own papers and latest statuses
  const [userPapers, setUserPapers] = useState([]);
  const [statusesMap, setStatusesMap] = useState({});
  const [statusExpandedIndex, setStatusExpandedIndex] = useState(null);
  const [suggestionModal, setSuggestionModal] = useState({ open: false, text: '' });
  const [jwtEmail, setJwtEmail] = useState("");

  useEffect(() => {
    try {
      const t = getToken();
      if (t) {
        const decoded = jwtDecode(t);
        const mail = decoded?.userMail;
        if (mail) {
          (async () => {
            const res = await getUserPapersApi(mail);
            if (res?.status === 200) setUserPapers(res.data || []);
            const st = await getUserPaperStatusesApi(mail);
            if (st?.status === 200) setStatusesMap(st.data || {});
          })();
        }
      }
    } catch (error) { console.error("Error:", error); }
  }, []);

  // Publish Research form state
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
      formData.append("pdf", pdf);
      const reqHeader = { Authorization: `Bearer ${t}` };
      const result = await publishPaperAPI(formData, reqHeader);
      if (result.status === 200) {
        toast.success("Paper published successfully");
        handleReset();
        // refresh papers and statuses
          if (mail) {
            try {
              const res = await getUserPapersApi(mail);
              if (res?.status === 200) setUserPapers(res.data || []);
              const st = await getUserPaperStatusesApi(mail);
              if (st?.status === 200) setStatusesMap(st.data || {});
            } catch (error) { console.error("Error:", error); }
          }
      } else {
        if (result?.status === 401) toast.info("Please login to publish your paper.");
        else if (result?.status === 403) toast.info("Forbidden: You may not have permissions for this action.");
        else if (result?.status === 409) toast.error("A paper with this ID already exists.");
        else toast.error(result?.data?.error || result?.data || "Publish failed");
      }
    } catch (err) { console.error(err); toast.error("Publish failed"); }
  };
  const handleReset = () => {
    setPaperData({ id: "", title: "", author: "", genre: "", year: "", type: "", publisher: "", abstract: "", content: "", email: jwtEmail });
    setPdf(null);
    setFileKey((k)=>k+1);
  };
  useEffect(() => {
    // Autofill email from JWT
    try {
      const t = getToken();
      if (t) {
        const decoded = jwtDecode(t);
        const mail = decoded?.userMail;
        if (mail) { setJwtEmail(mail); setPaperData((p) => ({ ...p, email: mail })); }
      }
    } catch (error) { console.error("Error:", error); }
  }, []);

  const ReviewerRequestsSection = () => {
    const [requests, setRequests] = useState([]);
    const [open, setOpen] = useState({ show: false, req: null });

    useEffect(() => {
      const loadReqs = async () => {
        const t = getToken();
        if (!t) return;
        const reqHeader = { Authorization: `Bearer ${t}` };
        try {
          const r = await getReviewerRequestsApi(reqHeader);
          if (r?.status === 200) setRequests(r.data || []);
          else if (r?.status === 401) toast.info("Please login to load reviewer requests.");
          else if (r?.status === 403) toast.info("Reviewer access required to manage reviewer requests.");
          else toast.error(r?.data?.error || "Failed to load reviewer requests");
        } catch (err) { console.error("Error:", err); }
      };
      loadReqs();
    }, []);

    const removeRequest = async (id) => {
      try {
        const t = getToken();
        const reqHeader = { Authorization: `Bearer ${t}` };
        const r = await reviewerDeleteRequestApi(id, reqHeader);
        if (r?.status === 200) {
          setRequests((list) => list.filter((x) => x._id !== id));
          toast.success("Request removed");
        } else if (r?.status === 401) toast.info("Please login to remove reviewer requests.");
        else if (r?.status === 403) toast.info("Reviewer access required to remove reviewer requests.");
        else toast.error(r?.data || "Remove failed");
      } catch (error) {
        console.error("Error:", error);
        toast.error("Remove failed");
      }
    };

    const assignReviewer = async (id) => {
      try {
        const t = getToken();
        const reqHeader = { Authorization: `Bearer ${t}` };
        const r = await reviewerApproveRequestApi(id, reqHeader);
        if (r?.status === 200) {
          toast.success("Approved as reviewer");
          setRequests((list) => list.filter((x) => x._id !== id));
        } else if (r?.status === 401) toast.info("Please login to approve reviewer requests.");
        else if (r?.status === 403) toast.info("Reviewer or admin access required.");
        else toast.error(r?.data || "Approve failed");
      } catch (error) {
        console.error("Error:", error);
        toast.error("Approve failed");
      }
    };

    return (
      <>
        <ToastContainer position="top-right" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full justify-items-center mt-4">
          {requests.length === 0 && (
            <p className="text-center text-gray-600 col-span-full">No reviewer requests.</p>
          )}
          {requests.map((req) => (
            <div
              key={req._id}
              className="max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden flex flex-col h-full"
            >
              <div className="h-64 w-full">
                <img
                  className="object-cover object-center w-full h-full"
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135823.png"
                  alt="Profile"
                />
              </div>
              <div className="p-5 flex flex-col grow">
                <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900">{req.name}</h5>
                <p className="mb-3 text-sm text-gray-500 italic">
                  {req.university}, {req.location}
                </p>
                <p className="mb-3 font-normal text-gray-700">Expertise: {req.expertise}</p>
                <div className="mt-auto">
                  <button
                    onClick={() => removeRequest(req._id)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-center border border-red-700 bg-white text-red-700 shadow hover:bg-red-700 hover:text-white rounded-md transition-colors duration-200"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => assignReviewer(req._id)}
                    className="inline-flex ms-3 items-center px-4 py-2 text-sm font-medium text-center border border-green-700 bg-white text-green-700 shadow hover:bg-green-700 hover:text-white rounded-md transition-colors duration-200"
                  >
                    Approve as reviewer
                  </button>
                  <button
                    onClick={() => setOpen({ show: true, req })}
                    className="block text-blue-700 mt-3 underline"
                  >
                    More from {req.name}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {open.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-5 w-11/12 md:w-2/3">
              <h3 className="text-xl font-semibold mb-3">Reviewer Application</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p>
                  <strong>Name:</strong> {open.req?.name}
                </p>
                <p>
                  <strong>Email:</strong> {open.req?.email}
                </p>
                <p>
                  <strong>University:</strong> {open.req?.university}
                </p>
                <p>
                  <strong>Location:</strong> {open.req?.location}
                </p>
                <p className="md:col-span-2">
                  <strong>Info:</strong> {open.req?.info}
                </p>
                <p className="md:col-span-2">
                  <strong>Summary:</strong> {open.req?.summary}
                </p>
                <p>
                  <strong>Expertise:</strong> {open.req?.expertise}
                </p>
                <p>
                  <strong>Education:</strong> {open.req?.education}
                </p>
                <p>
                  <strong>Experience:</strong> {open.req?.experience}
                </p>
                <p>
                  <strong>Activities:</strong> {open.req?.activities}
                </p>
                <p>
                  <strong>Publications:</strong> {open.req?.publication}
                </p>
                <p>
                  <strong>Membership:</strong> {open.req?.membership}
                </p>
                <p>
                  <strong>Awards:</strong> {open.req?.awards}
                </p>
                <p>
                  <strong>References:</strong> {open.req?.references}
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => setOpen({ show: false, req: null })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Header />
      <div style={{ height: "200px" }} className="bg-gray-500"></div>

      <div className="h-[230px] w-[230px] rounded-full bg-white overflow-hidden -mt-32 mx-auto md:ml-[70px] md:-mt-[130px]">
        <img
          className="w-full h-full object-cover"
          src={me?.profile ? `${serverURL}/uploads/${me.profile}` : "https://cdn-icons-png.flaticon.com/512/3135/3135823.png"}
          alt="profile pic"
        />
      </div>
      <div className="flex flex-col md:flex-row px-5 md:px-20 mt-5 gap-4 md:gap-10">
        <p className="flex justify-center items-center">
          <span className="text-3xl">{me?.username || me?.name || (me?.email ? me.email.split('@')[0] : 'User')}</span>{" "}
          <FontAwesomeIcon icon={faCircleCheck} className="text-blue-500 ms-2" />
        </p>
        <EditProfile onUpdated={reloadMe} />
      </div>
      <p className="md:px-20 px-5 my-5 text-justify">
        {me?.bio || "Add your bio from Edit to show it here."}
      </p>

      {/* Role gating: show prompt unless reviewer/admin */}
      {(!token || !isReviewer) ? (
        <div className="p-10 my-20 shadow rounded">
          <div className="flex justify-center items-center min-h-[40vh] flex-col gap-6 px-4 text-center">
            <p className="text-2xl">Reviewer access required to view this panel.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
              <div className="bg-gray-100 p-6 rounded shadow">Login to review papers</div>
              <div className="bg-gray-100 p-6 rounded shadow">Login to manage requests</div>
              <div className="bg-gray-100 p-6 rounded shadow">Login to publish research</div>
            </div>
          </div>
        </div>
      ) : (
      <div className="px-3 md:px-20">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center items-center my-5 gap-2 md:gap-0 px-1 md:px-0">
          <p onClick={()=>{setPublishStatus(true);setStatusStatus(false);setContributionStatus(false);setReviewerStatus(false);setUserStatus(false)}} className={ publishStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>
            Publish Research
          </p>
          <p onClick={()=>{setPublishStatus(false);setStatusStatus(true);setContributionStatus(false);setReviewerStatus(false);setUserStatus(false)}} className={ statusStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>
            Publish Status
          </p>
          <p onClick={()=>{setPublishStatus(false);setStatusStatus(false);setContributionStatus(true);setReviewerStatus(false);setUserStatus(false)}} className={ contributionStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>
            Contributions
          </p>
          <p onClick={()=>{setPublishStatus(false);setStatusStatus(false);setContributionStatus(false);setReviewerStatus(true);setUserStatus(false)}} className={ reviewerStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>
            Review
          </p>
          <p onClick={()=>{setPublishStatus(false);setStatusStatus(false);setContributionStatus(false);setReviewerStatus(false);setUserStatus(true)}} className={ userStatus ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer" : "p-4 text-black border-b border-gray-200" }>
            Reviewer Status Request
          </p>
        </div>
        {publishStatus && (
          <div className="bg-gray-200 p-10 mt-20 mb-20 rounded">
            <ToastContainer position="top-right" />
            <h1 className="text-center text-3xl font-medium">Publish Research</h1>
            <div className="md:grid grid-cols-2 mt-5 w-full">
              <div>
                <div className="mb-3">
                  <textarea value={paperData.title} rows={5} placeholder="Title" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,title:e.target.value})} />
                </div>
                <div className="mb-3">
                  <textarea value={paperData.author} rows={3} placeholder="Author" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,author:e.target.value})} />
                </div>
                <div className="mb-3">
                  <textarea value={paperData.genre} rows={2} placeholder="Genre" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,genre:e.target.value})} />
                </div>
                <div className="mb-3 grid grid-cols-3 gap-3">
                  <input value={paperData.year} placeholder="Year" className="p-2 bg-white rounded w-full" type="number" onChange={(e)=>setPaperData({...paperData,year:e.target.value})} />
                  <input value={paperData.type} placeholder="Type" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,type:e.target.value})} />
                  <input value={paperData.publisher} placeholder="Publisher" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,publisher:e.target.value})} />
                </div>
                <div className="mb-3">
                  <textarea value={paperData.abstract} rows={5} placeholder="Abstract" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,abstract:e.target.value})} />
                </div>
                <div className="mb-3">
                  <textarea value={paperData.content} rows={8} placeholder="Main Content" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,content:e.target.value})} />
                </div>
                <div className="mb-3">
                  <input value={paperData.email} readOnly placeholder="Email" className="p-2 bg-gray-100 rounded w-full cursor-not-allowed" />
                </div>
                <div className="mb-3">
                  <textarea value={paperData.id} rows={2} placeholder="Id (optional)" className="p-2 bg-white rounded w-full" onChange={(e)=>setPaperData({...paperData,id:e.target.value})} />
                </div>
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
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button onClick={handleReset} className="bg-amber-500 rounded px-3 py-2 text-sm md:px-4 md:py-2 md:text-base">Reset</button>
              <button onClick={handlePublish} className="bg-green-500 rounded text-white px-3 py-2 text-sm md:px-4 md:py-2 md:text-base sm:ms-2">Submit</button>
            </div>
          </div>
        )}

        {reviewerStatus && (
          <div className="p-10 my-20 shadow rounded">
            <ToastContainer position="top-right" />
            <div className="bg-gray-100 p-4 rounded">
              <div className="flex flex-col w-full mt-4 space-y-4">
                {feed.length === 0 && (
                  <p className="text-center text-gray-600">No papers to review.</p>
                )}
                {feed.map((p, idx) => (
                  <div key={p.id || idx} className="bg-gray-200 w-full p-3 rounded">
                    <h2 className="text-lg font-semibold">{p.title}</h2>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${p.adminApproved ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}
                      >
                        {p.adminApproved ? "Admin Approved" : "Pending Approval"}
                      </span>
                    </div>
                    <p className="text-sm">{p.author}</p>
                    <p className="text-sm">Genre: {p.genre}</p>
                    <p className="text-sm">
                      {p.title}
                      {p.title ? " | " : ""}
                      {p.year || ""}
                      {p.year ? " | " : ""}
                      {p.type || ""}
                      {p.type ? " | " : ""}
                      {p.publisher || ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                      <button
                        onClick={() => handleToggleReview(idx)}
                        className="flex items-center gap-2 text-blue-600"
                      >
                        <FontAwesomeIcon icon={faChevronDown} />
                        Abstract
                      </button>
                      {p.pdf && (
                        <a
                          className="flex items-center gap-2 md:gap-2 text-blue-700 hover:text-blue-900"
                          href={p.pdf ? `${serverURL}/uploads/${p.pdf}` : "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FontAwesomeIcon icon={faFileArrowDown} />
                          <span>Download Abstract</span>
                        </a>
                      )}
                    </div>
                    {expandedReviewIndex === idx && (
                      <div className="mt-2 bg-gray-300 p-3 text-sm rounded">{p.abstract}</div>
                    )}
                    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mt-4 mb-2">
                      <button
                        className="bg-blue-700 text-white py-2 px-3 text-sm md:text-base shadow hover:border hover:border-blue-700 hover:text-blue-700 hover:bg-white"
                        onClick={() => navigate("/review-view", { state: { paper: p } })}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {statusStatus && (
          <div className="p-10 my-20 shadow rounded">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 mb-4">
              <h2 className="text-2xl font-semibold">Publish Status</h2>
              <button onClick={async()=>{try{const t=getToken();const d=t?jwtDecode(t):null;const mail=d?.userMail || paperData.email; if(!mail) return; const r=await getUserPapersApi(mail); if(r?.status===200) setUserPapers(r.data||[]); const s=await getUserPaperStatusesApi(mail); if(s?.status===200) setStatusesMap(s.data||{});}catch(error){console.error("Error:", error);}}} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button>
            </div>
            <div className="flex flex-col w-full mt-10 md:mt-0 space-y-4">
              {userPapers.filter(p=>!p.adminApproved).length === 0 && (
                <p className="text-center text-gray-600">No submissions yet.</p>
              )}
              {userPapers.filter(p=>!p.adminApproved).map((p, idx) => {
                const s = statusesMap[p.id] || {};
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
                    <p className="text-sm">
                      {p.title}
                      {p.title ? " | " : ""}
                      {p.year || ""}
                      {p.year ? " | " : ""}
                      {p.type || ""}
                      {p.type ? " | " : ""}
                      {p.publisher || ""}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => setStatusExpandedIndex(statusExpandedIndex === idx ? null : idx)}
                        className="flex items-center gap-2 hover:text-gray-700 focus:outline-none"
                      >
                        <FontAwesomeIcon icon={statusExpandedIndex === idx ? faChevronUp : faChevronDown} />
                        <span>Abstract</span>
                      </button>
                    </div>
                    {statusExpandedIndex === idx && (
                      <div className="mt-2 bg-gray-200 p-3 text-sm rounded">{p.abstract}</div>
                    )}
                    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mt-4 mb-2">
                      <button className={`py-2 px-3 shadow rounded border text-sm md:text-base ${isPending ? 'bg-blue-700 text-white border-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>Pending for review</button>
                      <button className={`py-2 px-3 shadow rounded border text-sm md:text-base ${isAccepted ? 'bg-green-700 text-white border-green-700' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>Accepted</button>
                      <button className={`py-2 px-3 shadow rounded border text-sm md:text-base ${isSuggest ? 'bg-yellow-500 text-black border-yellow-500 animate-pulse cursor-pointer' : 'bg-gray-100 text-gray-700 border-gray-300 cursor-default'}`} onClick={isSuggest ? ()=>setSuggestionModal({ open:true, text: s.text || 'No suggestions provided yet.' }) : undefined}>Suggested Improvement</button>
                      <button className={`py-2 px-3 shadow rounded border text-sm md:text-base ${isRejected ? 'bg-red-700 text-white border-red-700 animate-pulse cursor-pointer' : 'bg-gray-100 text-gray-700 border-gray-300 cursor-default'}`} onClick={isRejected ? ()=>setSuggestionModal({ open:true, text: s.text || 'No reviewer notes.' }) : undefined}>Rejected</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

        {contributionStatus && (
          <div className="p-10 my-20 shadow rounded">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 mb-4"><h2 className="text-2xl font-semibold">Contributions</h2><button onClick={async()=>{try{const t=getToken();const d=t?jwtDecode(t):null;const mail=d?.userMail || paperData.email; if(!mail) return; const r=await getUserPapersApi(mail); if(r?.status===200) setUserPapers(r.data||[]); const s=await getUserPaperStatusesApi(mail); if(s?.status===200) setStatusesMap(s.data||{});}catch(error){console.error("Error:", error);}}} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button></div>
            <div className="bg-gray-100 p-4 rounded">
              <div className="flex flex-col w-full mt-4 md:mt-0 space-y-4">
                {userPapers.filter(p=>p.adminApproved===true).length === 0 && (
                  <p className="text-center text-gray-600">No contributions yet.</p>
                )}
                {userPapers.filter(p=>p.adminApproved===true).map((p, idx) => (
                    <div key={p._id || idx} className="bg-gray-200 w-full p-3 rounded">
                      <button onClick={()=>navigate('/review-view', { state: { paper: p } })} className="text-left text-lg font-semibold text-blue-700 hover:underline">{p.title}</button>
                      <p className="text-sm text-gray-700">{p.author}</p>
                      <p className="text-sm">Genre: {p.genre}</p>
                      <p className="text-sm">
                        {p.title}
                        {p.title ? " | " : ""}
                        {p.year || ""}
                        {p.year ? " | " : ""}
                        {p.type || ""}
                        {p.type ? " | " : ""}
                        {p.publisher || ""}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                        <button
                          onClick={() => setExpandedContribIndex(expandedContribIndex === idx ? null : idx)}
                          className="flex items-center gap-2 hover:text-gray-700 focus:outline-none"
                        >
                          <FontAwesomeIcon icon={expandedContribIndex === idx ? faChevronUp : faChevronDown} />
                          <span>Abstract</span>
                        </button>
                        <a
                          className="flex items-center gap-2 text-blue-700 hover:text-blue-900"
                          href={p.pdf ? `${serverURL}/uploads/${p.pdf}` : "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FontAwesomeIcon icon={faFileArrowDown} />
                          <span>Download Abstract</span>
                        </a>
                        <button onClick={async()=>{try{const t=getToken();const reqHeader={Authorization:`Bearer ${t}`};const r=await deletePaperApi(p.id,reqHeader);if(r?.status===200){toast.success('Deleted');setUserPapers(list=>list.filter(x=>x.id!==p.id));}else toast.error(r?.data||'Delete failed');}catch(error){console.error("Error:", error); toast.error('Delete failed')}}} className="flex items-center gap-2 text-red-600 hover:text-red-700"><FontAwesomeIcon icon={faTrash} /><span>Delete</span></button>
                      </div>
                      {expandedContribIndex === idx && (
                        <div className="mt-2 bg-gray-300 p-3 text-sm rounded">{p.abstract}</div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {userStatus && (
          <div className="p-6 mt-10 bg-white rounded shadow mb-10">
            <ReviewerRequestsSection />
          </div>
        )}
      </div>
      )}

      <Footer />
    </>
  );
};

export default Profile;
