export function isValidCoords(lat, lon) {
  if (lat == null || lon == null) return false
  if (lat === 0 && lon === 0) return false
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

export function getCoordsFromUser(userData, mapLocation) {
  const coords = userData?.location?.coordinates
  if (coords?.length === 2 && isValidCoords(coords[1], coords[0])) {
    return { lat: coords[1], lon: coords[0] }
  }
  if (mapLocation?.lat != null && mapLocation?.lon != null && isValidCoords(mapLocation.lat, mapLocation.lon)) {
    return { lat: mapLocation.lat, lon: mapLocation.lon }
  }
  return null
}

export function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km) {
  if (km < 0.1) return 'Very close — under 100 m'
  if (km < 1) return `${Math.round(km * 1000)} m away`
  return `${km.toFixed(1)} km away`
}

export function getShopIdFromCartItem(item) {
  if (!item?.shop) return null
  return typeof item.shop === 'object' ? item.shop._id : item.shop
}

export function resolveUserCoordinates(userData, mapLocation) {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {
          const fallback = getCoordsFromUser(userData, mapLocation)
          if (fallback) resolve(fallback)
          else reject(new Error('Allow location access to see how far you are from the store.'))
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      )
      return
    }
    const fallback = getCoordsFromUser(userData, mapLocation)
    if (fallback) resolve(fallback)
    else reject(new Error('Location is unavailable on this device.'))
  })
}
