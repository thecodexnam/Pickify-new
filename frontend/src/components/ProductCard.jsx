import React, { useState } from 'react'
import { FaLeaf, FaDrumstickBite, FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';

function ProductCard({ data }) {
  const [quantity, setQuantity] = useState(0)
  const dispatch = useDispatch()
  const { cartItems } = useSelector(state => state.user)

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-amber-400" />
        ) : (
          <FaRegStar key={i} className="text-amber-200" />
        )
      )
    }
    return stars
  }

  const handleIncrease = () => setQuantity((prev) => prev + 1)
  const handleDecrease = () => setQuantity((prev) => (prev > 0 ? prev - 1 : 0))
  const isAlreadyInCart = cartItems.some((item) => item.id === data._id)

  return (
    <div className="surface-card flex w-full flex-col overflow-hidden card-hover">
      <div className="relative h-40 bg-gradient-to-br from-slate-50 to-emerald-50 p-3">
        <img
          src={data.image}
          alt={data.name}
          className="h-full w-full object-contain transition duration-500 hover:scale-105"
        />
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 shadow-sm">
          {data.foodType === 'veg' ? (
            <FaLeaf className="text-emerald-600" title="Vegetarian" />
          ) : (
            <FaDrumstickBite className="text-rose-500" title="Non-Vegetarian" />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
            {data.category}
          </span>
          <span className="text-[10px] font-bold text-slate-400">{data.rating?.count || 0} ratings</span>
        </div>

        <div>
          <h3 className="text-sm font-black leading-5 text-slate-900" title={data.name}>
            {data.name}
          </h3>
          <div className="mt-2 flex items-center gap-1.5">
            {renderStars(data.rating?.average || 0)}
            <span className="text-[11px] font-bold text-slate-500">{data.rating?.average || 0}.0</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Price</p>
            <p className="text-lg font-black text-emerald-700">₹{data.price}</p>
          </div>

          <div className="flex items-center gap-2">
            {quantity === 0 ? (
              <button onClick={handleIncrease} className="primary-btn px-3.5 py-2 text-[11px]">
                ADD
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1">
                <button onClick={handleDecrease} className="rounded-full p-1 text-emerald-700 transition hover:bg-white">
                  <FaMinus size={9} />
                </button>
                <span className="min-w-5 text-center text-sm font-black text-emerald-800">{quantity}</span>
                <button onClick={handleIncrease} className="rounded-full p-1 text-emerald-700 transition hover:bg-white">
                  <FaPlus size={9} />
                </button>
              </div>
            )}

            {quantity > 0 && (
              <button
                onClick={() => dispatch(addToCart({
                  id: data._id,
                  name: data.name,
                  price: data.price,
                  image: data.image,
                  shop: data.shop,
                  quantity,
                  foodType: data.foodType
                }))}
                className={`rounded-full p-2 transition ${isAlreadyInCart ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-700'}`}
                title="Add to cart"
              >
                <FaShoppingCart size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
