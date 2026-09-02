// Geo-Spatial Service & Delhi-NCR Area Coordinates

export const DELHI_NCR_AREAS = [
  { id: 'south_ext', name: 'South Extension, New Delhi', district: 'South Delhi', lat: 28.5728, lng: 77.2217 },
  { id: 'saket', name: 'Saket, New Delhi', district: 'South Delhi', lat: 28.5244, lng: 77.2177 },
  { id: 'lajpat_nagar', name: 'Lajpat Nagar, New Delhi', district: 'South East Delhi', lat: 28.5677, lng: 77.2433 },
  { id: 'cp', name: 'Connaught Place, New Delhi', district: 'Central Delhi', lat: 28.6315, lng: 77.2167 },
  { id: 'rohini', name: 'Rohini Sector 14, Delhi', district: 'North West Delhi', lat: 28.7041, lng: 77.1025 },
  { id: 'dwarka', name: 'Dwarka Sector 10, New Delhi', district: 'South West Delhi', lat: 28.5921, lng: 77.0460 },
  { id: 'janakpuri', name: 'Janakpuri, New Delhi', district: 'West Delhi', lat: 28.6219, lng: 77.0878 },
  { id: 'mayur_vihar', name: 'Mayur Vihar Phase 1, Delhi', district: 'East Delhi', lat: 28.6095, lng: 77.2965 },
  { id: 'noida_62', name: 'Sector 62, Noida', district: 'Gautam Buddha Nagar', lat: 28.6280, lng: 77.3649 },
  { id: 'gurgaon_cyber', name: 'Cyber City, DLF Phase 2, Gurugram', district: 'Gurugram', lat: 28.4950, lng: 77.0895 },
]

/**
 * Calculates distance between two coordinates using Haversine formula (in kilometers)
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0
  }
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return parseFloat(distance.toFixed(1))
}

/**
 * Finds the closest predefined area matching address text or returns a fallback
 */
export function getAreaCoordinates(areaNameOrAddress) {
  if (!areaNameOrAddress) return DELHI_NCR_AREAS[0]
  const query = areaNameOrAddress.toLowerCase()
  const matched = DELHI_NCR_AREAS.find(
    (a) =>
      query.includes(a.name.toLowerCase()) ||
      query.includes(a.district.toLowerCase()) ||
      query.includes(a.id)
  )
  return matched || DELHI_NCR_AREAS[0]
}
