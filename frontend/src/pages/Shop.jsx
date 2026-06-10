import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { FaStore, FaLocationDot, FaArrowLeftLong } from "react-icons/fa6";
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import AppFooter from '../components/AppFooter';

function Shop() {
  const { shopId } = useParams()
  const [items, setItems] = useState([])
  const [shop, setShop] = useState(null)
  const navigate = useNavigate()

  const handleShop = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`, { withCredentials: true })
      setShop(result.data.shop)
      setItems(result.data.items)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    handleShop()
  }, [shopId])

  return (
    <div className="page-shell animate-fade-in pb-16">
      <button
        onClick={() => navigate("/")}
        className="back-btn fixed left-4 top-4 z-20 gap-2 px-4 py-2"
      >
        <FaArrowLeftLong />
        <span className="text-xs font-bold">Back</span>
      </button>

      {shop && (
        <div className="relative h-64 w-full overflow-hidden md:h-80 lg:h-[360px]">
          <img src={shop.image} alt={shop.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/30 to-slate-950/85" />
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
            <div className="mx-auto max-w-6xl">
              <span className="status-badge status-badge--success">
                <FaStore size={10} /> Featured store
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white drop-shadow-md md:text-5xl">
                {shop.name}
              </h1>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-200">
                <FaLocationDot className="text-amber-400" size={12} />
                <p>{shop.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="section-title mb-8">
          <div>
            <h2>Store products</h2>
            <p>Fresh groceries from {shop?.name || 'this store'}</p>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item, index) => (
              <ProductCard key={index} data={item} />
            ))}
          </div>
        ) : (
          <div className="surface-card">
            <EmptyState
              icon={<FaStore size={24} />}
              title="Catalog is empty"
              description="Check back later or explore other stores in your city."
              action={
                <button onClick={() => navigate('/')} className="secondary-btn px-5 py-2.5 text-sm">
                  Browse stores
                </button>
              }
            />
          </div>
        )}
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-10 md:px-8">
        <AppFooter />
      </div>
    </div>
  )
}

export default Shop
