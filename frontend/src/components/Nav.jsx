import React, { useEffect, useRef, useState } from 'react'
import { FaLocationDot, FaPlus, FaChevronDown, FaStore } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { serverUrl } from '../App';
import { clearCartState, setSearchItems, setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

function Nav() {
  const { userData, currentCity, cartItems, myOrders } = useSelector(state => state.user)
  const { myShopData } = useSelector(state => state.owner)
  const [showInfo, setShowInfo] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [query, setQuery] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowInfo(false)
      }
    }
    if (showInfo) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showInfo])

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
      dispatch(clearCartState())
      dispatch(setUserData(null))
      navigate("/signin")
    } catch (error) {
      console.log(error)
    }
  }

  const handleSearchItems = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true })
      dispatch(setSearchItems(result.data.items || []))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (query) {
      handleSearchItems()
    } else {
      dispatch(setSearchItems(null))
    }
  }, [query])

  const getInitials = (name) => {
    if (!name) return "US";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  return (
    <header className="w-full fixed top-0 left-0 z-[9999] border-b border-white/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        <div
          className="flex min-w-0 cursor-pointer items-center gap-3"
          onClick={() => navigate("/")}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00b252] to-[#10b981] text-white shadow-lg shadow-emerald-200">
            <FaStore size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Pickify</p>
            <h1 className="text-sm font-black tracking-tight text-slate-900 sm:text-base">
              Fresh groceries, better every day
            </h1>
          </div>
        </div>

        {userData?.role === "user" && (
          <>
            <div className="hidden md:flex w-full max-w-[520px] items-center rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
              <div className="flex min-w-[150px] items-center gap-2 border-r border-slate-200 pr-3">
                <FaLocationDot className="text-amber-500" />
                <span className="truncate text-xs font-bold text-slate-700">{currentCity || "Select city"}</span>
                <FaChevronDown className="text-[10px] text-slate-400" />
              </div>
              <div className="flex flex-1 items-center gap-2 pl-3">
                <IoIosSearch className="text-slate-400" />
                <input
                  type="text"
                  value={query}
                  placeholder="Search merchants, fresh produce, essentials"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {showMobileSearch && (
              <div className="absolute left-0 top-20 flex w-full border-b border-slate-100 bg-white px-4 py-4 shadow-lg md:hidden">
                <div className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                  <FaLocationDot className="text-amber-500" />
                  <input
                    type="text"
                    value={query}
                    autoFocus
                    placeholder="Search groceries"
                    className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {userData?.role === "user" && (
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="rounded-full p-2 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 md:hidden"
            >
              {showMobileSearch ? <RxCross2 size={20} /> : <IoIosSearch size={22} />}
            </button>
          )}

          {userData?.role === "owner" ? (
            <>
              <button
                onClick={() => navigate("/my-orders")}
                className="relative rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 sm:px-4"
              >
                <span className="mr-1">₹</span>
                My Orders
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
                  {myOrders?.length || 0}
                </span>
              </button>
              {myShopData && (
                <button
                  onClick={() => navigate("/add-item")}
                  className="primary-btn px-3 py-2 text-[11px] sm:px-4"
                >
                  <FaPlus size={12} />
                  Add Item
                </button>
              )}
            </>
          ) : userData?.role === "user" ? (
            <>
              <button
                onClick={() => navigate("/cart")}
                className="relative rounded-full p-2.5 text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                <FiShoppingCart size={20} />
                {cartItems?.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white">
                    {cartItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/my-orders")}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 sm:px-4"
              >
                <span className="mr-1">₹</span>
                My Orders
              </button>
            </>
          ) : null}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowInfo((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#00b252] to-[#10b981] text-sm font-black text-white shadow-lg shadow-emerald-200"
            >
              {getInitials(userData?.fullName)}
            </button>

            {showInfo && (
              <div className="animate-rise absolute right-0 mt-3 w-56 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Logged in as</p>
                <h4 className="mt-2 text-sm font-black text-slate-900">{userData?.fullName}</h4>
                <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                {userData?.role === "owner" ? "Shop Owner" : userData?.role === "deliveryBoy" ? "Delivery Partner" : userData?.role === "admin" ? "Admin" : "Customer"}
                </span>
                {userData?.role === "admin" && (
                  <button
                    onClick={() => {
                      setShowInfo(false)
                      navigate("/admin")
                    }}
                    className="mt-4 w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Admin Dashboard
                  </button>
                )}
                {userData?.role === "user" && (
                  <button
                    onClick={() => {
                      setShowInfo(false)
                      navigate("/my-orders")
                    }}
                    className="mt-4 w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    My Orders
                  </button>
                )}
                <button
                  onClick={handleLogOut}
                  className="mt-2 w-full rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Nav
