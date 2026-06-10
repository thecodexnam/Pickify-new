import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from "react-spinners"
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import AppFooter from '../components/AppFooter';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("user")
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !mobile) {
      return setErr("All fields are required")
    }
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signup`, {
        fullName, email, password, mobile, role
      }, { withCredentials: true })
      dispatch(setUserData(result.data))
      setErr("")
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message || "Something went wrong")
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    if (!mobile) {
      return setErr("Mobile number is required for Google Sign Up")
    }

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
        fullName: result.user.displayName,
        email: result.user.email,
        role,
        mobile
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
      <div className="grid mt-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-100 bg-white/85 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-8 py-10 sm:px-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">Pickify</p>
          <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">Create your shopper or seller account.</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Join the platform to order fresh groceries, manage a shop, or deliver with confidence in a beautifully simple product experience.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'One account for shopping, selling, and delivery.',
              'Manage your local store presence and customer orders.',
              'Track every step of the order journey in real time.'
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white px-4 py-3 shadow-sm text-sm font-bold text-slate-800">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          <div className="mx-auto max-w-md">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Create account</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Set up your profile</h2>
            <p className="mt-2 text-sm text-slate-500">Fill in your details or continue with Google.</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Full Name</label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                  placeholder="Enter your full name"
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Email Address</label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Mobile Number</label>
                <input
                  type="tel"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                  placeholder="Enter your mobile number"
                  onChange={(e) => setMobile(e.target.value)}
                  value={mobile}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white"
                    placeholder="Create a strong password"
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

              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Select Role</p>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1">
                  {[
                    { key: 'user', label: 'Customer' },
                    { key: 'owner', label: 'Shop Owner' },
                    { key: 'deliveryBoy', label: 'Rider' },
                    { key: 'admin', label: 'Admin' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setRole(item.key)}
                      className={`rounded-xl px-2 py-2 text-[11px] font-black transition ${role === item.key ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {err && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-center text-xs font-bold text-rose-600">
                  {err}
                </div>
              )}

              <button onClick={handleSignUp} disabled={loading} className="primary-btn w-full py-3 text-sm">
                {loading ? <ClipLoader size={16} color="white" /> : 'Sign Up'}
              </button>

              <button onClick={handleGoogleAuth} className="secondary-btn w-full py-3 text-sm">
                <FcGoogle size={18} />
                Continue with Google
              </button>

              <p className="pt-2 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <span onClick={() => navigate('/signin')} className="cursor-pointer font-black text-emerald-700">
                  Sign In
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

export default SignUp
