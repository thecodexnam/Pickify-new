import axios from 'axios';
import React, { useState } from 'react'
import { MdPhone } from "react-icons/md";
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../redux/userSlice';
import { FaLocationDot, FaUserTie, FaReceipt, FaMotorcycle } from "react-icons/fa6";

function OwnerOrderCard({ data }) {
  const [availableBoys, setAvailableBoys] = useState([])
  const dispatch = useDispatch()

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`, { status }, { withCredentials: true })
      dispatch(updateOrderStatus({ orderId, shopId, status }))
      setAvailableBoys(result.data.availableBoys || [])
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-green-900/5 p-5 md:p-6 border border-gray-150/40 hover:shadow-2xl transition-all duration-300 space-y-4">
      
      {/* Customer Header Info */}
      <div className="flex justify-between items-start border-b border-gray-50 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#00b252] flex-shrink-0">
            <FaUserTie size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-800 leading-tight">{data.user?.fullName}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">{data.user?.email}</p>
            <p className="flex items-center gap-1 text-[10px] text-gray-500 font-bold mt-1">
              <MdPhone className="text-green-600" />
              <span>{data.user?.mobile}</span>
            </p>
          </div>
        </div>

        <div className="text-right space-y-1">
          {data.paymentMethod === "online" ? (
            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
              data.payment
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-red-50 text-red-600 border-red-100"
            }`}>
              Online Paid
            </span>
          ) : (
            <span className="text-[9px] bg-green-50 text-green-700 font-extrabold px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-wider">
              {data.paymentMethod}
            </span>
          )}
          <span className="block text-[9px] bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wide">
            {data.deliveryMethod === 'pickup' ? 'SELF PICKUP' : 'DELIVERY'}
          </span>
        </div>
      </div>

      {/* Address Details */}
      <div className="flex items-start gap-1.5 text-xs text-gray-500 font-medium">
        <FaLocationDot size={12} className="text-orange-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="leading-relaxed text-[11px]">
            {data.deliveryMethod === 'pickup' ? 'Self Pickup at Store' : data?.deliveryAddress?.text}
          </p>
          {data.deliveryMethod !== 'pickup' && (
            <p className="text-[9px] text-gray-400 mt-0.5 font-mono">
              Lat: {data?.deliveryAddress?.latitude?.toFixed(4)}, Lon: {data?.deliveryAddress?.longitude?.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      {/* Horizontal Order Items */}
      <div className="flex space-x-3.5 overflow-x-auto pb-2 scrollbar-hide">
        {data.shopOrders?.shopOrderItems?.map((item, index) => (
          <div key={index} className="flex-shrink-0 w-36 border border-gray-100 bg-white rounded-xl p-2.5 shadow-xs">
            <div className="w-full h-20 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-1.5">
              <img src={item.item?.image} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <h5 className="text-[11px] font-extrabold text-gray-800 mt-2 truncate" title={item.name}>
              {item.name}
            </h5>
            <p className="text-[9px] text-gray-400 font-bold mt-0.5">
              Qty: {item.quantity} | ₹{item.price}
            </p>
          </div>
        ))}
      </div>

      {/* Status Controller Box */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500 font-bold flex items-center gap-1">
          <FaReceipt className="text-[#00b252]" />
          <span>Status: <strong className="capitalize text-[#00b252] ml-0.5">{data.shopOrders?.status}</strong></span>
        </span>

        <select
          className="rounded-xl border border-gray-200 focus:border-green-500 px-3 py-1.5 text-[10px] font-black outline-none text-[#00b252] bg-white cursor-pointer"
          onChange={(e) => handleUpdateStatus(data._id, data.shopOrders?.shop?._id || data.shopOrders?.shop, e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Change Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          {data.deliveryMethod !== 'pickup' && <option value="out of delivery">Out Of Delivery</option>}
        </select>
      </div>

      {/* Assigned or Available Delivery Partners */}
      {data.deliveryMethod !== 'pickup' && data.shopOrders?.status === "out of delivery" && (
        <div className="mt-3 p-3 border border-green-100 rounded-2xl bg-green-50/30 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-green-700 uppercase tracking-wider">
            <FaMotorcycle size={14} />
            <span>{data.shopOrders?.assignedDeliveryBoy ? "Assigned Rider Details" : "Rider Assignments"}</span>
          </div>

          {data.shopOrders?.assignedDeliveryBoy ? (
            <div className="text-[11px] text-gray-700 font-semibold bg-white p-2.5 rounded-xl border border-green-100/50">
              <p>Name: <strong className="text-gray-900">{data.shopOrders.assignedDeliveryBoy.fullName}</strong></p>
              <p className="mt-0.5">Mobile: <strong className="text-gray-900">{data.shopOrders.assignedDeliveryBoy.mobile}</strong></p>
            </div>
          ) : (
            <div className="text-[11px] text-gray-500 font-semibold">
              {availableBoys?.length > 0 ? (
                <div className="space-y-1 mt-1">
                  <p className="text-[9px] text-gray-400 font-bold">Nearby Riders Notified:</p>
                  {availableBoys.map((b, idx) => (
                    <div className="bg-white p-2 rounded-xl border border-gray-100" key={idx}>
                      {b.fullName} - {b.mobile}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-gray-400 mt-1">Waiting for a nearby partner to accept this assignment...</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Total subtotal */}
      <div className="text-right font-black text-gray-800 text-xs pt-1">
        Order Subtotal: <span className="text-[#00b252] text-sm">₹{data.shopOrders?.subtotal}</span>
      </div>

    </div>
  )
}

export default OwnerOrderCard
