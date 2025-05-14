'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { getUsers, getRestaurants } from '@/lib/airtable'
import type { User, Restaurant, Rating } from '@/lib/airtable'
import Link from 'next/link'

export default function ProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, restaurantsData] = await Promise.all([
          getUsers(),
          getRestaurants()
        ])
        
        // Decode the URL parameter to handle special characters
        const decodedName = decodeURIComponent(params.id as string)
        const foundUser = usersData.find(u => u.name === decodedName)
        if (!foundUser) {
          setError('User not found')
          return
        }
        
        setUser(foundUser)
        setRestaurants(restaurantsData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const getProfileImage = (user: User) => {
    if (user.profilePic && user.profilePic.length > 0) {
      return user.profilePic[0].url
    }
    // Use a deterministic fallback based on the user's name
    return `https://cataas.com/cat/says/${encodeURIComponent(user.name)}?size=200&color=white&background=random`
  }

  const getUserRatings = () => {
    if (!user) return []
    return restaurants.flatMap(restaurant => 
      restaurant.ratings
        .filter(rating => rating.user === user.name)
        .map(rating => ({
          ...rating,
          restaurantName: restaurant.name
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const calculateUserStats = () => {
    const ratings = getUserRatings()
    const totalRatings = ratings.length
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0

    // Calculate favorite restaurant (highest rated)
    const restaurantRatings = restaurants.map(restaurant => ({
      name: restaurant.name,
      rating: restaurant.ratings
        .filter(r => r.user === user?.name)
        .reduce((sum, r) => sum + r.rating, 0) / 
        restaurant.ratings.filter(r => r.user === user?.name).length || 0
    }))

    const favoriteRestaurant = restaurantRatings
      .filter(r => r.rating > 0)
      .sort((a, b) => b.rating - a.rating)[0] || { name: 'None', rating: 0 }

    const ratingDistribution = ratings.reduce((acc, rating) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 p-8">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-base-200 p-8">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error || 'User not found'}</span>
        </div>
      </div>
    )
  }

  const stats = calculateUserStats()
  const ratings = getUserRatings()

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/restaurants" className="btn btn-ghost mb-8">
          ← Back to Restaurants
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-32 h-32 rounded-full overflow-hidden">
                <img
                  src={getProfileImage(user)}
                  alt={`${user.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">{user.name}</h1>
                <p className="text-base-content opacity-70">
                  {stats.totalRatings} ratings submitted
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="stat bg-base-200 rounded-box">
                <div className="stat-title">Average Rating</div>
                <div className="stat-value text-primary">
                  {stats.averageRating.toFixed(1)}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-box">
                <div className="stat-title">Total Ratings</div>
                <div className="stat-value text-primary">
                  {stats.totalRatings}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-box">
                <div className="stat-title">Favorite Restaurant</div>
                <div className="stat-value text-primary text-lg">
                  {stats.favoriteRestaurant.name}
                </div>
                <div className="stat-desc">
                  Rated {stats.favoriteRestaurant.rating.toFixed(1)} ⭐
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Rating Distribution</h2>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex-1">
                    <div className="text-center text-sm mb-1">{rating} ⭐</div>
                    <div className="h-24 bg-base-200 rounded-lg relative">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ 
                          height: `${((stats.ratingDistribution[rating] || 0) / stats.totalRatings) * 100}%` 
                        }}
                        transition={{ delay: 0.5 }}
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

            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Ratings</h2>
              <div className="space-y-4">
                {ratings.map((rating, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-base-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-primary">
                          {rating.restaurantName}
                        </h3>
                        <p className="text-sm text-base-content opacity-70">
                          {new Date(rating.date).toLocaleDateString()}
                        </p>
                        {rating.comment && (
                          <p className="mt-2 text-base-content">
                            {rating.comment}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-warning">⭐</span>
                        <span className="font-semibold">{rating.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 