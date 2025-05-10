'use client'

export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="bg-base-200 p-4 rounded-lg">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify({
            NEXT_PUBLIC_AIRTABLE_API_KEY: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY ? 'Present' : 'Missing',
            NEXT_PUBLIC_AIRTABLE_BASE_ID: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || 'Missing',
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
} 