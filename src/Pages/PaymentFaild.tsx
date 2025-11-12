import { XCircle } from "lucide-react"
import { useEffect, useState } from "react"


// Booking Failed Page
export const BookingFailedPage = () => {
  const [transactionId, setTransactionId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setTransactionId(urlParams.get('transactionId') || '')
    setError(urlParams.get('error') || '')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600">
            Unfortunately, your payment could not be processed.
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-sm">
            <p className="text-red-800 mb-1">
              <span className="font-semibold">Transaction ID:</span>
            </p>
            <p className="text-red-700 font-mono text-xs break-all">
              {transactionId || 'N/A'}
            </p>
          </div>
          {error && (
            <p className="text-red-600 text-xs mt-2">
              Error: {error}
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>What to do next:</strong>
          </p>
          <ul className="text-blue-700 text-sm mt-2 list-disc list-inside text-left">
            <li>Check your payment method details</li>
            <li>Ensure sufficient balance</li>
            <li>Try a different payment method</li>
            <li>Contact support if the issue persists</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
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
