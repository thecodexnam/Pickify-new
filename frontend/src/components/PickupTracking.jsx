import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import home from '../assets/home.png'
import { FaRoute, FaStore } from 'react-icons/fa6'
import { formatDistance, getHaversineDistanceKm } from '../utils/geo'

const userIcon = new L.Icon({
  iconUrl: home,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

const storeIcon = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;border-radius:50%;background:#059669;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;">🏪</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

function FitMapBounds({ userLocation, shopCoords }) {
  const map = useMap()
  const hasFit = useRef(false)

  useEffect(() => {
    if (!userLocation || !shopCoords || hasFit.current) return
    hasFit.current = true
    const bounds = L.latLngBounds(
      [userLocation.lat, userLocation.lon],
      [shopCoords.lat, shopCoords.lon]
    )
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 })
  }, [userLocation, shopCoords, map])

  return null
}

function PickupTracking({ shop, isActive = true }) {
  const [userLocation, setUserLocation] = useState(null)
  const [shopCoords, setShopCoords] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [shopError, setShopError] = useState(null)
  const [loadingShop, setLoadingShop] = useState(true)
  const apiKey = import.meta.env.VITE_GEOAPIKEY

  useEffect(() => {
    if (!shop) return

    let cancelled = false

    const geocodeShop = async () => {
      setLoadingShop(true)
      setShopError(null)
      try {
        const addressQuery = [shop.address, shop.city, shop.state].filter(Boolean).join(', ')
        const geoRes = await axios.get(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressQuery)}&apiKey=${apiKey}`
        )
        const feature = geoRes.data.features?.[0]
        if (!feature?.properties?.lat) {
          if (!cancelled) setShopError('Could not locate the store on the map.')
          return
        }
        if (!cancelled) {
          setShopCoords({
            lat: feature.properties.lat,
            lon: feature.properties.lon,
            address: addressQuery,
          })
        }
      } catch {
        if (!cancelled) setShopError('Failed to load store location.')
      } finally {
        if (!cancelled) setLoadingShop(false)
      }
    }

    geocodeShop()
    return () => { cancelled = true }
  }, [shop, apiKey])

  useEffect(() => {
    if (!isActive || !navigator.geolocation) {
      setLocationError('Live location is not available on this device.')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        })
        setLocationError(null)
      },
      () => {
        setLocationError('Allow location access to see live distance to the store.')
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [isActive])

  const distanceKm = useMemo(() => {
    if (!userLocation || !shopCoords) return null
    return getHaversineDistanceKm(
      userLocation.lat,
      userLocation.lon,
      shopCoords.lat,
      shopCoords.lon
    )
  }, [userLocation, shopCoords])

  const mapCenter = userLocation || shopCoords || { lat: 28.6139, lon: 77.2090 }
  const path = userLocation && shopCoords
    ? [[userLocation.lat, userLocation.lon], [shopCoords.lat, shopCoords.lon]]
    : []

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live distance to store
          </p>
          {loadingShop ? (
            <p className="mt-1 text-xs font-bold text-slate-500">Loading store location…</p>
          ) : shopError ? (
            <p className="mt-1 text-xs font-bold text-rose-600">{shopError}</p>
          ) : locationError ? (
            <p className="mt-1 text-xs font-bold text-amber-700">{locationError}</p>
          ) : distanceKm != null ? (
            <>
              <p className="mt-1 text-lg font-black text-slate-900">{formatDistance(distanceKm)}</p>
              <p className="text-[10px] font-bold text-slate-400">
                Updates automatically as you move · {distanceKm.toFixed(2)} km straight-line
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs font-bold text-slate-500">Waiting for your location…</p>
          )}
        </div>
        {distanceKm != null && (
          <div className="rounded-full bg-emerald-600 px-4 py-2 text-white">
            <p className="flex items-center gap-1.5 text-xs font-black">
              <FaRoute size={12} />
              {formatDistance(distanceKm)}
            </p>
          </div>
        )}
      </div>

      <div className="relative h-[400px] w-full overflow-hidden rounded-3xl border border-slate-100 shadow-inner">
        {(loadingShop && !shopCoords) ? (
          <div className="flex h-full items-center justify-center bg-slate-50">
            <p className="text-sm font-bold text-slate-500">Loading map…</p>
          </div>
        ) : (
          <MapContainer
            className="h-full w-full"
            center={[mapCenter.lat, mapCenter.lon]}
            zoom={14}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userLocation && shopCoords && (
              <FitMapBounds userLocation={userLocation} shopCoords={shopCoords} />
            )}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}
            {shopCoords && (
              <Marker position={[shopCoords.lat, shopCoords.lon]} icon={storeIcon}>
                <Popup>{shop?.name || 'Store'}</Popup>
              </Marker>
            )}
            {path.length === 2 && (
              <Polyline positions={path} color="#059669" weight={4} dashArray="8 8" />
            )}
          </MapContainer>
        )}
      </div>

      {shopCoords?.address && (
        <p className="flex items-start gap-1.5 text-xs text-slate-500">
          <FaStore className="mt-0.5 shrink-0 text-emerald-600" size={12} />
          <span><strong className="text-slate-700">Pickup at:</strong> {shopCoords.address}</span>
        </p>
      )}
    </div>
  )
}

export default PickupTracking
