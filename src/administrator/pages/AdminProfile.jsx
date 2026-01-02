import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/AdminHeader";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import EditProfile from "../components/AdminProfile";
import {
  faChevronDown,
  faChevronUp,
  faFileArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { publishPaperAPI, reviewerRequestAPI, getUserPapersApi, deletePaperApi, getUserPaperStatusesApi, getMeApi } from "../../services/allApi";
import { serverURL } from "../../services/serverURL";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [publishStatus, setPublishStatus] = useState(true);
  const [me, setMe] = useState(null);
  const [jwtEmail, setJwtEmail] = useState("");
  const [statusStatus, setStatusStatus] = useState(false);
  const [contributionStatus, setContributionStatus] = useState(false);
  const [reviewerStatus, setReviewerStatus] = useState(false);

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

  const [reviewerData, setReviewerData] = useState({
    name: "",
    location: "",
    university: "",
    info: "",
    email: "",
    summary: "",
    expertise: "",
    education: "",
    experience: "",
    activities: "",
    publication: "",
    membership: "",
    awards: "",
    references: "",
  });
  const [reviewerFiles, setReviewerFiles] = useState([]);
  const [reviewerFileKey, setReviewerFileKey] = useState(0);
  const [userPapers, setUserPapers] = useState([]);
  const [suggestionModal, setSuggestionModal] = useState({ open: false, text: "" });

  useEffect(() => {
    const run = async () => {
      try {
        const t = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
        if (!t) return;
        const decoded = jwtDecode(t);
        const mail = decoded?.userMail;
        if (!mail) return;
        setJwtEmail(mail);
        setPaperData((p) => ({ ...p, email: mail }));
        setReviewerData((r) => ({ ...r, email: r.email || mail }));

        const res = await getUserPapersApi(mail);
        if (res?.status === 200) setUserPapers(res.data || []);
        const st = await getUserPaperStatusesApi(mail);
        if (st?.status === 200) setStatusesMap(st.data || {});

        const reqHeader = { Authorization: `Bearer ${t}` };
        const meRes = await getMeApi(reqHeader);
        if (meRes?.status === 200) setMe(meRes.data);
      } catch (err) { console.error(err); }
    };
    run();
  }, []);

  const handlePdfChange = (e) => {
    setPdf(e.target.files[0]);
  };

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
    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }
    if (!pdf) {
      toast.error("Please upload a PDF file");
      return;
    }

    try {
      const formData = new FormData();
      const token = sessionStorage.getItem("token");
      const decoded = token ? jwtDecode(token) : null;
      const jwtEmail = decoded?.userMail || paperData.email;
      const genId = () => `P${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
      const idVal = (paperData.id && paperData.id.trim()) ? paperData.id.trim() : genId();

      Object.keys(paperData).forEach((key) => {
        if (key === "email") return;
        if (key === "id") { formData.append("id", idVal); return; }
        formData.append(key, paperData[key]);
      });
      formData.append("email", jwtEmail);
      formData.append("pdf", pdf);

      const reqHeader = { Authorization: `Bearer ${token}` };
      const result = await publishPaperAPI(formData, reqHeader);

      if (result.status === 200) {
        toast.success("Paper published successfully");
        handleReset();
        try {
          const mail = jwtEmail;
          if (mail) {
            const res = await getUserPapersApi(mail);
            if (res?.status === 200) setUserPapers(res.data);
            const st = await getUserPaperStatusesApi(mail);
            if (st?.status === 200) setStatusesMap(st.data || {});
          }
        } catch (err) { console.error(err); }
      } else {
        toast.error(result?.data || "Publish failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Publish failed");
    }
  };

  const handleReset = () => {
    setPaperData({
      id: "",
      title: "",
      author: "",
      genre: "",
      year: "",
      type: "",
      publisher: "",
      abstract: "",
      content: "",
      email: jwtEmail,
    });
    setPdf(null);
    setFileKey((k)=>k+1);
  };
  const [statusesMap, setStatusesMap] = useState({});

  const refreshUserData = async () => {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
      if (!token) return;
      const decoded = jwtDecode(token);
      const mail = decoded?.userMail || paperData.email;
      if (!mail) return;
      const res = await getUserPapersApi(mail);
      if (res?.status === 200) setUserPapers(res.data || []);
      const st = await getUserPaperStatusesApi(mail);
      if (st?.status === 200) setStatusesMap(st.data || {});
    } catch (err) { console.error(err); }
  };

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [statusExpandedIndex, setStatusExpandedIndex] = useState(null);

  const handleReviewerFiles = (e) => {
    setReviewerFiles(Array.from(e.target.files || []));
  };
  const handleReviewerSubmit = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.info("Please login to submit reviewer request");
      return;
    }
    try {
      const fd = new FormData();
      Object.entries(reviewerData).forEach(([k, v]) => fd.append(k, v));
      reviewerFiles.forEach((f) => fd.append("pdf", f));
      const reqHeader = { Authorization: `Bearer ${token}` };
      const res = await reviewerRequestAPI(fd, reqHeader);
      if (res.status === 200) {
        toast.success("Reviewer request submitted");
        setReviewerData({
          name: "", location: "", university: "", info: "", email: "",
          summary: "", expertise: "", education: "", experience: "",
          activities: "", publication: "", membership: "", awards: "", references: "",
        });
        setReviewerFiles([]);
      } else {
        toast.error(res?.data || "Submit failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("Submit failed");
    }
  };

  const handleDeletePaper = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const reqHeader = { Authorization: `Bearer ${token}` };
      const res = await deletePaperApi(id, reqHeader);
      if (res?.status === 200) {
        toast.success("Deleted");
        setUserPapers((list) => list.filter((p) => p.id !== id));
      } else {
        toast.error(res?.data || "Delete failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Delete failed");
    }
  };

  if (!sessionStorage.getItem("token")) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-3">
          <p className="text-xl">Please login to access your profile.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" />
      <Header />
      <div style={{ height: "200px" }} className="bg-gray-500"></div>

      <div
        className="bg-white overflow-hidden rounded-full h-[180px] w-[180px] md:h-[230px] md:w-[230px] mt-[-90px] md:mt-[-130px] mx-auto md:mx-0 md:ml-[70px]"
      >
        <img
          src={me?.profile ? `${serverURL}/uploads/${me.profile}` : "https://cdn-icons-png.flaticon.com/512/3135/3135823.png"}
          alt="profile pic"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: "50%" }}
        />
      </div>
      <div className="flex flex-col md:flex-row md:px-20 px-5 mt-5 gap-4 md:gap-10 items-start md:items-center justify-between">
        <p className="flex justify-center items-center">
          <span className="text-3xl">{me?.username || "User"}</span>{" "}
          <FontAwesomeIcon
            icon={faCircleCheck}
            className="text-blue-500 ms-2"
          />
        </p>
        <EditProfile />
      </div>
      <p className="md:px-20 px-5 my-5 text-justify">
        {me?.bio || ""}
        
      </p>

      <div className="md:px-20">
        <div className="flex flex-wrap justify-center items-center gap-2 my-5">
          <p onClick={()=>{setPublishStatus(true);setStatusStatus(false);setContributionStatus(false);setReviewerStatus(false)}}
            className={
              publishStatus
                ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer"
                : statusStatus
                ? "p-4 text-black border-b border-gray-200"
                : "p-4 text-black border-b border-gray-200"
            }
          >
            Publish Research
          </p>

          <p onClick={()=>{setPublishStatus(false);setStatusStatus(true);setContributionStatus(false);setReviewerStatus(false)}}
            className={
              publishStatus
                ? "p-4 text-black border-b border-gray-200"
                : statusStatus
                ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer"
                : "p-4 text-black border-b border-gray-200"
            }
          >
            Publish Status
          </p>

          <p onClick={()=>{setPublishStatus(false);setStatusStatus(false);setContributionStatus(true);setReviewerStatus(false)}}
            className={
              publishStatus
                ? "p-4 text-black border-b border-gray-200"
                : statusStatus
                ? "p-4 text-black border-b border-gray-200"
                : contributionStatus
                ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer"
                : "p-4 text-black border-b border-gray-200"
            }
          >
            Contributions
          </p>

          <p onClick={()=>{setPublishStatus(false);setStatusStatus(false);setContributionStatus(false);setReviewerStatus(true)}}
            className={
              reviewerStatus
                ? "p-4 text-blue-800 border border-t border-r border-gray-200 rounded cursor-pointer"
                : "p-4 text-black border-b border-gray-200"
            }
          >
            Become a Reviewer
          </p>
        </div>

        {publishStatus && (
          <div className="bg-gray-200 p-10 mt-20 mb-20 rounded">
            <h1 className="text-center text-3xl font-medium">Publish Research</h1>

            <div className="md:grid grid-cols-2 mt-5 w-full">
              <div>
                <div className="mb-3">
                    <textarea
                    value={paperData.title}
                    rows={5}
                    placeholder="Title"
                    className="p-2 bg-white rounded w-full"
                    onChange={(e) => setPaperData({ ...paperData, title: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                    <textarea
                    value={paperData.author}
                    rows={3}
                    placeholder="Author"
                    className="p-2 bg-white rounded w-full"
                    onChange={(e) => setPaperData({ ...paperData, author: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                    <textarea
                    value={paperData.genre}
                    rows={2}
                    placeholder="Genre"
                    className="p-2 bg-white rounded w-full"
                    onChange={(e) => setPaperData({ ...paperData, genre: e.target.value })}
                  />
                </div>

                <div className="mb-3 grid grid-cols-3 gap-3">
                  <input
                    value={paperData.year}
                    placeholder="Year"
                    className="p-2 bg-white rounded w-full"
                    type="number"
                    onChange={(e) => setPaperData({ ...paperData, year: e.target.value })}
                  />
                  <input
                    value={paperData.type}
                    placeholder="Type"
                    className="p-2 bg-white rounded w-full"
                    onChange={(e) => setPaperData({ ...paperData, type: e.target.value })}
                  />
                  <input
                    value={paperData.publisher}
                    placeholder="Publisher"
                    className="p-2 bg-white rounded w-full"
                    onChange={(e) => setPaperData({ ...paperData, publisher: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <textarea
                    value={paperData.abstract}
                    rows={5}
                    placeholder="Abstract"
                    className="p-2 bg-white rounded w-full"
                    onChange={(e) => setPaperData({ ...paperData, abstract: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <textarea
                    value={paperData.content}
                    rows={8}
                    placeholder="Main Content"
                    className="p-2 bg-white rounded w-full"
                    onChange={(e) => setPaperData({ ...paperData, content: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <input
                    value={paperData.email}
                    readOnly
                    placeholder="Email"
                    className="p-2 bg-gray-100 rounded w-full cursor-not-allowed"
                  />
                </div>

                <div className="mb-3">
                  <textarea
                    value={paperData.id}
                    rows={2}
                    placeholder="Id (optional)"
                    className="p-2 bg-white rounded w-full"
                    onChange={(e) => setPaperData({ ...paperData, id: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:mx-5">
                <div className="mb-3 flex flex-col justify-center items-center w-full mt-10">
                  <label htmlFor="pdfFile">
                    <input
                      key={fileKey}
                      type="file"
                      id="pdfFile"
                      style={{ display: "none" }}
                      accept="application/pdf"
                      onChange={handlePdfChange}
                    />
                    <img
                      src="https://png.pngtree.com/png-vector/20221016/ourmid/pngtree-upload-file-vector-single-icon-clipart-transparent-background-png-image_6318311.png"
                      alt="upload"
                      style={{ height: "200px", width: "200px" }}
                    />
                  </label>
                  <p className="text-center text-sm text-gray-600 mt-2">Please upload the abstract here.</p>
                  {pdf && (
                    <p className="text-center text-sm text-gray-800 mt-1">Selected: {pdf.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={handleReset}
                className="bg-amber-500 rounded p-3"
              >
                Reset
              </button>
              <button
                onClick={handlePublish}
                className="bg-green-500 rounded text-white p-3 ms-4"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {statusStatus && 
            <div className="p-10 my-20 shadow rounded">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Publish Status</h2>
                <button onClick={refreshUserData} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button>
              </div>
              <div className="flex flex-col w-full mt-6 md:mt-0 space-y-4">
                {userPapers.filter(p=>!p.adminApproved).length === 0 && (
                  <p className="text-center text-gray-600">No submissions yet.</p>
                )}
                {userPapers.filter((p)=> !p.adminApproved).map((p, idx) => {
                  const s = statusesMap[p.id] || {};
                  const stRaw = (s.decision || (p.adminApproved ? 'accept' : 'pending')).toLowerCase();
                  const st = stRaw === 'accept' ? 'accepted' : stRaw === 'reject' ? 'rejected' : stRaw === 'suggest' ? 'suggested' : stRaw;
                  const isPending = st === 'pending';
                  const isAccepted = st === 'accepted';
                  const isRejected = st === 'rejected';
                  const isSuggest = st === 'suggested';
                  return (
                    <div key={p._id} className="bg-gray-100 w-full p-3 rounded">
                      <h2 className="text-lg font-semibold">{p.title}</h2>
                      <p className="text-sm text-gray-700">{p.author}</p>
                      <p className="text-sm">Genre: {p.genre}</p>
                      <p className="text-sm">{p.title}{p.title ? " | " : ""}{p.year || ""}{p.year ? " | " : ""}{p.type || ""}{p.type ? " | " : ""}{p.publisher || ""}</p>
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
                      <div className="flex justify-center items-center gap-4 mt-4 mb-2 flex-wrap">
                        <button
                          className={`py-2 px-3 shadow rounded border ${isPending ? 'bg-blue-700 text-white border-blue-700' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                          style={isPending ? { backgroundColor: '#1d4ed8', color: '#ffffff', borderColor: '#1d4ed8' } : { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }}
                        >
                          Pending for review
                        </button>
                        <button
                          className={`py-2 px-3 shadow rounded border ${isAccepted ? 'bg-green-700 text-white border-green-700' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                          style={isAccepted ? { backgroundColor: '#15803d', color: '#ffffff', borderColor: '#15803d' } : { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }}
                        >
                          Accepted
                        </button>
                        <button
                          className={`py-2 px-3 shadow rounded border ${isSuggest ? 'bg-yellow-500 text-black border-yellow-500 animate-pulse cursor-pointer' : 'bg-gray-100 text-gray-700 border-gray-300 cursor-default'}`}
                          style={isSuggest ? { backgroundColor: '#f59e0b', color: '#111827', borderColor: '#f59e0b' } : { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }}
                          onClick={isSuggest ? () => setSuggestionModal({ open: true, text: s.text || 'No suggestions provided yet.' }) : undefined}
                        >
                          Suggested Improvement
                        </button>
                        <button
                          className={`py-2 px-3 shadow rounded border ${isRejected ? 'bg-red-700 text-white border-red-700 animate-pulse cursor-pointer' : 'bg-gray-100 text-gray-700 border-gray-300 cursor-default'}`}
                          style={isRejected ? { backgroundColor: '#b91c1c', color: '#ffffff', borderColor: '#b91c1c' } : { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' }}
                          onClick={isRejected ? () => setSuggestionModal({ open: true, text: s.text || 'No reviewer notes.' }) : undefined}
                        >
                          Rejected
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {suggestionModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded p-5 w-11/12 md:w-1/2">
                    <h3 className="text-xl font-semibold mb-3">Reviewer Feedback</h3>
                    <p className="mb-4 whitespace-pre-wrap">{suggestionModal.text}</p>
                    <div className="flex justify-end">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={()=>setSuggestionModal({ open:false, text:"" })}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>}

            {contributionStatus && <div className="p-10 my-20 shadow rounded">
              <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-semibold">Contributions</h2><button onClick={refreshUserData} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button></div>
              <div className="bg-gray-100 p-4 rounded">
                <div className="flex flex-col w-full mt-4 md:mt-0 space-y-4">
                  {userPapers.filter(p=>p.adminApproved===true).length === 0 && (
                    <p className="text-center text-gray-600">No contributions yet.</p>
                  )}
                  {userPapers
                    .filter((p) => p.adminApproved === true)
                    .map((p, idx) => (
                    <div key={p._id} className="bg-gray-200 w-full p-3 rounded">
                      <button
                        className="text-lg font-semibold text-blue-700 hover:underline text-left"
                        onClick={() => navigate('/admin-view', { state: { paper: p } })}
                      >
                        {p.title}
                      </button>
                      <p className="text-sm text-gray-700">{p.author}</p>
                      <p className="text-sm">Genre: {p.genre}</p>
                      <p className="text-sm">{p.title}{p.title ? " | " : ""}{p.year || ""}{p.year ? " | " : ""}{p.type || ""}{p.type ? " | " : ""}{p.publisher || ""}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <button
                          onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                          className="flex items-center gap-2 hover:text-gray-700 focus:outline-none"
                        >
                          <FontAwesomeIcon icon={expandedIndex === idx ? faChevronUp : faChevronDown} />
                          <span>Abstract</span>
                        </button>
                        <a className="flex items-center gap-2 hover:text-gray-700" href={p.pdf ? `${serverURL}/uploads/${p.pdf}` : '#'} target="_blank" rel="noreferrer">
                          <FontAwesomeIcon icon={faFileArrowDown} />
                          <span>Download Abstract</span>
                        </a>
                        <button onClick={() => handleDeletePaper(p.id)} className="flex items-center gap-2 text-red-600 hover:text-red-700">
                          <FontAwesomeIcon icon={faTrash} />
                          <span>Delete</span>
                        </button>
                      </div>
                      {expandedIndex === idx && (
                        <div className="mt-2 bg-gray-300 p-3 text-sm rounded">{p.abstract}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              </div>}

            {reviewerStatus && <div className="bg-gray-200 p-10 mt-20 mb-20 rounded">
                <h1 className="text-center text-3xl font-medium">Become a Reviewer</h1>
                <h3 className="text-center font-medium">Provide the required information below</h3>
                <div className="md:grid grid-cols-2 mt-5 w-full gap-5">
  <div className="">
    <div className="mb-3">
      <input value={reviewerData.name} onChange={(e)=>setReviewerData({ ...reviewerData, name: e.target.value })} placeholder="Full Name" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <input value={reviewerData.location} onChange={(e)=>setReviewerData({ ...reviewerData, location: e.target.value })} placeholder="Location" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <input value={reviewerData.university} onChange={(e)=>setReviewerData({ ...reviewerData, university: e.target.value })} placeholder="University" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <textarea rows={2} value={reviewerData.info} onChange={(e)=>setReviewerData({ ...reviewerData, info: e.target.value })} placeholder="Personal Information" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <textarea rows={3} value={reviewerData.summary} onChange={(e)=>setReviewerData({ ...reviewerData, summary: e.target.value })} placeholder="Professional Summary" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <input value={reviewerData.expertise} onChange={(e)=>setReviewerData({ ...reviewerData, expertise: e.target.value })} placeholder="Field of Expertise" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <textarea rows={2} value={reviewerData.education} onChange={(e)=>setReviewerData({ ...reviewerData, education: e.target.value })} placeholder="Education" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>
  </div>

  <div className="">
    <div className="mb-3">
      <textarea rows={2} value={reviewerData.experience} onChange={(e)=>setReviewerData({ ...reviewerData, experience: e.target.value })} placeholder="Professional Experience" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <textarea rows={2} value={reviewerData.activities} onChange={(e)=>setReviewerData({ ...reviewerData, activities: e.target.value })} placeholder="Editorial and Peer Review Activities" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <textarea rows={2} value={reviewerData.publication} onChange={(e)=>setReviewerData({ ...reviewerData, publication: e.target.value })} placeholder="Publications" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <textarea rows={2} value={reviewerData.membership} onChange={(e)=>setReviewerData({ ...reviewerData, membership: e.target.value })} placeholder="Professional Memberships" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <textarea rows={2} value={reviewerData.awards} onChange={(e)=>setReviewerData({ ...reviewerData, awards: e.target.value })} placeholder="Awards & Honors" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3">
      <textarea rows={2} value={reviewerData.references} onChange={(e)=>setReviewerData({ ...reviewerData, references: e.target.value })} placeholder="References" className="p-2 bg-white rounded placeholder-gray-400 w-full" />
    </div>

    <div className="mb-3 flex flex-col justify-center items-center w-full mt-5">
      <label htmlFor="cvFile" className="cursor-pointer">
        <input key={reviewerFileKey} type="file" id="cvFile" style={{ display: 'none' }} multiple onChange={handleReviewerFiles} />
        <img
          src="https://png.pngtree.com/png-vector/20221016/ourmid/pngtree-upload-file-vector-single-icon-clipart-transparent-background-png-image_6318311.png"
          alt="Upload CV"
          style={{ height: '200px', width: '200px' }}
        />
      </label>
      <p className="text-center text-sm text-gray-600 mt-2">Please upload your resume.</p>
      {reviewerFiles.length > 0 && (
        <p className="text-center text-sm text-gray-800 mt-1">Selected: {reviewerFiles.map(f=>f.name).join(', ')}</p>
      )}
    </div>
  </div>
</div>

                <div className="flex flex-wrap justify-end gap-2">
                  <button onClick={()=>{setReviewerData({name:"",location:"",university:"",info:"",email:"",summary:"",expertise:"",education:"",experience:"",activities:"",publication:"",membership:"",awards:"",references:""}); setReviewerFiles([]); setReviewerFileKey((k)=>k+1);}} className="bg-amber-500 rounded text-black p-3 hover:bg-white hover:border hover:border-amber-500 hover:text-amber-500">Reset</button>
                  <button onClick={handleReviewerSubmit} className="bg-green-500 rounded text-white p-3 hover:bg-white hover:border hover:border-green-500 hover:text-green-500 ms-4">Submit</button>
                </div>
                
                </div>}

      </div>

      <Footer />
    </>
  );
};

export default AdminProfile;
