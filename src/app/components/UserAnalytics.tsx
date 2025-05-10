'use client'

import { motion } from 'framer-motion'
import type { User, Restaurant, Rating } from '@/lib/airtable'

interface UserAnalyticsProps {
  users: User[]
  restaurants: Restaurant[]
}

interface UserStats {
  totalRatings: number
  averageRating: number
  favoriteRestaurant: {
    name: string
    rating: number
  }
  ratingDistribution: {
    [key: number]: number
  }
}

export default function UserAnalytics({ users, restaurants }: UserAnalyticsProps) {
  const calculateUserStats = (username: string): UserStats => {
    const userRatings = restaurants.flatMap(restaurant => 
      restaurant.ratings.filter(rating => rating.user === username)
    )

    const totalRatings = userRatings.length
    const averageRating = totalRatings > 0 
      ? userRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0

    // Find favorite restaurant (highest rated)
    const restaurantRatings = restaurants.map(restaurant => ({
      name: restaurant.name,
      rating: restaurant.ratings
        .filter(r => r.user === username)
        .reduce((sum, r) => sum + r.rating, 0) / 
        restaurant.ratings.filter(r => r.user === username).length || 0
    }))

    const favoriteRestaurant = restaurantRatings
      .filter(r => r.rating > 0)
      .sort((a, b) => b.rating - a.rating)[0] || { name: 'None', rating: 0 }

    // Calculate rating distribution
    const ratingDistribution = userRatings.reduce((acc, rating) => {
      acc[rating.rating] = (acc[rating.rating] || 0) + 1
      return acc
    }, {} as { [key: number]: number })

    return {
      totalRatings,
      averageRating,
      favoriteRestaurant,
      ratingDistribution
    }
  }

  const getProfileImage = (user: User) => {
    if (user.profilePic && user.profilePic.length > 0) {
      return user.profilePic[0].url
    }
    return `https://cataas.com/cat?random=${Math.random()}`
  }

  return (
    <div className="space-y-6">
      {users.map((user, index) => {
        const stats = calculateUserStats(user.name)
        return (
          <motion.div
            key={user.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card bg-base-200"
          >
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src={getProfileImage(user)}
                    alt={`${user.name}'s profile`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">{user.name}</h3>
                  <p className="text-base-content opacity-70">
                    {stats.totalRatings} ratings submitted
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="stat bg-base-100 rounded-box">
                  <div className="stat-title">Average Rating</div>
                  <div className="stat-value text-primary">
                    {stats.averageRating.toFixed(1)}
                  </div>
                </div>
                <div className="stat bg-base-100 rounded-box">
                  <div className="stat-title">Favorite Restaurant</div>
                  <div className="stat-value text-primary text-lg">
                    {stats.favoriteRestaurant.name}
                  </div>
                  <div className="stat-desc">
                    Rated {stats.favoriteRestaurant.rating.toFixed(1)} ⭐
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Rating Distribution</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex-1">
                      <div className="text-center text-sm mb-1">{rating} ⭐</div>
                      <div className="h-24 bg-base-100 rounded-lg relative">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ 
                            height: `${((stats.ratingDistribution[rating] || 0) / stats.totalRatings) * 100}%` 
                          }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="absolute bottom-0 w-full bg-primary rounded-b-lg"
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                          {stats.ratingDistribution[rating] || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
} 