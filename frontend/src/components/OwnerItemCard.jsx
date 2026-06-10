import axios from 'axios';
import React from 'react'
import { FaPen, FaTrashCan, FaLeaf } from "react-icons/fa6";
import { FaDrumstickBite } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';

function OwnerItemCard({ data }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleDelete = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/delete/${data._id}`, { withCredentials: true })
      dispatch(setMyShopData(result.data))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="surface-card-sm flex w-full max-w-[240px] flex-col overflow-hidden card-hover">
      <div className="relative flex h-[155px] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50 p-3">
        <img
          src={data.image}
          alt={data.name}
          className="h-full w-full object-contain transition duration-500 hover:scale-105"
        />
        <div className="absolute right-2.5 top-2.5 rounded-full border border-white/80 bg-white/90 p-1 shadow-sm">
          {data.foodType === "veg" ? (
            <FaLeaf className="text-xs text-emerald-600" title="Vegetarian" />
          ) : (
            <FaDrumstickBite className="text-xs text-rose-500" title="Non-Vegetarian" />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <span className="mb-1 inline-block w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">
          {data.category}
        </span>

        <h3 className="truncate text-sm font-black leading-tight text-slate-900" title={data.name}>
          {data.name}
        </h3>

        <p className="mt-0.5 text-[10px] font-semibold capitalize text-slate-400">
          Diet: {data.foodType}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5">
          <span className="text-sm font-black text-emerald-700">₹{data.price}</span>
          <div className="flex items-center gap-1.5">
            <button
              className="rounded-full p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => navigate(`/edit-item/${data._id}`)}
              title="Edit Product"
            >
              <FaPen size={12} />
            </button>
            <button
              className="rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              onClick={handleDelete}
              title="Delete Product"
            >
              <FaTrashCan size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerItemCard
