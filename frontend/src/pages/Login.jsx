import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api_base_url } from '../helper';
import logo from "../Logo/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
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

        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link to="/signUp" className="text-blue-400 hover:underline font-medium">
              Sign Up
            </Link>
          </p>
          <button
            type="button"
            className="text-blue-400 hover:underline text-sm"
            onClick={() => setShowForgot(true)}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>

      {/* Forgot Password  */}
      {showForgot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <form
            onSubmit={e => {
              e.preventDefault();
              fetch(api_base_url + "/requestPasswordReset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail })
              })
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    toast.success("Check your email for the reset link.");
                    setShowForgot(false);
                    setForgotEmail("");
                  } else {
                    toast.error(data.msg);
                  }
                })
                .catch(() => toast.error("Error sending reset email."));
            }}
            className="bg-[#18181b] p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-700"
          >
            <h2 className="text-xl font-bold text-white mb-4">Reset Password</h2>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              className="w-full px-4 py-3 mb-4 rounded-lg bg-black/40 text-white border border-gray-700"
            />
            <div className="flex justify-between">
              <button
                type="button"
                className="text-gray-400 hover:underline"
                onClick={() => setShowForgot(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;