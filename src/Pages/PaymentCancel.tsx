import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

// Booking Cancelled Page
export const BookingCancelledPage = () => {
  const [transactionId, setTransactionId] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setTransactionId(urlParams.get('transactionId') || '')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600">
            You have cancelled the payment process.
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="text-sm">
            <p className="text-yellow-800 mb-1">
              <span className="font-semibold">Transaction ID:</span>
            </p>
            <p className="text-yellow-700 font-mono text-xs break-all">
              {transactionId || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Your booking is still pending.</strong>
          </p>
          <p className="text-blue-700 text-sm mt-1">
            You can complete the payment later from your bookings page.
          </p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Complete Payment
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard/my-bookings'}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
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