import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import PickupTracking from '../components/PickupTracking'
import { useSelector } from 'react-redux'
import { FaStore, FaLocationDot, FaMotorcycle, FaCircleCheck } from "react-icons/fa6";
import AppFooter from '../components/AppFooter';

function TrackOrderPage() {
  const { orderId } = useParams()
  const [currentOrder, setCurrentOrder] = useState()
  const navigate = useNavigate()
  const { socket } = useSelector(state => state.user)
  const [liveLocations, setLiveLocations] = useState({})

  const handleGetOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true })
      setCurrentOrder(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!socket) return
    socket.on('updateDeliveryLocation', ({ deliveryBoyId, latitude, longitude }) => {
      setLiveLocations(prev => ({
        ...prev,
        [deliveryBoyId]: { lat: latitude, lon: longitude }
      }))
    })
    return () => {
      socket.off('updateDeliveryLocation')
    }
  }, [socket])

  useEffect(() => {
    handleGetOrder()
  }, [orderId])

  const isPickup = currentOrder?.deliveryMethod === 'pickup'

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f4fbf7] via-[#fafdfc] to-[#fffcfb] flex flex-col items-center px-4 py-8 animate-fade-in">
      <div className="w-full max-w-[800px] mt-10">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/my-orders")}
            className="p-1.5 rounded-full hover:bg-green-50 text-[#00b252] transition cursor-pointer"
          >
            <IoIosArrowRoundBack size={30} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Track Your Order</h1>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
              Real-time Grocery Transit Updates
            </p>
          </div>
        </div>

        {/* Shop Orders Tracking Blocks */}
        <div className="space-y-6">
          {currentOrder?.shopOrders?.map((shopOrder, index) => (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-green-900/5 p-5 md:p-6 border border-gray-150/40 hover:shadow-2xl transition-all duration-300 space-y-5" key={index}>
              
              {/* Store details */}
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-[#00b252] flex-shrink-0">
                    <FaStore size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-gray-800 leading-tight">{shopOrder.shop?.name}</h3>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5 capitalize">Status: {shopOrder.status}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] bg-green-50 text-green-700 font-extrabold px-2.5 py-0.5 rounded-full border border-green-100 uppercase tracking-wide">
                    ₹{shopOrder.subtotal}
                  </span>
                </div>
              </div>

              {/* Items Details */}
              <div className="text-xs text-gray-600 font-semibold space-y-1">
                <p>
                  <span className="text-gray-400">Grocery Items:</span>{" "}
                  <strong className="text-gray-800 font-black">{shopOrder.shopOrderItems?.map(i => i.name).join(", ")}</strong>
                </p>
                <p className="flex items-start gap-1 text-[11px] leading-relaxed mt-1">
                  <FaLocationDot size={12} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="text-gray-400">{isPickup ? 'Pickup point:' : 'Deliver to:'}</span>{" "}
                    <strong className="text-gray-700 font-semibold">{isPickup ? 'Self Pickup at Store' : currentOrder.deliveryAddress?.text}</strong>
                  </span>
                </p>
              </div>

              {/* Rider status cards */}
              <div className="pt-2">
                {shopOrder.status !== "delivered" ? (
                  isPickup ? (
                    <div className="p-3 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl flex items-center gap-3 text-emerald-700">
                      <div className="w-10 h-10 rounded-full bg-emerald-100/50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <FaStore size={16} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider">Self pickup order</h4>
                        <p className="text-[11px] font-semibold mt-0.5">Your order will be ready for collection at the store once it is prepared.</p>
                      </div>
                    </div>
                  ) : shopOrder.assignedDeliveryBoy ? (
                    <div className="p-3 bg-green-50/30 border border-green-100/50 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100/50 flex items-center justify-center text-green-600 flex-shrink-0">
                        <FaMotorcycle size={16} />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-green-700 uppercase tracking-wider">Assigned Delivery Partner</h4>
                        <p className="text-xs font-extrabold text-gray-800 mt-0.5">{shopOrder.assignedDeliveryBoy.fullName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Mobile: {shopOrder.assignedDeliveryBoy.mobile}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-orange-50/30 border border-orange-100/50 rounded-2xl flex items-center gap-3 text-orange-700">
                      <div className="w-10 h-10 rounded-full bg-orange-100/50 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <FaMotorcycle size={16} className="animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider">Rider Assignment Pending</h4>
                        <p className="text-[11px] font-semibold mt-0.5">Waiting for a delivery boy to accept the request...</p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
                    <FaCircleCheck size={20} />
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider">Delivered successfully</h4>
                      <p className="text-[11px] font-semibold mt-0.5">Your fresh groceries were delivered. Enjoy your shopping!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pickup live map + distance */}
              {isPickup && shopOrder.status !== 'delivered' && shopOrder.shop && (
                <PickupTracking shop={shopOrder.shop} isActive />
              )}

              {/* Delivery rider map */}
              {!isPickup && shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" && (
                <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-gray-150 shadow-inner relative z-10">
                  <DeliveryBoyTracking data={{
                    deliveryBoyLocation: liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                      lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                      lon: shopOrder.assignedDeliveryBoy.location.coordinates[0]
                    },
                    customerLocation: {
                      lat: currentOrder.deliveryAddress.latitude,
                      lon: currentOrder.deliveryAddress.longitude
                    }
                  }} />
                </div>
              )}

            </div>
          ))}
        </div>
        <div className="mt-10">
          <AppFooter />
        </div>
      </div>
    </div>
  )
}

export default TrackOrderPage
