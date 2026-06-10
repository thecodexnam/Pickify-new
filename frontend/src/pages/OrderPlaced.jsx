import React from 'react'
import { FaCircleCheck, FaBagShopping } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import AppFooter from '../components/AppFooter';

function OrderPlaced() {
  const navigate = useNavigate()

  return (
    <div className="page-shell flex animate-fade-in flex-col items-center px-4 text-center">
      <div className="hero-orb left-[-60px] top-20 h-40 w-40 bg-emerald-200/50" />
      <div className="hero-orb bottom-20 right-[-40px] h-32 w-32 bg-amber-100/70" />

      <div className="surface-card relative z-10 mt-auto flex w-full max-w-md flex-col items-center p-8 md:p-12">
        <div className="animate-bounce-subtle mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
          <FaCircleCheck size={48} />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-slate-900">Order confirmed!</h1>

        <div className="mt-3 flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/60 px-3 py-1">
          <FaBagShopping size={11} className="text-emerald-600" />
          <span className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Preparing groceries</span>
        </div>

        <p className="mt-6 max-w-sm text-sm leading-6 text-slate-500">
          Thank you for choosing Pickify! Your order has been sent to the merchant. Track preparation and delivery in your orders list.
        </p>

        <button onClick={() => navigate("/my-orders")} className="primary-btn mt-8 w-full py-3.5 text-sm">
          Track my order
        </button>
      </div>
      <div className="mt-10 w-full max-w-5xl">
        <AppFooter />
      </div>
    </div>
  )
}

export default OrderPlaced
