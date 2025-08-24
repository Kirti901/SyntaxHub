import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api_base_url } from '../helper';
import logo from "../Logos/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch(api_base_url + "/login", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        pwd: pwd
      })
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", true);
        window.location.href = "/";
      } else {
        toast.error(data.msg);
      }
    })
    .catch(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <form
        onSubmit={submitForm}
        className="w-full max-w-md bg-[#0f0e0e]/90 p-8 rounded-2xl shadow-2xl border border-gray-800 backdrop-blur-sm"
        autoComplete="off"
      >
        <div className="flex justify-center mb-6">
          <img className="w-48 object-cover" src={logo} alt="SyntaxHub Logo" />
        </div>

        <div className="mb-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-black/40 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            autoComplete="new-email"
          />
        </div>

        <div className="mb-6 relative">
          <input
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-black/40 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 transition"
            autoComplete="new-password"
          />
          <span
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white select-none"
            aria-label={showPwd ? "Hide password" : "Show password"}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPwd(!showPwd) }}
          >
            {showPwd ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        
        <p className="text-gray-400 text-sm mb-6">
          Don't have an account?{" "}
          <Link to="/signUp" className="text-blue-400 hover:underline font-medium">
            Sign Up
          </Link>
        </p>

  
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
