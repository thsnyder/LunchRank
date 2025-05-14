'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { submitRating, getUsers, getLocations } from '@/lib/airtable'
import type { Location, User } from '@/lib/airtable'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'

export default function Home() {
  const [name, setName] = useState('')
  const [restaurant, setRestaurant] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, locationsData] = await Promise.all([
          getUsers(),
          getLocations()
        ])
        setUsers(usersData)
        setLocations(locationsData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      }
    }
    fetchData()
  }, [])

  const getProfileImage = (user: User | undefined) => {
    if (!user) return null
    if (user.profilePic && user.profilePic.length > 0) {
      return user.profilePic[0].url
    }
    // Return a random cat image if no profile pic
    return `https://cataas.com/cat?random=${Math.random()}`
  }

  const selectedUser = users.find(u => u.name === name)
  const selectedRestaurant = locations.find(l => l.name === restaurant)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      await submitRating({
        name,
        restaurant,
        rating,
        comment
      })
      setSuccess(true)
      // Reset form
      setName('')
      setRestaurant('')
      setRating(0)
      setComment('')
      // Refresh names list
      const updatedNames = await getUsers()
      setUsers(updatedNames)
      // Redirect to restaurants page after 2 seconds
      setTimeout(() => {
        router.push('/restaurants')
      }, 2000)
    } catch (err) {
      console.error('Error submitting rating:', err)
      setError('Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
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

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card bg-base-100 shadow-xl"
        >
          <div className="card-body">
            <h1 className="text-4xl font-bold text-center mb-8 text-primary">
              🍽️ Rate Your Lunch
            </h1>

            {error && (
              <div className="alert alert-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Rating submitted successfully! Redirecting to restaurants page... 🚀</span>
        </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-primary">👤 Your Name</span>
                </label>
                <div className="flex items-center gap-4">
                  <select
                    className="select select-bordered w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  >
                    <option value="">Select your name</option>
                    {users.map((user) => (
                      <option key={user.name} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  {selectedUser && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-16 h-16 rounded-full overflow-hidden"
        >
                      <img
                        src={getProfileImage(selectedUser) || ''}
                        alt={`${selectedUser.name}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-primary">🏪 Restaurant</span>
                </label>
                <div className="flex items-center gap-4">
                  <select
                    className="select select-bordered w-full"
                    value={restaurant}
                    onChange={(e) => setRestaurant(e.target.value)}
                    required
                  >
                    <option value="">Select a restaurant</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.name}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  {selectedRestaurant && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-16 h-16 rounded-xl overflow-hidden bg-base-200 flex items-center justify-center"
                    >
                      {selectedRestaurant.logo && selectedRestaurant.logo.length > 0 ? (
                        <img
                          src={selectedRestaurant.logo[0].url}
                          alt={selectedRestaurant.name}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-4xl">🍽️</span>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              <motion.div 
                className="form-control"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label className="label">
                  <span className="label-text text-primary">⭐ Rating</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value, index) => (
                    <motion.button
                      key={value}
                      type="button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9, rotate: -5 }}
                      className={`btn btn-circle text-2xl ${
                        rating >= value ? 'btn-primary' : 'btn-ghost'
                      }`}
                      onClick={() => setRating(value)}
                    >
                      {value}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                className="form-control"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label className="label">
                  <span className="label-text text-primary">💭 Comments</span>
                </label>
                <motion.textarea
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  whileFocus={{ scale: 1.02 }}
                  className="textarea textarea-bordered h-24"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you think? (optional)"
                />
              </motion.div>

              <motion.div 
                className="form-control mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 8px rgba(238, 43, 56, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <motion.span 
                      className="loading loading-spinner loading-sm"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    'Submit Rating'
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 8px rgba(161, 141, 140, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/restaurants')}
                className="btn btn-ghost"
              >
                View All Restaurants
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
