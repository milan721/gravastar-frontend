import axios from "axios";

//  API function
export const commonAPI = async (httpRequest, url, reqBody = {}, reqHeader = {}) => {
  const reqConfig = {
    method: httpRequest,
    url,
    data: reqBody,
    headers: reqHeader,
  };

  try {
    const res = await axios(reqConfig);
    return res;
  } catch (err) {
    return err.response || err;
  }
};
