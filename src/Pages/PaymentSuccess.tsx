import  { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'

// Booking Success Page
export const BookingSuccessPage = () => {
  const [transactionId, setTransactionId] = useState('')
  const [isTest, setIsTest] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    setTransactionId(urlParams.get('transactionId') || '')
    setIsTest(urlParams.get('test') === 'true')
    setError(urlParams.get('error') || '')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your turf booking has been confirmed successfully.
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="text-sm">
            <p className="text-green-800 mb-1">
              <span className="font-semibold">Transaction ID:</span>
            </p>
            <p className="text-green-700 font-mono text-xs break-all">
              {transactionId || 'N/A'}
            </p>
          </div>
          {isTest && (
            <p className="text-orange-600 text-xs mt-2 font-semibold">
              ⚠️ This is a test transaction
            </p>
          )}
          {error && (
            <p className="text-yellow-600 text-xs mt-2">
              Note: Processing error occurred but payment was successful
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => window.location.href = 'dashboard/my-bookings'}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            View My Bookings
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
