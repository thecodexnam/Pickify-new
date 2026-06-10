import axios from 'axios';
import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { ClipLoader } from 'react-spinners';
import AppFooter from '../components/AppFooter';

function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [err, setErr] = useState("")
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async () => {
    if (!email) return setErr("Email is required");
    setLoading(true)
    try {
      await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true })
      setErr("")
      setStep(2)
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message || "Failed to send OTP")
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) return setErr("OTP is required");
    setLoading(true)
    try {
      await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true })
      setErr("")
      setStep(3)
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message || "Invalid OTP")
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return setErr("All fields are required")
    }
    if (newPassword !== confirmPassword) {
      return setErr("Passwords do not match")
    }
    setLoading(true)
    try {
      await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true })
      setErr("")
      setLoading(false)
      navigate("/signin")
    } catch (error) {
      setErr(error?.response?.data?.message || "Reset password failed")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 bg-gradient-to-br from-[#f4fbf7] via-[#fafdfc] to-[#fffcfb] animate-fade-in">
      <div className="mt-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-green-900/5 w-full max-w-md p-8 border border-gray-100/50 hover:shadow-2xl transition-all duration-300">
        
        {/* Back navigation & Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/signin")}
            className="p-1.5 rounded-full hover:bg-green-50 text-[#00b252] transition cursor-pointer"
          >
            <IoIosArrowRoundBack size={28} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-800">Forgot Password</h1>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Step {step} of 3</p>
          </div>
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Enter the email address associated with your Pickify Grocery account, and we'll send you a 4-digit verification code.
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
              <input
                type="email"
                className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 rounded-2xl px-4 py-2.5 text-xs outline-none bg-gray-50/50 focus:bg-white transition-all font-semibold text-gray-800"
                placeholder="Enter your Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
            
            {err && (
              <p className="text-center text-xs font-bold text-red-500 my-2 bg-red-50 py-2 rounded-xl border border-red-100 animate-shake">
                {err}
              </p>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-[#00b252] hover:bg-green-600 text-white font-bold py-3 rounded-2xl shadow-md shadow-green-100 hover:shadow-lg transition cursor-pointer active:scale-[0.98] flex items-center justify-center text-xs uppercase tracking-wider mt-4"
            >
              {loading ? <ClipLoader size={16} color="white" /> : "Send OTP Code"}
            </button>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              We have sent a verification code to <strong className="text-gray-700">{email}</strong>. Please check your inbox and enter the OTP below.
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Verification Code</label>
              <input
                type="text"
                className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 rounded-2xl px-4 py-2.5 text-xs outline-none bg-gray-50/50 focus:bg-white transition-all font-semibold text-gray-800 text-center tracking-widest font-mono"
                placeholder="0 0 0 0"
                maxLength={4}
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                required
              />
            </div>

            {err && (
              <p className="text-center text-xs font-bold text-red-500 my-2 bg-red-50 py-2 rounded-xl border border-red-100 animate-shake">
                {err}
              </p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-[#00b252] hover:bg-green-600 text-white font-bold py-3 rounded-2xl shadow-md shadow-green-100 hover:shadow-lg transition cursor-pointer active:scale-[0.98] flex items-center justify-center text-xs uppercase tracking-wider mt-4"
            >
              {loading ? <ClipLoader size={16} color="white" /> : "Verify Code"}
            </button>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Your email has been verified successfully. Please choose a strong new password below to reset your credentials.
            </p>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">New Password</label>
              <input
                type="password"
                className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 rounded-2xl px-4 py-2.5 text-xs outline-none bg-gray-50/50 focus:bg-white transition-all font-semibold text-gray-800"
                placeholder="Enter New Password"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 rounded-2xl px-4 py-2.5 text-xs outline-none bg-gray-50/50 focus:bg-white transition-all font-semibold text-gray-800"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
              />
            </div>

            {err && (
              <p className="text-center text-xs font-bold text-red-500 my-2 bg-red-50 py-2 rounded-xl border border-red-100 animate-shake">
                {err}
              </p>
            )}

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-[#00b252] hover:bg-green-600 text-white font-bold py-3 rounded-2xl shadow-md shadow-green-100 hover:shadow-lg transition cursor-pointer active:scale-[0.98] flex items-center justify-center text-xs uppercase tracking-wider mt-4"
            >
              {loading ? <ClipLoader size={16} color="white" /> : "Reset Password"}
            </button>
          </div>
        )}
      </div>
      <div className="mt-10 w-full max-w-5xl">
        <AppFooter />
      </div>
    </div>
  )
}

export default ForgotPassword
