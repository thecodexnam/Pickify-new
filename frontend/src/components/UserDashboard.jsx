import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft, FaCircleChevronRight, FaLocationDot, FaArrowRight, FaBasketShopping, FaLeaf, FaStore } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';
import AppFooter from './AppFooter';

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems, categories: categoryRecords } = useSelector(state => state.user)
  const cateScrollRef = useRef()
  const navigate = useNavigate()
  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [updatedItemsList, setUpdatedItemsList] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = categoryRecords?.length
    ? [...categoryRecords.map(category => ({ category: category.name, image: category.image })), { category: "All", image: "" }]
    : []

  const handleFilterByCategory = (category) => {
    setActiveCategory(category)
    if (category === "All") {
      setUpdatedItemsList(itemsInMyCity)
    } else {
      const filteredList = itemsInMyCity?.filter(i => i.category === category)
      setUpdatedItemsList(filteredList)
    }
  }

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity)
  }, [itemsInMyCity])

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current
    if (element) {
      setLeftButton(element.scrollLeft > 0)
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth)
    }
  }

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -240 : 240,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    const element = cateScrollRef.current
    if (!element) return

    const handleScroll = () => {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    }

    handleScroll()
    element.addEventListener('scroll', handleScroll)

    return () => {
      element.removeEventListener("scroll", handleScroll)
    }
  }, [categories.length])

  return (
    <div className="page-shell">
      <Nav />

      <section className="mx-auto mt-24 max-w-7xl px-4 pb-4 pt-2 md:px-8">
        <div className="surface-card relative overflow-hidden px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
          <div className="hero-orb left-[-60px] top-[-30px] h-28 w-28 bg-emerald-200/70" />
          <div className="hero-orb bottom-[-40px] right-[-10px] h-36 w-36 bg-amber-100/90" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="metric-pill w-fit">Freshness, delivered</p>
              <h1 className="mt-4 text-[clamp(1.85rem,1.5vw+1.4rem,2.8rem)] font-black tracking-tight text-slate-950">
                Grocery shopping that feels premium, fast, and personal.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Discover trusted local stores, compare fresh essentials, and get your daily needs delivered with a smooth checkout flow designed for modern shoppers.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={() => navigate('/cart')} className="primary-btn px-5 py-3 text-sm">
                  <FaBasketShopping size={16} />
                  View cart
                </button>
                <button onClick={() => navigate('/my-orders')} className="secondary-btn px-5 py-3 text-sm">
                  Track orders
                  <FaArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:min-w-[360px]">
              {[
                { label: 'Stores near you', value: shopInMyCity?.length || 0, icon: <FaStore size={16} /> },
                { label: 'Products in city', value: itemsInMyCity?.length || 0, icon: <FaLeaf size={16} /> },
                { label: 'Delivery zone', value: currentCity || 'Set', icon: <FaLocationDot size={16} /> }
              ].map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-100 bg-white/92 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                    <span className="text-emerald-600">{item.icon}</span>
                  </div>
                  <p className="mt-3 text-2xl font-black text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {searchItems && searchItems.length > 0 && (
        <section className="mx-auto mt-6 max-w-7xl px-4 md:px-8">
          <div className="section-title mb-4">
            <div>
              <h2>Search Results</h2>
              <p>Finding the right items for your basket</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {searchItems.map((item) => (
              <ProductCard data={item} key={item._id} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-8 max-w-7xl px-4 md:px-8">
        <div className="section-title">
          <div>
            <h2>Featured stores in {currentCity || 'your city'}</h2>
            <p>Fresh picks curated by local owners</p>
          </div>
        </div>

        {!shopInMyCity || shopInMyCity.length === 0 ? (
          <div className="surface-card mt-4 px-6 py-8 text-center">
            <p className="text-sm font-bold text-slate-600">No grocery stores are currently registered in your area.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shopInMyCity.map((shop, index) => (
              <div
                key={index}
                onClick={() => navigate(`/shop/${shop._id}`)}
                className="surface-card group cursor-pointer overflow-hidden card-hover"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={shop.image} alt={shop.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-800">4.5 star</span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-black text-slate-900">{shop.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{shop.address}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">OPEN</span>
                    <span className="text-xs font-black text-emerald-700">Explore</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 md:px-8">
        <div className="section-title">
          <div>
            <h2>Browse by category</h2>
            <p>Pick something for every moment of the day</p>
          </div>
        </div>

        <div className="relative mt-4">
          {showLeftCateButton && (
            <button
              onClick={() => scrollHandler(cateScrollRef, 'left')}
              className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 text-emerald-700 shadow-lg sm:block"
            >
              <FaCircleChevronLeft size={18} />
            </button>
          )}
          <div ref={cateScrollRef} className="scrollbar-hidden flex snap-x gap-4 overflow-x-auto pb-2">
            {categories.map((cate, index) => (
              <CategoryCard
                key={index}
                name={cate.category}
                image={cate.image}
                isActive={activeCategory === cate.category}
                onClick={() => handleFilterByCategory(cate.category)}
              />
            ))}
          </div>
          {showRightCateButton && (
            <button
              onClick={() => scrollHandler(cateScrollRef, 'right')}
              className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 text-emerald-700 shadow-lg sm:block"
            >
              <FaCircleChevronRight size={18} />
            </button>
          )}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl px-4 md:px-8">
        <div className="section-title">
          <div>
            <h2>Suggested grocery products</h2>
            <p>Popular essentials and new arrivals in your city</p>
          </div>
        </div>

        {!updatedItemsList || updatedItemsList.length === 0 ? (
          <div className="surface-card mt-4 px-6 py-10 text-center">
            <p className="text-sm font-bold text-slate-600">No products are currently available in your city.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {updatedItemsList.map((item, index) => (
              <ProductCard key={index} data={item} />
            ))}
          </div>
        )}
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <AppFooter />
      </div>
    </div>
  )
}

export default UserDashboard
