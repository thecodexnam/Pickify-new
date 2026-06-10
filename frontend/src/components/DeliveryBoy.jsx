import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FaLocationCrosshairs, FaMoneyBillWave, FaMapLocationDot, FaReceipt, FaTruckMoving, FaChevronRight } from "react-icons/fa6";
import { MdOutlinePendingActions } from "react-icons/md";
import AppFooter from './AppFooter';

function DeliveryBoy() {
  const { userData, socket } = useSelector(state => state.user)
  const [currentOrder, setCurrentOrder] = useState()
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [availableAssignments, setAvailableAssignments] = useState(null)
  const [otp, setOtp] = useState("")
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!socket || userData.role !== "deliveryBoy") return
    let watchId
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        setDeliveryBoyLocation({ lat: latitude, lon: longitude })
        socket.emit('updateLocation', {
          latitude,
          longitude,
          userId: userData._id
        })
      },
      (error) => {
        console.log(error)
      },
      {
        enableHighAccuracy: true
      })
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }
  }, [socket, userData])

  const ratePerDelivery = 50
  const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0)

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true })
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true })
      setCurrentOrder(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const acceptOrder = async (assignmentId) => {
    try {
      await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { withCredentials: true })
      await getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    socket?.on('newAssignment', (data) => {
      setAvailableAssignments(prev => ([...prev, data]))
    })
    return () => {
      socket?.off('newAssignment')
    }
  }, [socket])

  const sendOtp = async () => {
    setLoading(true)
    try {
      await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id
      }, { withCredentials: true })
      setLoading(false)
      setShowOtpBox(true)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    setMessage("")
    try {
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id,
        otp
      }, { withCredentials: true })
      setMessage(result.data.message)
      setTimeout(() => {
        location.reload()
      }, 1000);
    } catch (error) {
      console.log(error)
    }
  }

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true })
      setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getAssignments()
    getCurrentOrder()
    handleTodayDeliveries()
  }, [userData])

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-[#f4fbf7] via-[#fafdfc] to-[#fffcfb] pb-16">
      <Nav />

      {/* Top Banner Alert */}
      <div className="w-full mt-20 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white text-xs font-semibold py-3 px-4 flex items-center justify-center gap-2 shadow-xs z-10">
        <span className="animate-pulse">🚴</span>
        <span>Welcome back, Partner! Stay safe on the road and deliver fresh groceries on time! 🌟</span>
      </div>

      <div className="w-full max-w-[850px] px-4 mt-8 flex flex-col gap-6 animate-fade-in">
        
        {/* 1. Partner Header & Coordinates Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#00b252]">
              <FaTruckMoving size={26} />
            </div>
            <div>
              <span className="bg-green-50 text-green-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-green-100 uppercase tracking-wide">
                Delivery Partner
              </span>
              <h1 className="text-xl font-black text-gray-800 mt-1">Welcome, {userData.fullName}</h1>
            </div>
          </div>

          {/* Location status coordinates */}
          <div className="flex flex-col items-end border-t md:border-t-0 border-gray-50 pt-4 md:pt-0 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <FaLocationCrosshairs className="text-green-500 animate-spin-slow" />
              <span>Gps Coordinates</span>
            </div>
            <p className="text-[12px] font-mono text-gray-600 mt-1 font-bold">
              Lat: <span className="text-gray-800">{deliveryBoyLocation?.lat?.toFixed(5) || "Searching..."}</span>
            </p>
            <p className="text-[12px] font-mono text-gray-600 mt-0.5 font-bold">
              Lon: <span className="text-gray-800">{deliveryBoyLocation?.lon?.toFixed(5) || "Searching..."}</span>
            </p>
          </div>
        </div>

        {/* 2. Today's Summary & Earnings row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Chart card (2/3 width) */}
          <div className="bg-white rounded-3xl shadow-xl p-5 border border-gray-100 md:col-span-2">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
              <h2 className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                <FaReceipt className="text-[#00b252]" />
                <span>Today's Deliveries</span>
              </h2>
            </div>

            <div className="w-full h-[200px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={todayDeliveries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [value, "orders"]} 
                    labelFormatter={label => `Time: ${label}:00`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  />
                  <Bar dataKey="count" fill="#00b252" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Earnings card (1/3 width) */}
          <div className="bg-gradient-to-tr from-green-500 to-emerald-600 rounded-3xl shadow-xl p-6 flex flex-col justify-between text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute right-[-20px] bottom-[-20px] text-white/10">
              <FaMoneyBillWave size={120} />
            </div>

            <div>
              <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 w-fit">
                Daily Earnings
              </span>
              <h3 className="text-sm font-bold text-green-50/80 mt-2">Today's Earnings</h3>
              <p className="text-xs text-green-100 mt-0.5">₹50 base rate per grocery delivery</p>
            </div>

            <div className="mt-8 relative z-10">
              <span className="text-4xl font-black">₹{totalEarning}</span>
              <p className="text-[10px] text-green-100/70 mt-1">Earnings are updated instantly upon OTP validation.</p>
            </div>
          </div>
        </div>

        {/* 3. Available Assignments (Displayed ONLY when NO Active Order) */}
        {!currentOrder && (
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100/50">
            <h2 className="text-base font-black text-gray-800 flex items-center gap-1.5 mb-4 border-b border-gray-50 pb-2">
              <MdOutlinePendingActions size={18} className="text-orange-500" />
              <span>Available Assignments</span>
            </h2>

            <div className="space-y-3.5">
              {!availableAssignments || availableAssignments.length === 0 ? (
                <div className="border border-dashed border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-gray-50/20">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
                    <FaMapLocationDot size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700">No active grocery delivery orders</h3>
                  <p className="text-xs text-gray-400 mt-1">Wait for nearby shop owners to assign new delivery runs.</p>
                </div>
              ) : (
                availableAssignments.map((a, index) => (
                  <div 
                    className="border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/10 hover:border-green-100 transition-all"
                    key={index}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">{a?.shopName}</span>
                        <span className="text-[9px] bg-green-50 text-green-700 font-extrabold px-2 py-0.5 rounded-full border border-green-100 uppercase">
                          Grocery Pickup
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        <strong className="text-gray-600">Delivery Address:</strong> {a?.deliveryAddress?.text}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {a.items?.length || 0} items | Value: <strong>₹{a.subtotal}</strong>
                      </p>
                    </div>
                    <button 
                      className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer active:scale-95 text-center"
                      onClick={() => acceptOrder(a.assignmentId)}
                    >
                      Accept Job
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. Current Order Details (Displayed when a Job is Active) */}
        {currentOrder && (
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100/50">
            <h2 className="text-base font-black text-gray-800 flex items-center gap-1.5 mb-4 border-b border-gray-50 pb-2">
              <FaMapLocationDot className="text-green-500" />
              <span>📦 Active Delivery Task</span>
            </h2>

            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/20 mb-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-700">{currentOrder?.shopOrder?.shop?.name}</h4>
                <span className="bg-orange-50 text-orange-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-orange-100 uppercase">
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                <strong className="text-gray-600">Customer Address:</strong> {currentOrder.deliveryAddress?.text}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {currentOrder.shopOrder?.shopOrderItems?.length || 0} items | Value: <strong>₹{currentOrder.shopOrder?.subtotal}</strong>
              </p>
            </div>

            {/* Delivery Map Tracking Component */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
              <DeliveryBoyTracking data={{ 
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData.location.coordinates[1],
                  lon: userData.location.coordinates[0]
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude
                }
              }} />
            </div>

            {/* OTP Verification & Complete controls */}
            {!showOtpBox ? (
              <button 
                className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                onClick={sendOtp} 
                disabled={loading}
              >
                {loading ? <ClipLoader size={18} color="white" /> : "Mark Order As Delivered"}
              </button>
            ) : (
              <div className="mt-6 p-5 border border-gray-100 rounded-2xl bg-gray-50/40">
                <p className="text-xs font-bold text-gray-700 mb-2">
                  Enter OTP sent to <span className="text-orange-500">{currentOrder.user?.fullName}</span>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    className="flex-1 border border-gray-200 px-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00b252]/10 focus:border-[#00b252] bg-white font-bold" 
                    placeholder="Enter 4-Digit OTP" 
                    onChange={(e) => setOtp(e.target.value)} 
                    value={otp}
                  />
                  <button 
                    className="bg-green-500 hover:bg-green-600 text-white py-2.5 px-6 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    onClick={verifyOtp}
                  >
                    Verify & Finish
                  </button>
                </div>

                {message && (
                  <p className="text-center text-xs font-bold text-green-600 mt-3 bg-green-50 py-1.5 rounded-lg border border-green-100">
                    {message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        <AppFooter />
      </div>
    </div>
  )
}

export default DeliveryBoy
