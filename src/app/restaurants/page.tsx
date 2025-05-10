'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getLocations } from '@/lib/airtable'
import type { Location } from '@/lib/airtable'
import { motion, AnimatePresence } from 'framer-motion'
import { getRestaurants, Restaurant, Rating, createRestaurant, NewRestaurant, getUsers } from '@/lib/airtable'
import type { User } from '@/lib/airtable'
import RatingBubblePlot from '../components/RatingBubblePlot'
import UserAnalytics from '@/app/components/UserAnalytics'
import { useRouter } from 'next/navigation'

export default function RestaurantsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newRestaurant, setNewRestaurant] = useState<NewRestaurant>({
    name: '',
    address: '',
    cuisine: '',
    cuisineType: '',
    priceRange: '$$'
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations()
        setLocations(data)
      } catch (err) {
        setError('Failed to load restaurants')
        console.error('Error loading restaurants:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocations()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantsData, usersData] = await Promise.all([
          getRestaurants(),
          getUsers()
        ])
        setRestaurants(restaurantsData)
        setUsers(usersData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCardClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRestaurant(null)
  }

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const restaurantData: NewRestaurant = {
        name: newRestaurant.name,
        address: '',
        cuisine: '',
        cuisineType: '',
        priceRange: '$$',
        logo: logoFile || undefined
      }

      const createdRestaurant = await createRestaurant(restaurantData)
      setRestaurants(prev => [...prev, createdRestaurant])
      setIsAddModalOpen(false)
      setNewRestaurant({
        name: '',
        address: '',
        cuisine: '',
        cuisineType: '',
        priceRange: '$$'
      })
      setLogoFile(null)
    } catch (err) {
      console.error('Error creating restaurant:', err)
      setError('Failed to create restaurant. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
    }
  }

  const getProfileImage = (username: string) => {
    const user = users.find(u => u.name === username)
    if (user?.profilePic && user.profilePic.length > 0) {
      return user.profilePic[0].url
    }
    // Return a random cat image if no profile pic
    return `https://cataas.com/cat?random=${Math.random()}`
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

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 p-8">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 p-8 relative">
      {/* Personal Signature */}
      <motion.a 
        href="https://tomsnyder.blog" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="absolute top-6 left-6 z-50 text-sm text-base-content opacity-70 hover:opacity-100 transition-opacity"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
      >
        <div>Made with ❤️ and ☕️</div>
        <div>by Tom Snyder</div>
      </motion.a>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <motion.h1 
            className="text-4xl font-bold text-primary text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🍽️ Lunch Rankings
          </motion.h1>
          <div className="flex gap-4 mt-4">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 8px rgba(161, 141, 140, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/')}
              className="btn btn-ghost"
            >
              Rate a Restaurant
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 8px rgba(161, 141, 140, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsPlotModalOpen(true)}
              className="btn btn-primary"
            >
              📊 Restaurant Analytics
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 8px rgba(161, 141, 140, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAnalytics(true)}
              className="btn btn-primary"
            >
              👥 Rater Analytics
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant, index) => {
            // Determine badge and outline for top 3
            let placeBadge = null;
            let outlineClass = "";
            if (index === 0) {
              placeBadge = <div className="badge badge-lg bg-yellow-400 text-white text-lg mb-2">🥇 First Place</div>;
              outlineClass = "outline outline-4 outline-yellow-400";
            } else if (index === 1) {
              placeBadge = <div className="badge badge-lg bg-gray-300 text-gray-800 text-lg mb-2">🥈 Second Place</div>;
              outlineClass = "outline outline-4 outline-gray-300";
            } else if (index === 2) {
              placeBadge = <div className="badge badge-lg bg-amber-700 text-white text-lg mb-2">🥉 Third Place</div>;
              outlineClass = "outline outline-4 outline-amber-700";
            }
            return (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${outlineClass}`}
                onClick={() => handleCardClick(restaurant)}
              >
                <figure className="px-10 pt-10">
                  {restaurant.logo && restaurant.logo.length > 0 ? (
                    <img
                      src={restaurant.logo[0].url}
                      alt={restaurant.name}
                      className="rounded-xl h-32 object-contain"
                    />
                  ) : (
                    <div className="text-6xl">🍽️</div>
                  )}
                </figure>
                <div className="card-body">
                  {placeBadge}
                  <h2 className="card-title text-2xl text-primary mb-2">
                    {restaurant.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.cuisineType.split(',').map((type, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="badge badge-primary badge-lg"
                      >
                        {type.trim()}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-base-content opacity-70 mb-4">
                    {restaurant.address}
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      <span className="text-xl font-semibold text-primary">
                        {restaurant.averageRating.toFixed(1)}
                      </span>
                      <span className="text-base-content opacity-70">
                        ({restaurant.ratings.length} ratings)
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Add New Restaurant Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: restaurants.length * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="card bg-base-100 border-2 border-dashed border-primary hover:border-primary-focus transition-all duration-300 cursor-pointer"
            onClick={() => {
              setIsAddModalOpen(true)
            }}
          >
            <div className="card-body flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-6xl mb-4">➕</div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                Add New Restaurant
              </h2>
              <p className="text-base-content opacity-70 text-center">
                Click to add a new restaurant to our collection! 🎉
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-base-100 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-primary">
                  {selectedRestaurant.name}
                </h2>
                <button
                  onClick={closeModal}
                  className="btn btn-circle btn-ghost"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    ⭐ Ratings & Reviews
                  </h3>
                  <div className="space-y-4">
                    {selectedRestaurant.ratings.map((rating: Rating, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-base-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <img
                                src={getProfileImage(rating.user)}
                                alt={`${rating.user}'s profile`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-primary">
                                {rating.user}
                              </p>
                              <p className="text-sm text-base-content opacity-70">
                                {new Date(rating.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-warning">⭐</span>
                            <span className="font-semibold">{rating.rating}</span>
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="mt-2 text-base-content opacity-70">{rating.comment}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-base-100 rounded-lg p-6 max-w-2xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-primary">
                  Add New Restaurant
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-circle btn-ghost"
                >
                  ✕
                </button>
              </div>

              <iframe 
                className="airtable-embed" 
                src="https://airtable.com/embed/appuuFPfmLPhhqiYB/pagwrcrSf18CTa7ol/form" 
                frameBorder="0" 
                width="100%" 
                height="533" 
                style={{ background: 'transparent', border: '1px solid #ccc' }}
              />
              
              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    setIsAddModalOpen(false)
                    setIsLoading(true)
                    try {
                      const data = await getRestaurants()
                      setRestaurants(data)
                    } catch (error) {
                      console.error('Error refreshing restaurants:', error)
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  className="btn btn-primary"
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isPlotModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsPlotModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-base-100 rounded-lg p-6 max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-primary">
                  Restaurant Ratings Analysis
                </h2>
                <button
                  onClick={() => setIsPlotModalOpen(false)}
                  className="btn btn-circle btn-ghost"
                >
                  ✕
                </button>
              </div>

              <div className="bg-base-200 rounded-lg p-4">
                <RatingBubblePlot restaurants={restaurants} />
              </div>

              <div className="mt-4 text-sm text-base-content opacity-70">
                <p>• Bubble size represents the number of ratings</p>
                <p>• Y-axis shows the average rating (0-5)</p>
                <p>• X-axis shows the total number of ratings</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAnalytics(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-base-100 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-primary">Rater Analytics</h2>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="btn btn-ghost btn-circle"
                  >
                    ✕
                  </button>
                </div>
                <UserAnalytics users={users} restaurants={restaurants} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 