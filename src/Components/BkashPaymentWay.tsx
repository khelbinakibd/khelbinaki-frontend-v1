import  { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, X } from 'lucide-react';

export default function BkashPaymentPage() {
  const [previewImg, setPreviewImg] = useState<string | null>(null);
   const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // ek step back nibe
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-50 flex items-center justify-center font-sans p-4 relative">
      {/* Fullscreen Preview */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <img
            src={previewImg}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain border border-white/20"
          />
          <button
            onClick={() => setPreviewImg(null)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full"
          >
            <X size={22} />
          </button>
        </div>
      )}

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-pink-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <div className="flex items-center gap-3">
            <img src="/src/assets/Bkash-Logo.png" alt="bKash Logo" className="w-10 h-10 rounded-lg bg-white p-1" />
            <div>
              <h1 className="text-lg font-semibold">bKash Manual Payment</h1>
              <p className="text-xs text-pink-100">Complete your payment safely and confirm your order</p>
            </div>
          </div>
          <button onClick={handleBack} className="flex items-center gap-2 text-sm font-medium bg-white/20 hover:bg-white/30 transition px-3 py-1.5 rounded-lg">
            <ArrowLeft size={16} /> Back to Payment Page
          </button>
        </div>

        {/* Main content */}
        <div className="grid md:grid-cols-1 gap-0">
          {/* Left: bKash Steps */}
          <div className="p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-5 border-b pb-2">How to Pay with bKash</h2>

            <ol className="space-y-4 text-sm text-gray-700">
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold">1</div>
                <div>
                  <div className="font-medium text-gray-800">Open your bKash App</div>
                  <div className="text-xs text-gray-500">Login to your bKash account from your mobile.</div>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold">2</div>
                <div>
                  <div className="font-medium text-gray-800">Go to <span className="text-pink-600 font-semibold">Make Payment</span></div>
                  <div className="text-xs text-gray-500">From the menu, select “Make Payment” option.</div>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold">3</div>
                <div>
                  <div className="font-medium text-gray-800">Enter Payment Details</div>
                  <div className="text-xs text-gray-500">Merchant Number: <span className="font-medium text-pink-700">01XXXXXXXXX</span><br/>Amount: <span className="font-medium text-pink-700">(Your Total Amount)</span></div>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold">4</div>
                <div>
                  <div className="font-medium text-gray-800">Get Transaction ID</div>
                  <div className="text-xs text-gray-500">After successful payment, copy the <span className="font-medium">Transaction ID (TXID)</span> shown on screen.</div>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold">5</div>
                <div>
                  <div className="font-medium text-gray-800">Enter TXID & Last 4 Digits</div>
                  <div className="text-xs text-gray-500">In the confirmation form, submit your <span className="font-medium">TXID</span> and the <span className="font-medium">last 4 digits</span> of the number you paid from.</div>
                </div>
              </li>
            </ol>

            {/* Screenshots */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3 text-gray-700">Example Screenshots</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['/src/assets/BkashSS1.jpeg', '/src/assets/BkashSS2.jpeg'].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`bKash Step ${i + 1}`}
                    className="rounded-xl shadow-sm border object-cover w-3/4 sm:w-1/2 mx-auto cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-transform"
                    onClick={() => setPreviewImg(src)}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Tip: Click image to view full size.</p>
            </div>
          </div>     
        </div>
      </div>
    </div>
  );
}
