import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { IoIosArrowRoundBack } from "react-icons/io";
import AppFooter from '../components/AppFooter';

function InvoicePage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true)
        const result = await axios.get(`${serverUrl}/api/order/invoice/${orderId}`, { withCredentials: true })
        setInvoice(result.data)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [orderId])

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="surface-card px-8 py-6 text-sm font-black text-slate-700">Loading invoice...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="surface-card px-8 py-6 text-sm font-black text-slate-700">Invoice could not be loaded.</div>
      </div>
    )
  }

  return (
    <div className="page-shell min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/my-orders')} className="rounded-full bg-white/85 p-2 text-emerald-700 shadow-sm">
              <IoIosArrowRoundBack size={28} />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">Invoice</p>
              <h1 className="text-3xl font-black text-slate-950">Order receipt</h1>
            </div>
          </div>
          <button onClick={() => window.print()} className="primary-btn px-5 py-3 text-sm">
            Print invoice
          </button>
        </div>

        <div className="surface-card p-6 sm:p-8 print:shadow-none">
          <div className="flex flex-col gap-6 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">Pickify</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{invoice.invoiceNumber}</h2>
              <p className="mt-1 text-sm text-slate-500">Order ID: {invoice.orderId}</p>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-black text-slate-900">Issued:</span> {new Date(invoice.issuedAt).toLocaleString()}</p>
              <p><span className="font-black text-slate-900">Payment:</span> {invoice.paymentMethod?.toUpperCase()} {invoice.payment ? '(paid)' : '(pending)'}</p>
              <p><span className="font-black text-slate-900">Fulfillment:</span> {invoice.deliveryMethod === 'pickup' ? 'Self pickup' : 'Delivery'}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</p>
              <p className="mt-2 text-sm font-black text-slate-900">{invoice.customer?.fullName}</p>
              <p className="mt-1 text-sm text-slate-600">{invoice.customer?.email}</p>
              <p className="mt-1 text-sm text-slate-600">{invoice.customer?.mobile}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Address</p>
              <p className="mt-2 text-sm font-black text-slate-900">
                {invoice.deliveryMethod === 'pickup' ? 'Self Pickup at Store' : invoice.deliveryAddress?.text}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1.6fr_1fr_0.7fr_0.8fr_0.9fr] bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              <span>Item</span>
              <span>Shop</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Subtotal</span>
            </div>
            {(invoice.items || []).map((item, index) => (
              <div key={`${item.name}-${index}`} className="grid grid-cols-[1.6fr_1fr_0.7fr_0.8fr_0.9fr] border-t border-slate-100 px-4 py-3 text-sm text-slate-700">
                <div>
                  <p className="font-black text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.category}</p>
                </div>
                <span>{item.shopName}</span>
                <span>{item.quantity}</span>
                <span>Rs {item.price}</span>
                <span className="font-black text-slate-900">Rs {item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-600">Grand total</span>
                <span className="text-xl font-black text-emerald-700">Rs {invoice.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 print:hidden">
          <AppFooter />
        </div>
      </div>
    </div>
  )
}

export default InvoicePage
