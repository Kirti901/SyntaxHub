import React, { useState } from 'react';
import logo from "../Logos/logo.png"
import { Link, useNavigate } from 'react-router-dom';
import { api_base_url } from '../helper';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitForm = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch(api_base_url + "/signUp", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fullName, email, pwd })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem("fullName", fullName);
          toast.success("SignUp Successful");
          navigate("/login");
        } else {
          toast.error(data.msg);
        }
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <form
        onSubmit={submitForm}
        className="w-full max-w-md bg-[#0f0e0e]/90 p-8 rounded-2xl shadow-2xl border border-gray-800 backdrop-blur-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img className="w-48 object-cover" src={logo} alt="SyntaxHub Logo" />
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            placeholder="Full Name"
            required
            className="w-full px-4 py-3 rounded-lg bg-black/40 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-lg bg-black/40 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <input
            onChange={(e) => setPwd(e.target.value)}
            value={pwd}
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-lg bg-black/40 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          />
          <span
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white select-none"
          >
            {showPwd ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>

        {/* Link to Login */}
        <p className="text-gray-400 text-sm mb-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>

        {/* Submit Button */}
        <button
          className="w-full py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
