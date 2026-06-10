import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import AppFooter from '../components/AppFooter';

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const handleSignIn = async () => {
    if (!email || !password) {
      return setErr("All fields are required")
    }
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signin`, {
        email, password
      }, { withCredentials: true })
      dispatch(setUserData(result.data))
      setErr("")
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message || "Sign in failed")
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
        email: result.user.email,
        fullName: result.user.displayName,
      }, { withCredentials: true })
      dispatch(setUserData(data))
      setErr("")
    } catch (error) {
      console.log(error)
      setErr(error?.response?.data?.message || "Google authentication failed")
    }
  }

  return (
    <div className="page-shell flex flex-col items-center px-4 py-10">
      <div className="grid mt-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-100 bg-white/85 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-8 py-10 sm:px-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">Pickify</p>
          <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">Welcome back to smoother grocery shopping.</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Sign in to manage your orders, explore neighborhood stores, and keep your pantry stocked with a premium customer experience.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fast checkout</p>
              <p className="mt-2 text-sm font-bold text-slate-800">Secure payments and quick delivery updates</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Local stores</p>
              <p className="mt-2 text-sm font-bold text-slate-800">Fresh essentials curated in your city</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          <div className="mx-auto max-w-md">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sign in</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Access your account</h2>
            <p className="mt-2 text-sm text-slate-500">Use your email or continue with Google.</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="form-label">Password</label>
                  <span onClick={() => navigate('/forgot-password')} className="cursor-pointer text-[11px] font-black text-emerald-700">
                    Forgot Password?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input pr-11"
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
                  </button>
                </div>
              </div>

              {err && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-center text-xs font-bold text-rose-600">
                  {err}
                </div>
              )}

              <button onClick={handleSignIn} disabled={loading} className="primary-btn w-full py-3 text-sm">
                {loading ? <ClipLoader size={16} color="white" /> : 'Sign In'}
              </button>

              <button onClick={handleGoogleAuth} className="secondary-btn w-full py-3 text-sm">
                <FcGoogle size={18} />
                Continue with Google
              </button>

              <p className="pt-2 text-center text-sm text-slate-500">
                New to Pickify?{' '}
                <span onClick={() => navigate('/signup')} className="cursor-pointer font-black text-emerald-700">
                  Create account
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 w-full max-w-5xl">
        <AppFooter />
      </div>
    </div>
  )
}

export default SignIn
