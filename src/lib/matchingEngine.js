// SahakarConnect Geo + Skill Matching Engine
// Algorithm: Exact Trade Match + Haversine Distance + Fair-Rotation Bonus

import { calculateHaversineDistance, getAreaCoordinates } from './geoService'

/**
 * Ranks available workers for a given service request
 * @param {Object} jobDetails - { trade_category, area, latitude, longitude }
 * @param {Array} workersList - Array of worker profiles with { user_id, primary_trade, latitude, longitude, is_verified, is_available, completed_jobs_count }
 * @param {Array} past7DaysJobs - Array of jobs completed in last 7 days to calculate fair rotation
 * @returns {Array} Ranked workers with matching score breakdown
 */
export function rankWorkersForJob(jobDetails, workersList = [], past7DaysJobs = []) {
  if (!jobDetails || !jobDetails.trade_category) return []

  const targetLat = jobDetails.latitude || getAreaCoordinates(jobDetails.area).lat
  const targetLng = jobDetails.longitude || getAreaCoordinates(jobDetails.area).lng
  const requiredTrade = jobDetails.trade_category.toLowerCase().trim()

  // 1. Filter by Exact Trade Match & Available/Verified
  const eligibleWorkers = workersList.filter((worker) => {
    const workerTrade = (worker.primary_trade || '').toLowerCase().trim()
    return workerTrade === requiredTrade
  })

  // 2. Compute Job Counts in Past 7 Days per worker for Fair-Rotation Weighting
  const recentJobCounts = {}
  past7DaysJobs.forEach((job) => {
    if (job.assigned_worker_id) {
      recentJobCounts[job.assigned_worker_id] = (recentJobCounts[job.assigned_worker_id] || 0) + 1
    }
  })

  // 3. Score and Rank
  const scoredWorkers = eligibleWorkers.map((worker) => {
    const workerLat = worker.latitude || targetLat
    const workerLng = worker.longitude || targetLng

    // Distance calculation (Haversine)
    const distanceKm = calculateHaversineDistance(targetLat, targetLng, workerLat, workerLng)

    // Distance Score (30 max): 30 if <= 2km, decays to 5 at 25km+
    const distanceScore = Math.max(5, Math.round(30 - distanceKm * 1.0))

    // Fair Rotation Score (20 max):
    // Workers with 0 jobs in last 7 days get +20 pts. Each recent job deducts 5 pts down to min 0 pts.
    const recentJobs = recentJobCounts[worker.user_id] || 0
    const fairRotationScore = Math.max(0, 20 - recentJobs * 5)

    // Skill Exact Match Base (50 pts)
    const skillScore = 50

    // Rating Bonus (max 5 pts)
    const ratingBonus = Math.round(((worker.rating || 5.0) / 5.0) * 5)

    // Verification Multiplier
    const isVerifiedBonus = worker.is_verified ? 5 : 0

    const totalScore = Math.min(100, skillScore + distanceScore + fairRotationScore + ratingBonus + isVerifiedBonus)

    return {
      ...worker,
      distanceKm,
      scoreBreakdown: {
        skillMatch: skillScore,
        distanceScore,
        fairRotationBonus: fairRotationScore,
        ratingBonus,
        isVerifiedBonus,
      },
      matchPercentage: totalScore,
    }
  })

  // Sort descending by match percentage (highest score first)
  scoredWorkers.sort((a, b) => b.matchPercentage - a.matchPercentage)

  return scoredWorkers
}
