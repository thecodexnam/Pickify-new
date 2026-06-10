import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';
import { FaBasketShopping, FaArrowRight } from "react-icons/fa6";
import Nav from '../components/Nav';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import AppFooter from '../components/AppFooter';

function CartPage() {
  const navigate = useNavigate()
  const { cartItems, totalAmount } = useSelector(state => state.user)

  return (
    <div className="page-shell animate-fade-in">
      <Nav />

      <div className="page-content max-w-[900px]">
        <PageHeader
          eyebrow="Basket"
          title="Your cart"
          subtitle={`${cartItems?.length || 0} grocery ${cartItems?.length === 1 ? 'item' : 'items'} selected`}
          onBack={() => navigate('/')}
        />

        {!cartItems || cartItems.length === 0 ? (
          <div className="surface-card">
            <EmptyState
              icon={<FaBasketShopping size={34} />}
              title="Your cart is empty"
              description="Explore local shops, add fresh essentials, and come back when your basket is ready for checkout."
              action={
                <button onClick={() => navigate('/')} className="primary-btn px-5 py-3 text-sm">
                  Start shopping
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <CartItemCard data={item} key={index} />
              ))}
            </div>

            <div className="surface-card mt-6 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subtotal</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">₹{totalAmount}</h3>
                  <p className="mt-1 text-xs text-slate-500">Delivery and packaging are added at checkout.</p>
                </div>
                <button onClick={() => navigate('/checkout')} className="primary-btn px-6 py-3 text-sm">
                  Proceed to checkout
                  <FaArrowRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="page-content max-w-[900px] pb-10">
        <AppFooter />
      </div>
    </div>
  )
}

export default CartPage
