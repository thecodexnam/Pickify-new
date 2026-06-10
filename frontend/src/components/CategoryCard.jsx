import React from 'react'

function CategoryCard({ name, image, onClick, isActive = false }) {
  return (
    <div
      onClick={onClick}
      className={`group relative aspect-[4/5] w-[40vw] min-w-[120px] max-w-[180px] shrink-0 snap-start cursor-pointer overflow-hidden rounded-[1.4rem] border shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 sm:w-[24vw] sm:max-w-[170px] md:w-[18vw] md:max-w-[180px] lg:w-[160px] ${
        isActive
          ? 'border-emerald-400 ring-2 ring-emerald-200 ring-offset-2'
          : 'border-slate-100 bg-white'
      }`}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 text-4xl font-black text-emerald-700">
          {name?.charAt(0)}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-8 sm:px-3 sm:pb-3">
        <p className="text-[11px] font-black leading-tight text-white sm:text-sm">{name}</p>
      </div>
    </div>
  )
}

export default CategoryCard
