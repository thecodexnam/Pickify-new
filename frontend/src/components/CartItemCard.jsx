import React from 'react'
import { FaMinus, FaPlus, FaTrashCan } from "react-icons/fa6";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';

function CartItemCard({ data }) {
  const dispatch = useDispatch()

  const handleIncrease = (id, currentQty) => {
    dispatch(updateQuantity({ id, quantity: currentQty + 1 }))
  }

  const handleDecrease = (id, currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQuantity({ id, quantity: currentQty - 1 }))
    }
  }

  return (
    <div className="surface-card-sm flex flex-col items-center justify-between gap-4 p-4 sm:flex-row card-hover">
      <div className="flex w-full items-center gap-4 sm:w-auto">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-emerald-50 p-2">
          <img src={data.image} alt={data.name} className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black leading-tight text-slate-900" title={data.name}>
            {data.name}
          </h3>
          <p className="mt-0.5 text-[10px] font-bold capitalize text-slate-400">
            Diet: {data.foodType}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-black text-emerald-700">₹{data.price}</span>
            <span className="text-[10px] font-bold text-slate-400">× {data.quantity}</span>
            <span className="text-sm font-black text-slate-900">₹{data.price * data.quantity}</span>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:w-auto sm:justify-end sm:border-t-0 sm:pt-0">
        <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/50 px-3 py-1">
          <button
            onClick={() => handleDecrease(data.id, data.quantity)}
            className="rounded-full p-1 text-emerald-700 transition hover:bg-white"
          >
            <FaMinus size={9} />
          </button>
          <span className="min-w-5 text-center text-xs font-black text-emerald-800">{data.quantity}</span>
          <button
            onClick={() => handleIncrease(data.id, data.quantity)}
            className="rounded-full p-1 text-emerald-700 transition hover:bg-white"
          >
            <FaPlus size={9} />
          </button>
        </div>

        <button
          onClick={() => dispatch(removeCartItem(data.id))}
          className="danger-btn p-2.5"
          title="Remove from cart"
        >
          <FaTrashCan size={12} />
        </button>
      </div>
    </div>
  )
}

export default CartItemCard
