import Airtable from 'airtable'

// Debug logging for environment variables
console.log('Environment Variables Check:', {
  hasApiKey: !!process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
  apiKeyLength: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY?.length,
  hasBaseId: !!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
  baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID
})

// Initialize Airtable with environment variables
const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY!
const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!

if (!apiKey || !baseId) {
  console.error('Missing environment variables:', {
    apiKey: !!apiKey,
    baseId: !!baseId
  })
  throw new Error('Missing required Airtable environment variables')
}

// Initialize Airtable
const base = new Airtable({
  apiKey: apiKey,
}).base(baseId)

export interface LunchRating {
  name: string
  restaurant: string
  rating: number
  comment: string
}

export interface AirtableAttachment {
  id: string
  url: string
  filename: string
  size: number
  type: string
}

export interface Location {
  id: string
  name: string
  averageRating: number
  ratingCount: number
  logo: AirtableAttachment[] | null
  ratings?: Array<{
    username: string
    rating: number
    comment?: string
    date: string
  }>
}

export interface Rating {
  user: string
  rating: number
  comment?: string
  date: string
}

export interface Restaurant {
  id: string
  name: string
  address: string
  cuisine: string
  cuisineType: string
  priceRange: string
  averageRating: number
  ratings: Rating[]
  logo: AirtableAttachment[] | null
  menu: string | null
}

export interface NewRestaurant {
  name: string
  cuisineType: string
  menu?: string
  logo?: File
}

export interface User {
  name: string
  profilePic: AirtableAttachment[] | null
}

// Test the Airtable connection
async function testConnection() {
  try {
    console.log('Testing Airtable connection with:', {
      baseId: baseId,
      apiKeyLength: apiKey.length
    })

    const records = await base('LunchRatings').select({
      maxRecords: 1
    }).firstPage()
    
    console.log('Airtable connection successful:', records)
    return true
  } catch (error: any) {
    console.error('Airtable connection test failed:', {
      message: error.message,
      error: error,
      status: error.status,
      details: error.error?.message || error.details,
      baseId: baseId,
      apiKeyLength: apiKey.length
    })
    return false
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const records = await base('Users')
      .select({
        fields: ['Name', 'ProfilePic'],
        sort: [{ field: 'Name', direction: 'asc' }],
      })
      .all()

    // Get names and profile pics
    const users = records
      .map(record => ({
        name: record.get('Name') as string,
        profilePic: record.get('ProfilePic') as AirtableAttachment[] | null
      }))
      .filter((user): user is User => typeof user.name === 'string' && user.name.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name))

    return users
  } catch (error: any) {
    console.error('Error fetching users:', {
      message: error.message,
      error: error,
      status: error.status,
      details: error.error?.message || error.details
    })
    throw new Error(error.message || 'Failed to fetch users')
  }
}

export async function getLocations(): Promise<Location[]> {
  try {
    // First, get all locations
    const locationRecords = await base('LunchLocations').select({
      sort: [{ field: 'AverageRating', direction: 'desc' }]
    }).all()

    // Then, get all ratings
    const ratingRecords = await base('LunchRatings').select({
      sort: [{ field: 'Date', direction: 'desc' }]
    }).all()

    // Create a map of ratings by location name
    const ratingsByLocation = ratingRecords.reduce((acc, record) => {
      const locationName = record.get('Location') as string
      if (!locationName) return acc

      if (!acc[locationName]) {
        acc[locationName] = []
      }

      acc[locationName].push({
        username: record.get('Username') as string,
        rating: Number(record.get('Rating')) || 0,
        comment: record.get('Comment') as string || undefined,
        date: record.get('Date') as string || new Date().toISOString()
      })

      return acc
    }, {} as Record<string, Array<{ username: string; rating: number; comment?: string; date: string }>>)

    // Map locations with their ratings
    return locationRecords.map(record => {
      const locationName = record.get('LocationName') as string
      return {
        id: record.id,
        name: locationName,
        averageRating: Number(record.get('AverageRating')) || 0,
        ratingCount: Number(record.get('RatingCount')) || 0,
        logo: record.get('Logo') as AirtableAttachment[] | null,
        ratings: ratingsByLocation[locationName] || []
      }
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    throw new Error('Failed to fetch locations')
  }
}

export async function submitRating(rating: LunchRating) {
  try {
    // Test connection first
    const isConnected = await testConnection()
    if (!isConnected) {
      throw new Error('Could not connect to Airtable. Please check your API key and base ID.')
    }

    console.log('Attempting to submit rating to Airtable:', {
      baseId: baseId,
      tableName: 'LunchRatings',
      fields: {
        Username: rating.name,
        Location: rating.restaurant,
        Rating: rating.rating,
        Comment: rating.comment
      }
    })

    const record = await base('LunchRatings').create([
      {
        fields: {
          Username: rating.name,
          Location: rating.restaurant,
          Rating: rating.rating,
          Comment: rating.comment
        },
      },
    ])
    return record
  } catch (error: any) {
    console.error('Error submitting rating:', {
      message: error.message,
      error: error,
      status: error.status,
      details: error.error?.message || error.details,
      baseId: baseId,
      tableName: 'LunchRatings'
    })
    throw new Error(error.message || 'Failed to submit rating')
  }
}

export async function getRatings() {
  try {
    const records = await base('LunchRatings')
      .select({
        sort: [{ field: 'Date', direction: 'desc' }],
      })
      .all()
    return records
  } catch (error: any) {
    console.error('Error fetching ratings:', {
      message: error.message,
      error: error,
      status: error.status,
      details: error.error?.message || error.details
    })
    throw new Error(error.message || 'Failed to fetch ratings')
  }
}

export async function getRestaurants(): Promise<Restaurant[]> {
  try {
    // First, get all locations
    const locationRecords = await base('LunchLocations').select({
      sort: [{ field: 'AverageRating', direction: 'desc' }]
    }).all()

    // Then, get all ratings
    const ratingRecords = await base('LunchRatings').select({
      sort: [{ field: 'Date', direction: 'desc' }]
    }).all()

    // Create a map of ratings by location name
    const ratingsByLocation = ratingRecords.reduce((acc, record) => {
      const locationName = record.get('Location') as string
      if (!locationName) return acc

      if (!acc[locationName]) {
        acc[locationName] = []
      }

      acc[locationName].push({
        user: record.get('Username') as string,
        rating: Number(record.get('Rating')) || 0,
        comment: record.get('Comment') as string || undefined,
        date: record.get('Date') as string || new Date().toISOString()
      })

      return acc
    }, {} as Record<string, Rating[]>)

    // Map locations with their ratings
    return locationRecords.map(record => {
      const locationName = record.get('LocationName') as string
      return {
        id: record.id,
        name: locationName,
        address: record.get('Address') as string || '',
        cuisine: record.get('Cuisine') as string || 'Unknown',
        cuisineType: record.get('CuisineType') as string || 'Unknown',
        priceRange: record.get('PriceRange') as string || '$$',
        averageRating: Number(record.get('AverageRating')) || 0,
        ratings: ratingsByLocation[locationName] || [],
        logo: record.get('Logo') as AirtableAttachment[] | null,
        menu: record.get('Menu') as string || null
      }
    })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    throw new Error('Failed to fetch restaurants')
  }
}

export async function createRestaurant(restaurant: NewRestaurant): Promise<Restaurant> {
  try {
    // Create the restaurant record
    const record = await base('LunchLocations').create({
      LocationName: restaurant.name,
      CuisineType: restaurant.cuisineType || 'Unknown',
      Menu: restaurant.menu || null
    })

    // If there's a logo, try to upload it
    if (restaurant.logo) {
      try {
        // Create a FormData object
        const formData = new FormData()
        formData.append('file', restaurant.logo)

        // Upload the file to Airtable
        const uploadResponse = await fetch(`https://api.airtable.com/v0/${baseId}/LunchLocations/${record.id}/attachments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload logo')
        }

        const uploadData = await uploadResponse.json()
        
        // Update the record with the attachment
        await base('LunchLocations').update(record.id, {
          Logo: [{
            id: uploadData.id,
            url: uploadData.url,
            filename: restaurant.logo.name,
            size: restaurant.logo.size,
            type: restaurant.logo.type
          }]
        })
      } catch (error) {
        console.error('Error uploading logo:', error)
        // Continue without the logo if upload fails
      }
    }

    // Return the created restaurant
    return {
      id: record.id,
      name: restaurant.name,
      address: '',
      cuisine: 'Unknown',
      cuisineType: restaurant.cuisineType || 'Unknown',
      priceRange: '$$',
      averageRating: 0,
      ratings: [],
      logo: null, // We'll get the updated logo in the next fetch
      menu: restaurant.menu || null
    }
  } catch (error: any) {
    console.error('Error creating restaurant:', {
      message: error.message,
      error: error,
      status: error.status,
      details: error.error?.message || error.details
    })
    throw new Error(error.message || 'Failed to create restaurant')
  }
} 