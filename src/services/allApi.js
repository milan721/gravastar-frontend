import { commonAPI } from "./commonApi";
import { serverURL } from "./serverURL";

// ---------- AUTH ----------
export const registerAPI = async (reqBody) => {
  return await commonAPI("POST", `${serverURL}/register`, reqBody);
};

export const loginAPI = async (reqBody) => {
  return await commonAPI("POST", `${serverURL}/login`, reqBody);
};

export const googleLoginAPI = async (reqBody) => {
  return await commonAPI("POST", `${serverURL}/google-login`, reqBody);
};

// ---------- PUBLISH PAPER ----------
export const publishPaperAPI = async (reqBody, reqHeader) => {
  return await commonAPI(
    "POST",
    `${serverURL}/publish-paper`, // ✅ FIXED
    reqBody,
    reqHeader
  );
};

// ---------- REVIEWER REQUEST ----------
export const reviewerRequestAPI = async (reqBody, reqHeader) => {
  return await commonAPI(
    "POST",
    `${serverURL}/reviewer-request`,
    reqBody,
    reqHeader
  );
};

// ---------- REVIEWER: LIST REVIEWER REQUESTS ----------
export const getReviewerRequestsApi = async (reqHeader) => {
  return await commonAPI(
    "GET",
    `${serverURL}/reviewer/review-requests`,
    "",
    reqHeader
  );
};

// ---------- REVIEWER: APPROVE REVIEWER REQUEST ----------
export const reviewerApproveRequestApi = async (id, reqHeader) => {
  return await commonAPI(
    "POST",
    `${serverURL}/reviewer/review-requests/${id}/approve`,
    {},
    reqHeader
  );
};

// ---------- REVIEWER: DELETE REVIEWER REQUEST ----------
export const reviewerDeleteRequestApi = async (id, reqHeader) => {
  return await commonAPI(
    "DELETE",
    `${serverURL}/reviewer/review-requests/${id}`,
    {},
    reqHeader
  );
};

// ---------- SUGGESTION ----------
export const suggestImproveAPI = async (reqBody, reqHeader) => {
  return await commonAPI(
    "POST",
    `${serverURL}/suggest-improve`,
    reqBody,
    reqHeader
  );
};

// ---------- GET USER PAPERS ----------
export const getUserPapersApi = async (email) => {
  return await commonAPI(
    "GET",
    `${serverURL}/user-papers/${email}`,
    ""
  );
};

// ---------- GET ALL PAPERS ----------
export const getAllPapersApi = async () => {
  return await commonAPI(
    "GET",
    `${serverURL}/all-papers`,
    ""
  );
};

// ---------- DELETE PAPER ----------
export const deletePaperApi = async (id, reqHeader) => {
  return await commonAPI(
    "DELETE",
    `${serverURL}/paper/${id}`,
    {},
    reqHeader
  );
};

// ---------- REVIEWER FEED ----------
export const getReviewFeedApi = async (expertise, reqHeader) => {
  const q = expertise ? `?expertise=${encodeURIComponent(expertise)}` : "";
  return await commonAPI(
    "GET",
    `${serverURL}/review-feed${q}`,
    "",
    reqHeader
  );
};

// ---------- SUBMIT REVIEW DECISION ----------
export const submitReviewDecisionApi = async (paperId, reqBody, reqHeader) => {
  return await commonAPI(
    "POST",
    `${serverURL}/review/${paperId}`,
    reqBody,
    reqHeader
  );
};

// ---------- REVIEWER: MY STATUSES ----------
export const getMyReviewStatusesApi = async (reqHeader) => {
  return await commonAPI(
    "GET",
    `${serverURL}/review-status/me`,
    "",
    reqHeader
  );
};

// ---------- USER: PAPER STATUSES ----------
export const getUserPaperStatusesApi = async (email) => {
  return await commonAPI(
    "GET",
    `${serverURL}/review-status/user/${email}`,
    ""
  );
};

// ---------- ADMIN: USERS ----------
export const getAdminUsersApi = async (reqHeader) => {
  return await commonAPI(
    "GET",
    `${serverURL}/admin/users`,
    "",
    reqHeader
  );
};

// ---------- ADMIN: REVIEWERS ----------
export const getAdminReviewersApi = async (reqHeader) => {
  return await commonAPI(
    "GET",
    `${serverURL}/admin/reviewers`,
    "",
    reqHeader
  );
};

// ---------- ADMIN: APPROVE PAPER ----------
export const adminApprovePaperApi = async (paperId, reqHeader) => {
  return await commonAPI(
    "POST",
    `${serverURL}/admin/papers/${paperId}/approve`,
    {},
    reqHeader
  );
};

// ---------- ADMIN: LIST ACCEPTED PAPERS ----------
export const adminListAcceptedPapersApi = async (reqHeader) => {
  return await commonAPI(
    "GET",
    `${serverURL}/admin/review-accepted`,
    "",
    reqHeader
  );
};

// ---------- ADMIN: LIST REJECTED PAPERS ----------
export const adminListRejectedPapersApi = async (reqHeader) => {
  return await commonAPI(
    "GET",
    `${serverURL}/admin/review-rejected`,
    "",
    reqHeader
  );
};

// ---------- ADMIN: DELETE USER ----------
export const adminDeleteUserApi = async (id, reqHeader) => {
  return await commonAPI(
    "DELETE",
    `${serverURL}/admin/users/${id}`,
    {},
    reqHeader
  );
};

// ---------- ADMIN: UPGRADE USER ROLE ----------
export const adminUpgradeUserApi = async (id, role, reqHeader) => {
  return await commonAPI(
    "POST",
    `${serverURL}/admin/users/${id}/upgrade`,
    { role },
    reqHeader
  );
};

// ---------- ADMIN: DELETE REVIEWER ----------
export const adminDeleteReviewerApi = async (id, reqHeader) => {
  return await commonAPI(
    "DELETE",
    `${serverURL}/admin/reviewers/${id}`,
    {},
    reqHeader
  );
};

// ---------- USER PROFILE ----------
export const getMeApi = async (reqHeader) => {
  return await commonAPI(
    "GET",
    `${serverURL}/me`,
    "",
    reqHeader
  );
};

export const editUserProfileApi = async (reqBody, reqHeader) => {
  return await commonAPI(
    "POST",
    `${serverURL}/edit-user-profile`,
    reqBody,
    reqHeader
  );
};
