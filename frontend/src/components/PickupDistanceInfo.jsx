import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { FaStore, FaLocationDot, FaRoute, FaArrowsRotate } from 'react-icons/fa6'
import { serverUrl } from '../App'
import {
  formatDistance,
  getHaversineDistanceKm,
  getShopIdFromCartItem,
  resolveUserCoordinates,
} from '../utils/geo'

function PickupDistanceInfo({ cartItems, userData, mapLocation }) {
  const [shopsDistance, setShopsDistance] = useState([])
  const [loading, setLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const apiKey = import.meta.env.VITE_GEOAPIKEY

  const loadDistances = useCallback(async () => {
    if (!cartItems?.length) {
      setShopsDistance([])
      return
    }

    setLoading(true)
    setLocationError(null)

    try {
      const user = await resolveUserCoordinates(userData, mapLocation)

      const shopIds = [...new Set(cartItems.map(getShopIdFromCartItem).filter(Boolean))]

      const results = await Promise.all(
        shopIds.map(async (shopId) => {
          try {
            const { data } = await axios.get(
              `${serverUrl}/api/item/get-by-shop/${shopId}`,
              { withCredentials: true }
            )
            const shop = data.shop
            if (!shop) return { shopId, error: 'Store not found' }

            const addressQuery = [shop.address, shop.city, shop.state].filter(Boolean).join(', ')
            const geoRes = await axios.get(
              `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressQuery)}&apiKey=${apiKey}`
            )
            const feature = geoRes.data.features?.[0]
            if (!feature?.properties?.lat) {
              return { shopId, shopName: shop.name, address: addressQuery, error: 'Could not locate store on map' }
            }

            const shopLat = feature.properties.lat
            const shopLon = feature.properties.lon
            const distanceKm = getHaversineDistanceKm(user.lat, user.lon, shopLat, shopLon)

            return {
              shopId,
              shopName: shop.name,
              address: addressQuery,
              distanceKm,
              distanceText: formatDistance(distanceKm),
            }
          } catch {
            return { shopId, error: 'Failed to load store details' }
          }
        })
      )

      setShopsDistance(results)
    } catch (err) {
      setLocationError(err.message || 'Unable to calculate distance')
      setShopsDistance([])
    } finally {
      setLoading(false)
    }
  }, [cartItems, userData, mapLocation, apiKey])

  useEffect(() => {
    loadDistances()
  }, [loadDistances, refreshKey])

  return (
    <div className="space-y-3 rounded-[1.4rem] border border-emerald-100 bg-emerald-50/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-900">Self pickup selected</p>
          <p className="mt-1 text-xs text-slate-500">
            Distance from your current location to the store(s) in your cart.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
          className="ghost-btn shrink-0 p-2"
          title="Refresh distance"
        >
          <FaArrowsRotate size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="skeleton h-16 w-full" />
          <p className="text-center text-xs font-bold text-slate-500">Getting your location…</p>
        </div>
      )}

      {!loading && locationError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-bold text-amber-800">
          {locationError}
        </div>
      )}

      {!loading && !locationError && shopsDistance.length > 0 && (
        <div className="space-y-3">
          {shopsDistance.map((entry) => (
            <div
              key={entry.shopId}
              className="rounded-xl border border-white/80 bg-white/90 p-4 shadow-sm"
            >
              {entry.error ? (
                <p className="text-xs font-bold text-rose-600">{entry.error}</p>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FaStore className="shrink-0 text-emerald-600" size={14} />
                        <h4 className="truncate text-sm font-black text-slate-900">{entry.shopName}</h4>
                      </div>
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
                        <FaLocationDot className="mt-0.5 shrink-0 text-amber-500" size={11} />
                        <span>{entry.address}</span>
                      </p>
                    </div>
                    <div className="shrink-0 rounded-full bg-emerald-600 px-3 py-1.5 text-center">
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-white">
                        <FaRoute size={10} />
                        {entry.distanceText}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-100">
                        {entry.distanceKm.toFixed(2)} km
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] font-bold text-slate-400">
                    Pick up your order at this store when it is marked ready.
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PickupDistanceInfo
