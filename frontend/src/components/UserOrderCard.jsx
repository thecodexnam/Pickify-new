import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { FaRegClock, FaCartFlatbedSuitcase } from "react-icons/fa6";

function UserOrderCard({ data }) {
  const navigate = useNavigate()
  const [selectedRating, setSelectedRating] = useState({})

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  const handleRating = async (itemId, rating) => {
    try {
      await axios.post(`${serverUrl}/api/item/rating`, { itemId, rating }, { withCredentials: true })
      setSelectedRating(prev => ({ ...prev, [itemId]: rating }))
    } catch (error) {
      console.log(error)
    }
  }

  const statusClass = (status) => {
    if (status === 'delivered') return 'status-badge--success'
    if (status === 'cancelled') return 'status-badge--neutral'
    return 'status-badge--warning'
  }

  return (
    <div className="surface-card space-y-4 p-5 md:p-6 card-hover">
      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-slate-900">
              Order #{data._id.slice(-6).toUpperCase()}
            </span>
            <span className="status-badge status-badge--neutral">{data.paymentMethod?.toUpperCase()}</span>
            <span className="status-badge status-badge--neutral">
              {data.deliveryMethod === 'pickup' ? 'Self pickup' : 'Delivery'}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <FaRegClock size={11} />
            Placed: {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="text-right">
          {data.paymentMethod === "online" && (
            <span className={`status-badge ${data.payment ? 'status-badge--success' : 'status-badge--warning'}`}>
              Paid: {data.payment ? "Yes" : "No"}
            </span>
          )}
          <p className={`mt-1.5 status-badge capitalize ${statusClass(data.shopOrders?.[0]?.status)}`}>
            {data.shopOrders?.[0]?.status}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.shopOrders.map((shopOrder, index) => (
          <div className="surface-card-sm space-y-3 p-4" key={index}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800">{shopOrder.shop?.name}</h4>
              <span className={`status-badge capitalize ${statusClass(shopOrder.status)}`}>
                {shopOrder.status}
              </span>
            </div>

            <div className="scrollbar-hidden flex space-x-3 overflow-x-auto pb-2">
              {shopOrder.shopOrderItems.map((item, idx) => (
                <div key={idx} className="w-36 shrink-0 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                  <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-1.5">
                    <img src={item.item?.image} alt={item.name} className="h-full w-full object-contain" />
                  </div>
                  <h5 className="mt-2 truncate text-[11px] font-black text-slate-800" title={item.name}>
                    {item.name}
                  </h5>
                  <p className="mt-0.5 text-[9px] font-bold text-slate-400">
                    Qty: {item.quantity} | ₹{item.price}
                  </p>

                  {shopOrder.status === "delivered" && (
                    <div className="mt-2 flex w-fit items-center gap-0.5 rounded-lg border border-slate-100 bg-slate-50 p-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`cursor-pointer text-xs transition active:scale-125 ${
                            (selectedRating[item.item?._id] || item.item?.rating?.average || 0) >= star
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }`}
                          onClick={() => handleRating(item.item?._id, star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] font-bold text-slate-500">
              <span>Subtotal: <strong className="text-slate-800">₹{shopOrder.subtotal}</strong></span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-black text-slate-900">
          Total: <span className="text-emerald-700">₹{data.totalAmount}</span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/invoice/${data._id}`)}
            className="secondary-btn px-4 py-2 text-xs"
          >
            Invoice
          </button>
          <button
            onClick={() => navigate(`/track-order/${data._id}`)}
            className="primary-btn px-4 py-2 text-xs"
          >
            <FaCartFlatbedSuitcase size={12} />
            Track order
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserOrderCard
