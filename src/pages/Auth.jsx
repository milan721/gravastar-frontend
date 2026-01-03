import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import Header from "../users/components/Header";
import Footer from "../components/Footer";
import { loginAPI, registerAPI, googleLoginAPI } from "../services/allApi";
import { setToken } from "../services/authStorage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const Auth = () => {
  const [register, setRegister] = useState(false);
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    password: "",
  });

  // ---------------- REGISTER ----------------
  // ---------------- REGISTER ----------------
const handleRegister = async () => {
  const { username, email, password } = userDetails;

  if (!username || !email || !password) {
    toast.info("Please fill all fields");
    return;
  }

  const result = await registerAPI({
    username,
    email,
    password,
    role: "user",
  });

  if (result.status === 200) {
    toast.success("Registration successful");
    setUserDetails({ username: "", email: "", password: "" });
    setRegister(false);
  } else if (result.status === 400) {
    toast.warning(result.response?.data || "Registration error");
  } else {
    toast.error("Registration failed");
  }
};

// ---------------- ROLE REDIRECT ----------------
const redirectByRole = (role) => {
  const path = role === "admin" ? "/admin-home" : role === "reviewer" ? "/review-home" : "/";
  try { sessionStorage.setItem('redirectToPath', path); } catch (error) { console.error("Error:", error); }
  navigate('/loading');
};

// ---------------- LOGIN ----------------
const handleLogin = async () => {
  const { email, password } = userDetails;

  if (!email || !password) {
    toast.info("Please fill all fields");
    return;
  }

  const result = await loginAPI({ email, password });

  if (result.status === 200) {
    toast.success("Login successful");

    const { existingUser, token } = result.data;

    sessionStorage.setItem("existingUser", JSON.stringify(existingUser));
    setToken(token);

    try { window.dispatchEvent(new Event('auth-change')); } catch (error) { console.error("Error:", error); }
    try { window.postMessage({ type: 'auth-change' }, '*'); } catch (error) { console.error("Error:", error); }

    redirectByRole(existingUser.role);

  } else if (result.status === 401 || result.status === 404) {
    toast.warning(result.response?.data || "Invalid credentials");
  } else {
    toast.error("Login failed");
  }
};

// ---------------- GOOGLE LOGIN ----------------
const handleGoogleLogin = async (credentialResponse) => {
  const details = jwtDecode(credentialResponse.credential);

  const result = await googleLoginAPI({
    username: details.name,
    email: details.email,
    password: "google_login_password",
  });

  if (result.status === 200) {
    toast.success("Google login successful");

    const { existingUser, token } = result.data;

    sessionStorage.setItem("existingUser", JSON.stringify(existingUser));
    setToken(token);

    try { window.dispatchEvent(new Event('auth-change')); } catch (error) { console.error("Error:", error); }
    try { window.postMessage({ type: 'auth-change' }, '*'); } catch (error) { console.error("Error:", error); }

    redirectByRole(existingUser.role);

  } else {
    toast.error("Google login failed");
  }
};

  return (
    <>
      <Header />

      <div
        id="authPage"
        className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-900 via-black to-gray-800"
      >
        <div className="flex justify-center items-center flex-col w-full">
          <h1 className="text-white mt-5 text-5xl">
            Gravastar {register ? "Register" : "Login"}
          </h1>

          <form
            className="w-full max-w-md my-6 p-10 flex flex-col justify-center items-center
            bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg"
          >
            <div
              style={{ width: "70px", height: "70px", borderRadius: "50%" }}
              className="border border-white flex justify-center items-center mb-4"
            >
              <FontAwesomeIcon icon={faUser} className="text-white fa-2x" />
            </div>

            {register && (
              <input
                value={userDetails.username}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, username: e.target.value })
                }
                type="text"
                placeholder="Username"
                className="p-3 mb-4 rounded bg-white/20 text-white w-full"
              />
            )}

            <input
              value={userDetails.email}
              onChange={(e) =>
                setUserDetails({ ...userDetails, email: e.target.value })
              }
              type="email"
              placeholder="Email"
              className="p-3 mb-4 rounded bg-white/20 text-white w-full"
            />

            <input
              value={userDetails.password}
              onChange={(e) =>
                setUserDetails({ ...userDetails, password: e.target.value })
              }
              type="password"
              placeholder="Password"
              className="p-3 mb-4 rounded bg-white/20 text-white w-full"
            />

            {register ? (
              <button
                type="button"
                onClick={handleRegister}
                className="bg-green-700 w-full p-3 rounded text-white"
              >
                REGISTER
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="bg-blue-700 w-full p-3 rounded text-white"
              >
                LOGIN
              </button>
            )}

            <>
              <p className="text-white my-4">----------- OR -----------</p>
              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => toast.error("Google Login Failed")}
                />
              ) : null}
            </>

            <p className="text-white mt-4 text-sm">
              {register ? "Already a user?" : "New user?"}{" "}
              <span
                onClick={() => setRegister(!register)}
                className="text-blue-300 cursor-pointer hover:underline"
              >
                {register ? "Login" : "Register"}
              </span>
            </p>
          </form>
        </div>
      </div>

      <ToastContainer theme="colored" position="top-center" autoClose={3000} />
      <Footer />
    </>
  );
};

export default Auth;
