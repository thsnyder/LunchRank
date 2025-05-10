'use client'

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BubbleController
} from 'chart.js'
import { Bubble } from 'react-chartjs-2'
import type { Restaurant } from '@/lib/airtable'

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, BubbleController)

interface RatingBubblePlotProps {
  restaurants: Restaurant[]
}

export default function RatingBubblePlot({ restaurants }: RatingBubblePlotProps) {
  const data = {
    datasets: restaurants.map(restaurant => ({
      label: restaurant.name,
      data: [{
        x: restaurant.ratings.length,
        y: restaurant.averageRating,
        r: Math.max(restaurant.ratings.length / 2, 5) // Bubble size based on number of ratings
      }],
      backgroundColor: `rgba(238, 43, 56, ${0.6})`, // Using primary color with opacity
      borderColor: 'rgba(238, 43, 56, 1)',
      borderWidth: 1,
    }))
  }

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: 'Average Rating'
        }
      },
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Ratings'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const restaurant = restaurants[context.datasetIndex]
            return [
              `Restaurant: ${restaurant.name}`,
              `Average Rating: ${restaurant.averageRating.toFixed(1)}`,
              `Number of Ratings: ${restaurant.ratings.length}`
            ]
          }
        }
      }
    }
  }

  return (
    <div className="w-full h-[400px] p-4">
      <Bubble data={data} options={options} />
    </div>
  )
} 