import { motion, AnimatePresence } from 'framer-motion'
import { Rating, Restaurant } from '@/lib/airtable'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface RecentRatingsFeedProps {
  restaurants: Restaurant[]
  getProfileImage: (username: string) => string
}

export default function RecentRatingsFeed({ restaurants, getProfileImage }: RecentRatingsFeedProps) {
  const [recentRatings, setRecentRatings] = useState<Array<Rating & { restaurantName: string }>>([])

  useEffect(() => {
    // Collect all ratings from all restaurants
    const allRatings = restaurants.flatMap(restaurant => 
      restaurant.ratings.map(rating => ({
        ...rating,
        restaurantName: restaurant.name
      }))
    )

    // Sort by date (most recent first) and take the most recent 10
    const sortedRatings = allRatings
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    setRecentRatings(sortedRatings)
  }, [restaurants])

  return (
    <div className="w-80 bg-base-100 shadow-xl rounded-lg p-4 h-[calc(100vh-2rem)] overflow-y-auto">
      <h2 className="text-xl font-bold text-primary mb-4 sticky top-0 bg-base-100 py-2">
        Recent Ratings
      </h2>
      <div className="space-y-4">
        <AnimatePresence>
          {recentRatings.map((rating, index) => (
            <motion.div
              key={`${rating.user}-${rating.date}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-base-200 rounded-lg p-3 hover:bg-base-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={getProfileImage(rating.user)}
                    alt={`${rating.user}'s profile`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      href={`/profile/${rating.user}`}
                      className="font-semibold text-primary hover:opacity-80 transition-opacity truncate"
                    >
                      {rating.user}
                    </Link>
                    <span className="text-sm text-base-content opacity-70">
                      {new Date(rating.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{rating.restaurantName}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-warning">⭐</span>
                      <span className="font-semibold">{rating.rating}</span>
                      {rating.rating === 5 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 10 }}
                          className="text-warning"
                        >
                          ✨
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-base-content opacity-70 line-clamp-2">
                    {rating.comment || "No comment 🫥"}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 