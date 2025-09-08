import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api_base_url } from '../helper';

const ResetPassword = () => {
  const { token } = useParams();
  const [newPwd, setNewPwd] = useState("");
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    fetch(api_base_url + "/resetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPwd })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success("Password reset successful! You can now login.");
          navigate("/login");
        } else {
          toast.error(data.msg);
        }
      })
      .catch(() => toast.error("Error resetting password."));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleReset} className="bg-[#18181b] p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Set New Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPwd}
          onChange={(e) => setNewPwd(e.target.value)}
          required
          className="w-full px-4 py-3 mb-4 rounded-lg bg-black/40 text-white border border-gray-700"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 w-full"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;